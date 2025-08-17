
// src/ai/flows/suggest-tax-optimizations.ts
"use server";
/**
 * @fileOverview This file defines a Genkit flow for an AI Tax Coach that suggests tax optimizations based on user transactions.
 *
 * - suggestTaxOptimizations - A function that analyzes transactions and suggests potential deductions.
 * - SuggestTaxOptimizationsInput - The input type for the suggestTaxOptimizations function.
 * - SuggestTaxOptimizationsOutput - The return type for the suggestTaxOptimizations function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TransactionSchema = z.object({
  name: z.string().describe('The merchant or description of the transaction.'),
  amount: z.number().describe('The transaction amount.'),
  date: z.string().describe('The date of the transaction.'),
});

const SuggestTaxOptimizationsInputSchema = z.object({
  businessType: z.string().describe('The type of business (e.g., "Freelance Software Developer", "E-commerce Store").'),
  transactions: z.array(TransactionSchema).describe('An array of financial transactions from the user\'s connected bank account.'),
});
export type SuggestTaxOptimizationsInput = z.infer<typeof SuggestTaxOptimizationsInputSchema>;

const DeductionSuggestionSchema = z.object({
    transactionName: z.string().describe('The name of the transaction that is a potential deduction.'),
    transactionDate: z.string().describe('The date of the potential deduction.'),
    amount: z.number().describe('The amount of the potential deduction.'),
    category: z.string().describe('The suggested tax category for this deduction (e.g., "Office Supplies", "Software Subscription", "Business Travel").'),
    reason: z.string().describe('A brief explanation of why this is a likely tax deduction for the specified business type.'),
});

const SuggestTaxOptimizationsOutputSchema = z.object({
  potentialDeductions: z.array(DeductionSuggestionSchema).describe('A list of transactions identified as potential tax deductions.'),
  summary: z.string().describe('A high-level summary of the tax optimization suggestions and general advice.'),
  disclaimer: z.string().describe('A standard disclaimer that this is not legal tax advice.'),
});
export type SuggestTaxOptimizationsOutput = z.infer<typeof SuggestTaxOptimizationsOutputSchema>;

export async function suggestTaxOptimizations(
  input: SuggestTaxOptimizationsInput
): Promise<SuggestTaxOptimizationsOutput> {
  return suggestTaxOptimizationsFlow(input);
}

const suggestTaxOptimizationsPrompt = ai.definePrompt({
  name: 'suggestTaxOptimizationsPrompt',
  input: { schema: SuggestTaxOptimizationsInputSchema },
  output: { schema: SuggestTaxOptimizationsOutputSchema },
  prompt: `You are an AI Tax Coach for a financial app called AutoAllocator. Your expertise is in analyzing business transactions and identifying potential tax deductions based on the U.S. IRS tax code.

  Your goal is to help a user running a "{{businessType}}" to optimize their taxes by finding write-offs from their list of recent transactions.

  Analyze the following transactions:
  {{#each transactions}}
  - {{name}} (\${{amount}}) on {{date}}
  {{/each}}

  Based on the transactions, provide the following in valid JSON format:
  1.  A list of "potentialDeductions": For each transaction that is likely a business expense, identify it and explain why it's a potential deduction.
  2.  A "summary" of your findings and any other general tax tips relevant to their business type.
  3.  A "disclaimer" stating that you are an AI assistant and that the user should consult with a qualified tax professional for official advice. For example: "I am an AI assistant and cannot provide legal tax advice. Please consult a qualified tax professional or lawyer for guidance."

  Your entire response must conform to the output JSON schema.
`,
});

const suggestTaxOptimizationsFlow = ai.defineFlow(
  {
    name: 'suggestTaxOptimizationsFlow',
    inputSchema: SuggestTaxOptimizationsInputSchema,
    outputSchema: SuggestTaxOptimizationsOutputSchema,
  },
  async (input) => {
    const { output } = await suggestTaxOptimizationsPrompt(input);
    return output!;
  }
);
