// src/ai/flows/suggest-allocation-plan.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting allocation plans tailored to a user's business type.
 *
 * - suggestAllocationPlan - A function that takes a business type as input and returns a suggested allocation plan.
 * - SuggestAllocationPlanInput - The input type for the suggestAllocationPlan function.
 * - SuggestAllocationPlanOutput - The return type for the suggestAllocationPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAllocationPlanInputSchema = z.object({
  businessType: z
    .string()
    .describe('The type of business for which to suggest an allocation plan.'),
});
export type SuggestAllocationPlanInput = z.infer<typeof SuggestAllocationPlanInputSchema>;

const SuggestAllocationPlanOutputSchema = z.object({
  allocationPlan: z
    .string()
    .describe(
      'A suggested allocation plan as a JSON object with account names and allocation percentages.'
    ),
  breakdownExplanation: z
    .string()
    .describe('An explanation of why this allocation plan is suggested.'),
});
export type SuggestAllocationPlanOutput = z.infer<typeof SuggestAllocationPlanOutputSchema>;

export async function suggestAllocationPlan(
  input: SuggestAllocationPlanInput
): Promise<SuggestAllocationPlanOutput> {
  return suggestAllocationPlanFlow(input);
}

const suggestAllocationPlanPrompt = ai.definePrompt({
  name: 'suggestAllocationPlanPrompt',
  input: {schema: SuggestAllocationPlanInputSchema},
  output: {schema: SuggestAllocationPlanOutputSchema},
  prompt: `You are an expert financial advisor specializing in creating allocation plans for businesses.

  Given the business type: {{{businessType}}}, suggest an allocation plan as a JSON object with account names and allocation percentages.
  Also provide a breakdown explanation of why this allocation plan is suggested.

  The allocation plan should include common business accounts such as "Operating Expenses", "Savings", "Marketing", "Taxes", and "Owner Compensation".
  Ensure that the percentages add up to 100.
  The JSON object should have the following format:
  {
    "Operating Expenses": 30,
    "Savings": 10,
    "Marketing": 15,
    "Taxes": 25,
    "Owner Compensation": 20
  }
  Make sure the percentages add up to 100.
  Ensure that the allocationPlan can be parsed as JSON and that the allocationPlan field contains the JSON object.

  Here is a sample good output (only one JSON object, no leading/trailing text): 
  {
    "allocationPlan": '{
      "Operating Expenses": 30,
      "Savings": 10,
      "Marketing": 15,
      "Taxes": 25,
      "Owner Compensation": 20
    }',
    "breakdownExplanation": "This allocation plan ensures that the business can cover its operating expenses, save for future investments, market its products/services, pay its taxes, and compensate the owner."
  }
`,
});

const suggestAllocationPlanFlow = ai.defineFlow(
  {
    name: 'suggestAllocationPlanFlow',
    inputSchema: SuggestAllocationPlanInputSchema,
    outputSchema: SuggestAllocationPlanOutputSchema,
  },
  async input => {
    const {output} = await suggestAllocationPlanPrompt(input);
    return output!;
  }
);
