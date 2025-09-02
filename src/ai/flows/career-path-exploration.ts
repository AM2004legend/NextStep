'use server';

/**
 * @fileOverview An AI agent to explore career paths and their required skills.
 *
 * - exploreCareerPaths - A function that handles the career path exploration process.
 * - CareerPathExplorationInput - The input type for the exploreCareerPaths function.
 * - CareerPathExplorationOutput - The return type for the exploreCareerPaths function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerPathExplorationInputSchema = z.object({
  interests: z
    .string()
    .describe('The interests of the student, comma separated.'),
  skills: z.string().describe('The current skills of the student, comma separated.'),
  goals: z.string().describe('The career goals of the student.'),
  academicBackground: z
    .string()
    .describe('The academic background of the student.'),
});
export type CareerPathExplorationInput = z.infer<
  typeof CareerPathExplorationInputSchema
>;

const SkillRequirementSchema = z.object({
  careerPath: z.string().describe('The career path.'),
  skills: z
    .array(z.string())
    .describe(
      'A list of missing technical and soft skills for this career path based on the student current skill set.'
    ),
});

const CareerPathExplorationOutputSchema = z.object({
  recommendations: z
    .array(SkillRequirementSchema)
    .describe(
      'A list of 3-5 career recommendations, each with a career path and the required skills.'
    ),
});

export type CareerPathExplorationOutput = z.infer<
  typeof CareerPathExplorationOutputSchema
>;

export async function exploreCareerPaths(
  input: CareerPathExplorationInput
): Promise<CareerPathExplorationOutput> {
  return careerPathExplorationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerPathExplorationPrompt',
  input: {schema: CareerPathExplorationInputSchema},
  output: {schema: CareerPathExplorationOutputSchema},
  prompt: `You are a career counselor specializing in recommending career paths to students based on their profiles.

You will use the following information to suggest 3-5 career options aligned with the student profile, tailored to the Indian and global job markets, and the missing technical and soft skills for each recommended career path based on the student current skill set.

Interests: {{{interests}}}
Skills: {{{skills}}}
Goals: {{{goals}}}
Academic Background: {{{academicBackground}}}

Output the career paths and skill requirements in JSON format.`,
});

const careerPathExplorationFlow = ai.defineFlow(
  {
    name: 'careerPathExplorationFlow',
    inputSchema: CareerPathExplorationInputSchema,
    outputSchema: CareerPathExplorationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
