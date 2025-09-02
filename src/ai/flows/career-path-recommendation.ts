'use server';

/**
 * @fileOverview A career path recommendation AI agent.
 *
 * - careerPathRecommendation - A function that handles the career path recommendation process.
 * - CareerPathRecommendationInput - The input type for the careerPathRecommendation function.
 * - CareerPathRecommendationOutput - The return type for the careerPathRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerPathRecommendationInputSchema = z.object({
  academicBackground: z.string().describe('The student\'s academic background.'),
  interests: z.string().describe('The student\'s interests.'),
  skills: z.string().describe('The student\'s skills.'),
  goals: z.string().describe('The student\'s goals.'),
});
export type CareerPathRecommendationInput = z.infer<typeof CareerPathRecommendationInputSchema>;

const CareerPathRecommendationOutputSchema = z.object({
  careerOptions: z.array(z.string()).describe('A list of 3-5 career options tailored to the student\'s profile and the Indian and global job markets.'),
});
export type CareerPathRecommendationOutput = z.infer<typeof CareerPathRecommendationOutputSchema>;

export async function careerPathRecommendation(input: CareerPathRecommendationInput): Promise<CareerPathRecommendationOutput> {
  return careerPathRecommendationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerPathRecommendationPrompt',
  input: {schema: CareerPathRecommendationInputSchema},
  output: {schema: CareerPathRecommendationOutputSchema},
  prompt: `You are a career counselor specializing in recommending career paths to students based on their profile.

  Analyze the following student profile and suggest 3-5 career options tailored to their profile and the Indian and global job markets.

  Academic Background: {{{academicBackground}}}
  Interests: {{{interests}}}
  Skills: {{{skills}}}
  Goals: {{{goals}}}

  Return the career options as a list of strings.
  `,
});

const careerPathRecommendationFlow = ai.defineFlow(
  {
    name: 'careerPathRecommendationFlow',
    inputSchema: CareerPathRecommendationInputSchema,
    outputSchema: CareerPathRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
