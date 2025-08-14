
// src/ai/flows/suggest-allocation-plan.ts
"use server";
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
  allocationPlan: z.object({
    profit: z.number(),
    ownersPay: z.number(),
    taxes: z.number(),
    opex: z.number(),
    marketing: z.number(),
    savings: z.number(),
  })
    .describe(
      'A JSON object with account names as keys and allocation percentages as values.'
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

  Given the business type: {{{businessType}}}, suggest an allocation plan.
  Also provide a breakdown explanation of why this allocation plan is suggested.

  The allocation plan should include common business accounts such as "Profit", "Owner's Pay", "Taxes", "Operating Expenses", "Marketing", and "Savings".
  Ensure that the percentages add up to 100.
  
  Your entire response must conform to the output JSON schema.
  The allocationPlan field must be a valid JSON object. For example:
  {
    "profit": 5,
    "ownersPay": 35,
    "taxes": 15,
    "opex": 35,
    "marketing": 5,
    "savings": 5
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
