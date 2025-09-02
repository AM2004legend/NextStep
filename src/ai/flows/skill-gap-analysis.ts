'use server';

/**
 * @fileOverview An AI agent that analyzes skill gaps for recommended career paths.
 *
 * - analyzeSkillGaps - A function that handles the skill gap analysis process.
 * - AnalyzeSkillGapsInput - The input type for the analyzeSkillGaps function.
 * - AnalyzeSkillGapsOutput - The return type for the analyzeSkillGaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSkillGapsInputSchema = z.object({
  careerPath: z.string().describe('The recommended career path.'),
  studentSkills: z.array(z.string()).describe('The current skills of the student.'),
});
export type AnalyzeSkillGapsInput = z.infer<typeof AnalyzeSkillGapsInputSchema>;

const AnalyzeSkillGapsOutputSchema = z.object({
  missingTechnicalSkills: z.array(z.string()).describe('The missing technical skills for the career path.'),
  missingSoftSkills: z.array(z.string()).describe('The missing soft skills for the career path.'),
});
export type AnalyzeSkillGapsOutput = z.infer<typeof AnalyzeSkillGapsOutputSchema>;

export async function analyzeSkillGaps(input: AnalyzeSkillGapsInput): Promise<AnalyzeSkillGapsOutput> {
  return analyzeSkillGapsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSkillGapsPrompt',
  input: {schema: AnalyzeSkillGapsInputSchema},
  output: {schema: AnalyzeSkillGapsOutputSchema},
  prompt: `You are a career advisor specializing in identifying skill gaps.

You will receive a recommended career path and the student's current skills. Your task is to identify the missing technical and soft skills required for the student to succeed in the recommended career path.

Career Path: {{{careerPath}}}
Student Skills: {{#each studentSkills}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Identify the missing technical and soft skills. Focus on skills that are crucial for the career path but not present in the student's current skills.
`,
});

const analyzeSkillGapsFlow = ai.defineFlow(
  {
    name: 'analyzeSkillGapsFlow',
    inputSchema: AnalyzeSkillGapsInputSchema,
    outputSchema: AnalyzeSkillGapsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
