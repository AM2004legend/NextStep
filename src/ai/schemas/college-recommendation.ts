import {z} from 'genkit';

const CollegeInfoSchema = z.object({
    name: z.string().describe('The name of the college.'),
    type: z.enum(['Public', 'Private']).describe('The type of the college (Public or Private).'),
    requiredExams: z.string().describe('The entrance exams required for admission.'),
    previousYearRank: z.string().describe('The required rank or marks based on previous years.'),
    costBreakdown: z.string().describe('A summary of the estimated annual cost.'),
    advantages: z.array(z.string()).describe('The advantages of this college compared to the student\'s target.'),
    disadvantages: z.array(z.string()).describe('The disadvantages of this college compared to the student\'s target.'),
    eligibilityCriteria: z.string().describe('The eligibility criteria for admission.'),
  });
  
  export const SuggestCollegesInputSchema = z.object({
    studentProfile: z
      .string()
      .describe('The student profile including academic background, interests, and target colleges/courses.'),
  });
  export type SuggestCollegesInput = z.infer<typeof SuggestCollegesInputSchema>;
  
  
  export const SuggestCollegesOutputSchema = z.object({
      alternatives: z.array(CollegeInfoSchema).describe('A list of alternative college suggestions.'),
  });
  export type SuggestCollegesOutput = z.infer<typeof SuggestCollegesOutputSchema>;
  