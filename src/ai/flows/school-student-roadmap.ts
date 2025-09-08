'use server';

/**
 * @fileOverview Generates a personalized roadmap for a school student's college entrances.
 *
 * - generateSchoolRoadmap - A function that generates a roadmap for college entrances.
 * - GenerateSchoolRoadmapInput - The input type for the generateSchoolRoadmap function.
 * - GenerateSchoolRoadmapOutput - The return type for the generateSchoolRoadmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSchoolRoadmapInputSchema = z.object({
  studentProfile: z
    .string()
    .describe('The student profile including academic background, interests, and target colleges/courses.'),
  learningStyle: z.enum(['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic']).describe("The student's preferred learning style."),
});
export type GenerateSchoolRoadmapInput = z.infer<typeof GenerateSchoolRoadmapInputSchema>;

const SchoolRoadmapMilestoneSchema = z.object({
  quarter: z.number().describe("The quarter number for this milestone (e.g., 1 for Quarter 1)."),
  title: z.string().describe("A short, descriptive title for the milestone (e.g., 'Foundation Building')."),
  tasks: z.array(z.string()).describe("A list of specific tasks, subjects to focus on, or exams to prepare for."),
});


const GenerateSchoolRoadmapOutputSchema = z.object({
  milestones: z.array(SchoolRoadmapMilestoneSchema).describe('A list of quarterly milestones for college entrance preparation.'),
});

export type GenerateSchoolRoadmapOutput = z.infer<typeof GenerateSchoolRoadmapOutputSchema>;

export async function generateSchoolRoadmap(input: GenerateSchoolRoadmapInput): Promise<GenerateSchoolRoadmapOutput> {
  return generateSchoolRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSchoolRoadmapPrompt',
  input: {schema: GenerateSchoolRoadmapInputSchema},
  output: {schema: GenerateSchoolRoadmapOutputSchema},
  prompt: `You are an expert academic advisor for high school students aiming for top colleges in India and abroad.

  Based on the student's profile and learning style, generate a 6-12 month actionable roadmap for college entrance preparation.
  The roadmap should be broken down into quarterly milestones. Each milestone should have a title and a list of specific actions, subjects to focus on, entrance exams to prepare for (like JEE, NEET, SAT, etc.), and recommended study resources.

  Crucially, you MUST tailor the recommended study resources and tasks to the student's learning style.
  - For Visual learners, suggest video lectures, visual aids like charts and diagrams, and platforms like Khan Academy or YouTube.
  - For Auditory learners, recommend audio-based study materials, recorded lectures, and forming study groups for discussion.
  - For Reading/Writing learners, focus on textbooks, reference books, note-taking, and practicing with past exam papers.
  - For Kinesthetic learners, emphasize interactive online labs, hands-on experiments or projects, and practical problem-solving sessions.
  
  Student Profile: {{{studentProfile}}}
  Learning Style: {{{learningStyle}}}

  Output the roadmap as a structured JSON object with a list of quarterly milestones.
`,
});

const generateSchoolRoadmapFlow = ai.defineFlow(
  {
    name: 'generateSchoolRoadmapFlow',
    inputSchema: GenerateSchoolRoadmapInputSchema,
    outputSchema: GenerateSchoolRoadmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
