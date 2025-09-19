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
  degreeLevel: z.string().describe('The level of degree the student is aiming for (e.g., "Postgraduate", "PhD").'),
  interests: z.string().describe('The student\'s interests, comma-separated.'),
  preferences: z.string().describe('Any other preferences, like location (e.g., India, USA, UK) or a desired college to compare against.'),
});
export type SuggestCollegesInput = z.infer<typeof SuggestCollegesInputSchema>;

const CollegeSuggestionSchema = z.object({
    collegeName: z.string().describe("The name of the college."),
    location: z.string().describe("The location of the college (city, country)."),
    notableFor: z.string().describe("What this college is known for, especially regarding the target course."),
    website: z.string().describe("The official website of the college."),
    requiredExams: z.string().describe("The entrance exams required for admission (e.g., GATE, GRE, CAT, JEE Advanced, SAT, NEET)."),
    previousYearCutoff: z.string().describe("An overview of the required score, rank, or percentile based on previous years' data."),
    costBreakdown: z.string().describe("An estimated breakdown of costs, including tuition, and other major fees per year."),
    type: z.enum(['Public', 'Private']).describe("The type of college, either Public or Private."),
});

const SuggestCollegesOutputSchema = z.object({
  colleges: z.array(CollegeSuggestionSchema).describe('A list of 5-10 suggested colleges, including a mix of public and private options if applicable.'),
});
export type SuggestCollegesOutput = z.infer<typeof SuggestCollegesOutputSchema>;

export async function suggestColleges(input: SuggestCollegesInput): Promise<SuggestCollegesOutput> {
  return suggestCollegesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCollegesPrompt',
  input: {schema: SuggestCollegesInputSchema},
  output: {schema: SuggestCollegesOutputSchema},
  prompt: `You are an expert higher education and admissions advisor for students in India and abroad.

  Based on the student's profile, suggest 5-10 relevant colleges. Include a mix of public and private institutions where applicable.
  For each college, you MUST provide:
  1.  Its name, location, and official website.
  2.  What it's notable for regarding the specified course and degree level.
  3.  The required entrance exams (e.g., GATE, GRE, CAT, JEE Advanced, SAT, NEET).
  4.  An overview of the required score, rank, or percentile based on recent trends.
  5.  An estimated annual cost breakdown (tuition, fees).
  6.  Whether it is a 'Public' or 'Private' institution.

  If the user mentions a specific college in their preferences, use it as a benchmark and suggest strong alternatives.

  Target Course: {{{course}}}
  Degree Level: {{{degreeLevel}}}
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
