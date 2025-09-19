'use server';

/**
 * @fileOverview An AI agent that suggests colleges based on student preferences.
 *
 * - suggestColleges - A function that suggests colleges.
 * - SuggestCollegesInput - The input type for the suggestColleges function.
 * - SuggestCollegesOutput - The return type for the suggestColleges function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCollegesInputSchema = z.object({
  course: z.string().describe('The target course the student wants to pursue.'),
  interests: z.string().describe('The student\'s interests, comma-separated.'),
  preferences: z.string().describe('Any other preferences, like location (e.g., India, USA, UK).'),
});
export type SuggestCollegesInput = z.infer<typeof SuggestCollegesInputSchema>;

const CollegeSuggestionSchema = z.object({
    collegeName: z.string().describe("The name of the college."),
    location: z.string().describe("The location of the college (city, country)."),
    notableFor: z.string().describe("What this college is known for, especially regarding the target course."),
    website: z.string().describe("The official website of the college."),
});

const SuggestCollegesOutputSchema = z.object({
  colleges: z.array(CollegeSuggestionSchema).describe('A list of 5-10 suggested colleges.'),
});
export type SuggestCollegesOutput = z.infer<typeof SuggestCollegesOutputSchema>;

export async function suggestColleges(input: SuggestCollegesInput): Promise<SuggestCollegesOutput> {
  return suggestCollegesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCollegesPrompt',
  input: {schema: SuggestCollegesInputSchema},
  output: {schema: SuggestCollegesOutputSchema},
  prompt: `You are an expert college admissions advisor.

  Based on the student's target course, interests, and preferences, suggest 5-10 colleges in India and abroad.
  For each college, provide its name, location, what it's notable for regarding the course, and its official website.

  Target Course: {{{course}}}
  Interests: {{{interests}}}
  Preferences: {{{preferences}}}

  Output the suggestions in JSON format.
`,
});

const suggestCollegesFlow = ai.defineFlow(
  {
    name: 'suggestCollegesFlow',
    inputSchema: SuggestCollegesInputSchema,
    outputSchema: SuggestCollegesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
