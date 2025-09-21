'use server';

/**
 * @fileOverview Generates a personalized roadmap for a student's chosen career path.
 *
 * - generateRoadmap - A function that generates a 6-12 month actionable roadmap.
 * - GenerateRoadmapInput - The input type for the generateRoadmap function.
 * - GenerateRoadmapOutput - The return type for the generateRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  tasks: z.array(z.string()).describe("A list of specific, detailed tasks or actions for this milestone, including links to free resources like articles, tutorials, or projects."),
});

const GenerateRoadmapOutputSchema = z.object({
  milestones: z.array(RoadmapMilestoneSchema).describe("A list of milestones, ordered chronologically, for a 6-12 month actionable roadmap."),
});

export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapTextPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: z.object({ milestones: z.array(RoadmapMilestoneSchema) })},
  prompt: `You are a career coach expert in the Indian and global job markets.

  Based on the student profile, chosen career path, current skills, identified skill gaps, and learning style, generate a 6-12 month actionable roadmap.
  The roadmap should be broken down into monthly milestones. Each milestone should have a title and a list of specific, detailed tasks.
  
  For each task, you MUST provide guidance and links to high-quality, FREE resources (e.g., articles, YouTube videos, GitHub projects, free courses).

  Crucially, you MUST tailor the recommended resources and tasks to the student's learning style.
  - For Visual learners, suggest video tutorials, diagrams, mind maps, and visual-heavy courses.
  - For Auditory learners, recommend podcasts, audiobooks, lectures, and group discussions.
  - For Reading/Writing learners, suggest books, articles, blogs, and written tutorials.
  - For Kinesthetic learners, recommend hands-on projects, coding exercises, workshops, and real-world applications.
  
  Student Profile: {{{studentProfile}}}
  Career Path: {{{careerPath}}}
  Current Skills: {{{currentSkills}}}
  Skill Gaps: {{{skillGaps}}}
  Learning Style: {{{learningStyle}}}

  Output the roadmap as a structured JSON object with a list of milestones.
`,
});

const generateRoadmapFlow = ai.defineFlow(
  {
    name: 'generateRoadmapFlow',
    inputSchema: GenerateRoadmapInputSchema,
    outputSchema: GenerateRoadmapOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate roadmap text.');
    }
    
    return {
      milestones: output.milestones,
    };
  }
);
