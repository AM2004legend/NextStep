'use server';

/**
 * @fileOverview Suggests alternative companies based on a student's profile.
 *
 * - suggestCompanies - A function that suggests alternative public and private companies.
 * - SuggestCompaniesInput - The input type for the suggestCompanies function.
 * - SuggestCompaniesOutput - The return type for the suggestCompanies function.
 */

import {ai} from '@/ai/genkit';
import {
    SuggestCompaniesInputSchema,
    SuggestCompaniesOutputSchema,
    type SuggestCompaniesInput,
    type SuggestCompaniesOutput,
} from '@/ai/schemas/company-recommendation';


export type { SuggestCompaniesInput, SuggestCompaniesOutput };

export async function suggestCompanies(input: SuggestCompaniesInput): Promise<SuggestCompaniesOutput> {
  return suggestCompaniesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCompaniesPrompt',
  input: {schema: SuggestCompaniesInputSchema},
  output: {schema: SuggestCompaniesOutputSchema},
  prompt: `You are an expert career counselor and recruitment specialist for students and graduates in India.

Based on the provided student profile, suggest 3-5 alternative companies (a mix of public sector, private sector, and startups).
For each company, provide the required skills or exams, typical qualifications needed, and an estimated CTC package range.
Also, provide a detailed breakdown for each suggested company including advantages and disadvantages as compared to the student's ideal role/company, and the eligibility criteria.

Student Profile: {{{studentProfile}}}
Career Goal: {{{careerGoal}}}

Output the suggestions in the specified JSON format.
`,
});

const suggestCompaniesFlow = ai.defineFlow(
  {
    name: 'suggestCompaniesFlow',
    inputSchema: SuggestCompaniesInputSchema,
    outputSchema: SuggestCompaniesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
