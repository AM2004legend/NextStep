'use server';

/**
 * @fileOverview Suggests alternative colleges based on a student's profile.
 *
 * - suggestColleges - A function that suggests alternative public and private colleges.
 * - SuggestCollegesInput - The input type for the suggestColleges function.
 * - SuggestCollegesOutput - The return type for the suggestColleges function.
 */

import {ai} from '@/ai/genkit';
import {
    SuggestCollegesInputSchema,
    SuggestCollegesOutputSchema,
    type SuggestCollegesInput,
    type SuggestCollegesOutput,
} from '@/ai/schemas/college-recommendation';


export type { SuggestCollegesInput, SuggestCollegesOutput };

export async function suggestColleges(input: SuggestCollegesInput): Promise<SuggestCollegesOutput> {
  return suggestCollegesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCollegesPrompt',
  input: {schema: SuggestCollegesInputSchema},
  output: {schema: SuggestCollegesOutputSchema},
  prompt: `You are an expert career counselor for students in India.

Based on the provided student profile, suggest 3-5 alternative colleges (a mix of public and private).
For each college, provide the required entrance exams, the typical marks/rank needed based on previous years, and an estimated cost breakdown.
Also, provide a detailed breakdown for each suggested college including advantages and disadvantages as compared to the student's choice, and the eligibility criteria.

Student Profile: {{{studentProfile}}}

Output the suggestions in the specified JSON format.
`,
});

const suggestCollegesFlow = ai.defineFlow(
  {
    name: 'suggestCollegesFlow',
    inputSchema: SuggestCollegesInputSchema,
    outputSchema: SuggestCollegesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
