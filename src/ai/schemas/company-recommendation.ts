import {z} from 'genkit';

const CompanyInfoSchema = z.object({
    name: z.string().describe('The name of the company.'),
    sector: z.string().describe('The sector of the company (e.g., Public, Private, Startup).'),
    requiredSkills: z.string().describe('The key skills or entrance exams required.'),
    typicalQualifications: z.string().describe('The typical qualifications or experience level needed.'),
    estimatedCtc: z.string().describe('A summary of the estimated annual CTC package.'),
    advantages: z.array(z.string()).describe('The advantages of this company compared to the student\'s goal.'),
    disadvantages: z.array(z.string()).describe('The disadvantages of this company compared to the student\'s goal.'),
    eligibilityCriteria: z.string().describe('The eligibility criteria for applying.'),
  });
  
  export const SuggestCompaniesInputSchema = z.object({
    studentProfile: z
      .string()
      .describe('The student profile including academic background, interests, and skills.'),
    careerGoal: z.string().describe("The student's stated career goal or target company."),
  });
  export type SuggestCompaniesInput = z.infer<typeof SuggestCompaniesInputSchema>;
  
  
  export const SuggestCompaniesOutputSchema = z.object({
      alternatives: z.array(CompanyInfoSchema).describe('A list of alternative company suggestions.'),
  });
  export type SuggestCompaniesOutput = z.infer<typeof SuggestCompaniesOutputSchema>;
  