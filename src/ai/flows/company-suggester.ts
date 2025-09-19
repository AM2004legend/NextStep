'use server';

/**
 * @fileOverview An AI agent that suggests future career endeavors.
 *
 * - suggestCompanies - A function that suggests companies, government jobs, and other opportunities.
 * - SuggestCompaniesInput - The input type for the suggestCompanies function.
 * - SuggestCompaniesOutput - The return type for the suggestCompanies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCompaniesInputSchema = z.object({
  degree: z.string().describe("The user's highest relevant degree (e.g., B.Tech in Computer Science, MBA)."),
  skills: z.string().describe("The user's current skills, comma-separated."),
  interests: z.string().describe("The user's interests, comma-separated (e.g., public service, technology, defense)."),
});
export type SuggestCompaniesInput = z.infer<typeof SuggestCompaniesInputSchema>;

const OpportunitySuggestionSchema = z.object({
    name: z.string().describe("The name of the company, government organization, or armed forces branch."),
    field: z.string().describe("The industry or sector (e.g., Technology, Public Sector, Defense)."),
    website: z.string().describe("The official recruitment or information website link."),
    description: z.string().describe("A brief description of the opportunity and why it aligns with the user's profile."),
    entryRequirements: z.string().describe("Typical entry requirements, including required exams (e.g., UPSC, CDS, GATE) or key skills."),
    pros: z.array(z.string()).describe("A list of pros for pursuing this career path (e.g., job security, high impact)."),
    cons: z.array(z.string()).describe("A list of cons or challenges (e.g., high competition, demanding work environment)."),
    salaryAndPerks: z.string().describe("An overview of the typical starting salary (CTC for private sector), pay scale (for government), and key perks."),
});

const SuggestCompaniesOutputSchema = z.object({
  opportunities: z.array(OpportunitySuggestionSchema).describe('A list of 5-7 suggested career opportunities, including a mix of corporate, government, and other roles.'),
});
export type SuggestCompaniesOutput = z.infer<typeof SuggestCompaniesOutputSchema>;

export async function suggestCompanies(input: SuggestCompaniesInput): Promise<SuggestCompaniesOutput> {
  return suggestCompaniesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCompaniesPrompt',
  input: {schema: SuggestCompaniesInputSchema},
  output: {schema: SuggestCompaniesOutputSchema},
  prompt: `You are an expert career counselor with deep knowledge of the job market in India and globally, including private companies, government organizations, and the armed forces.

  Based on the user's degree, skills, and interests, suggest 5-7 diverse career opportunities.
  For each opportunity, you MUST provide:
  1.  Name of the organization/entity and its field/sector.
  2.  An official website link for recruitment or information.
  3.  A description of the opportunity and why it's a good fit.
  4.  Entry requirements: Mention necessary exams (like UPSC, GATE, CDS, specific company tests) or essential skills.
  5.  A list of 2-3 key pros.
  6.  A list of 2-3 key cons or challenges.
  7.  Salary & Perks: Provide a realistic starting salary range (CTC for corporate roles) or pay scale information, along with notable benefits.

  User's Degree: {{{degree}}}
  User's Skills: {{{skills}}}
  User's Interests: {{{interests}}}

  Output the suggestions in a structured JSON format.
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
