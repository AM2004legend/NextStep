'use server';

/**
 * @fileOverview An AI agent that suggests companies for a given career path.
 *
 * - suggestCompanies - A function that suggests companies.
 * - SuggestCompaniesInput - The input type for the suggestCompanies function.
 * - SuggestCompaniesOutput - The return type for the suggestCompanies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCompaniesInputSchema = z.object({
  careerPath: z.string().describe('The career path the student is interested in.'),
});
export type SuggestCompaniesInput = z.infer<typeof SuggestCompaniesInputSchema>;

const CompanySuggestionSchema = z.object({
    companyName: z.string().describe("The name of the company."),
    industry: z.string().describe("The industry the company belongs to."),
    why: z.string().describe("Why this company is a good choice for this career path."),
    salaryRange: z.string().describe("A typical salary range for entry-to-mid level roles in this career path at this company or in the industry, if specific data isn't available."),
});

const SuggestCompaniesOutputSchema = z.object({
  companies: z.array(CompanySuggestionSchema).describe('A list of 5-10 suggested companies.'),
});
export type SuggestCompaniesOutput = z.infer<typeof SuggestCompaniesOutputSchema>;

export async function suggestCompanies(input: SuggestCompaniesInput): Promise<SuggestCompaniesOutput> {
  return suggestCompaniesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCompaniesPrompt',
  input: {schema: SuggestCompaniesInputSchema},
  output: {schema: SuggestCompaniesOutputSchema},
  prompt: `You are an expert career coach and industry analyst.

  Based on the provided career path, suggest 5-10 top companies (in India and globally) that hire for this role.
  For each company, provide its name, industry, why it's a great place for this career, and a typical salary range for entry-to-mid level roles in this career.

  Career Path: {{{careerPath}}}

  Output the suggestions in JSON format.
`,
});

const suggestCompaniesFlow = ai.defineFlow(
  {
    name: 'suggestCompaniesFlow',
    inputSchema: SuggestCompaniesInputSchema,
    outputSchema: SuggestCompaniesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
