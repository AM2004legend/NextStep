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
    .describe('The student profile including academic background, interests, skills, goals, and learning style.'),
  careerPath: z.string().describe('The chosen career path for the student.'),
  currentSkills: z.string().describe('The student current skills.'),
  skillGaps: z.string().describe('The identified skill gaps for the career path.'),
});
export type GenerateRoadmapInput = z.infer<typeof GenerateRoadmapInputSchema>;


const RoadmapMilestoneSchema = z.object({
  month: z.number().describe("The month number for this milestone (e.g., 1)."),
  title: z.string().describe("A short, descriptive title for the milestone."),
  tasks: z.array(z.string()).describe("A list of specific tasks or actions for this milestone."),
});

const GenerateRoadmapOutputSchema = z.object({
  milestones: z.array(RoadmapMilestoneSchema).describe("A list of milestones, ordered chronologically, for a 6-12 month actionable roadmap."),
});

export type GenerateRoadmapOutput = z.infer<typeof GenerateRoadmapOutputSchema>;

export async function generateRoadmap(input: GenerateRoadmapInput): Promise<GenerateRoadmapOutput> {
  return generateRoadmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRoadmapPrompt',
  input: {schema: GenerateRoadmapInputSchema},
  output: {schema: GenerateRoadmapOutputSchema},
  prompt: `You are a career coach expert in the Indian and global job markets.

  Based on the student profile, chosen career path, current skills, and identified skill gaps, generate a 6-12 month actionable roadmap for the student.
  The roadmap should be broken down into monthly milestones. Each milestone should have a title and a list of specific tasks, resources (courses, certifications, projects).
  
  Student Profile: {{{studentProfile}}}
  Career Path: {{{careerPath}}}
  Current Skills: {{{currentSkills}}}
  Skill Gaps: {{{skillGaps}}}

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
    const {output} = await prompt(input);
    return output!;
  }
);
