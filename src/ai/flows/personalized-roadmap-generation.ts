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

const GenerateRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('A 6-12 month actionable roadmap in Mermaid flowchart syntax.'),
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
  The roadmap should be a flowchart in Mermaid syntax.
  The flowchart should detail specific steps, resources (courses, certifications, projects), and milestones.
  Use subgraphs for different phases (e.g., Month 1-3, Month 4-6).
  Each node in the flowchart should represent a specific action or milestone.

  Student Profile: {{{studentProfile}}}
  Career Path: {{{careerPath}}}
  Current Skills: {{{currentSkills}}}
  Skill Gaps: {{{skillGaps}}}

  Mermaid Roadmap:
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
