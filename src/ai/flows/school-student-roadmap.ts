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
  learningStyle: z.string().describe('The student\'s preferred learning style.'),
});
export type GenerateSchoolRoadmapInput = z.infer<typeof GenerateSchoolRoadmapInputSchema>;

const GenerateSchoolRoadmapOutputSchema = z.object({
  roadmap: z.string().describe('A 6-12 month actionable roadmap in Mermaid flowchart syntax for college entrance preparation.'),
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
  The roadmap should be a flowchart in Mermaid syntax, starting with 'flowchart TD'.
  The flowchart should detail specific subjects to focus on, entrance exams to prepare for (like JEE, NEET, SAT, etc.), recommended study resources (books, online courses), and a timeline with milestones.
  Use subgraphs for different phases (e.g., subgraph "Quarter 1"... end). Do not use colons in subgraph titles.

  Student Profile: {{{studentProfile}}}
  Learning Style: {{{learningStyle}}}

  Mermaid Roadmap:
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
