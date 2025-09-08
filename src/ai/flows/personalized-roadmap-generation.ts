'use server';

/**
 * @fileOverview Generates a personalized roadmap for a student's chosen career path.
 *
 * - generateRoadmap - A function that generates a 6-12 month actionable roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const GenerateRoadmapInputSchema = z.object({
  studentProfile: z
    .string()
    .describe('The student profile including academic background, interests, and goals.'),
  careerPath: z.string().describe('The chosen career path for the student.'),
  currentSkills: z.string().describe('The student current skills.'),
  skillGaps: z.string().describe('The identified skill gaps for the career path.'),
  learningStyle: z.enum(['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic']).describe("The student's preferred learning style."),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;


const RoadmapMilestoneSchema = z.object({
  month: z.number().describe("The month number for this milestone (e.g., 1)."),
  title: z.string().describe("A short, descriptive title for the milestone."),
  tasks: z.array(z.string()).describe("A list of specific tasks or actions for this milestone."),
});

const GenerateRoadmapOutputSchema = z.object({
  milestones: z.array(RoadmapMilestoneSchema).describe("A list of milestones, ordered chronologically, for a 6-12 month actionable roadmap."),
  audioRoadmap: z.string().optional().describe('Base64 encoded WAV audio file of the roadmap summary for auditory learners.'),
});

export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const textPrompt = ai.definePrompt({
  name: 'generateRoadmapTextPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are a career coach expert in the Indian and global job markets.

  Based on the student profile, chosen career path, current skills, identified skill gaps, and learning style, generate a 6-12 month actionable roadmap for the student.
  The roadmap should be broken down into monthly milestones. Each milestone should have a title and a list of specific tasks, resources (courses, certifications, projects).

  Crucially, you MUST tailor the recommended resources and tasks to the student's learning style.
  - For Visual learners, suggest video tutorials, diagrams, mind maps, and visual-heavy courses.
  - For Auditory learners, recommend podcasts, audiobooks, lectures, and group discussions.
  - For Reading/Writing learners, focus on books, articles, blogs, and tasks involving writing summaries or notes.
  - For Kinesthetic learners, emphasize hands-on projects, workshops, coding exercises, and real-world application of skills.
  
  Student Profile: {{{studentProfile}}}
  Career Path: {{{careerPath}}}
  Current Skills: {{{currentSkills}}}
  Skill Gaps: {{{skillGaps}}}
  Learning Style: {{{learningStyle}}}

  Output the roadmap as a structured JSON object with a list of milestones.
`,
});

const audioPrompt = ai.definePrompt({
    name: 'generateRoadmapAudioPrompt',
    input: { schema: z.object({ milestones: z.array(RoadmapMilestoneSchema) }) },
    prompt: `You are a career coach. Summarize the following roadmap in a conversational and encouraging tone. Speak directly to the student.

    Milestones:
    {{#each milestones}}
    - Month {{month}}: {{title}} - {{#each tasks}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    {{/each}}
    `,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const { output } = await textPrompt(input);
    if (!output) {
      throw new Error('Failed to generate roadmap text.');
    }

    if (input.learningStyle === 'Auditory') {
      const audioPromptText = await audioPrompt({ milestones: output.milestones });

      const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                  voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Algenib' },
                  },
              },
          },
          prompt: audioPromptText,
      });

      if (media?.url) {
          const audioBuffer = Buffer.from(
              media.url.substring(media.url.indexOf(',') + 1),
              'base64'
          );
          output.audioRoadmap = 'data:audio/wav;base64,' + await toWav(audioBuffer);
      }
    }
    
    return output;
  }
);
