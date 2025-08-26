// src/ai/flows/suggest-tax-optimizations.ts
"use server";
/**
 * @fileOverview This file defines a Genkit flow for an AI Financial Advisor that analyzes transactions to provide savings advice, identify spending patterns, and suggest tax optimizations.
 *
 * - suggestTaxOptimizations - A function that analyzes transactions and provides comprehensive financial advice.
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

const SavingsSuggestionSchema = z.object({
    title: z.string().describe('A catchy title for the savings suggestion.'),
    suggestion: z.string().describe('A detailed suggestion on how the user can save money.'),
    relatedTransactions: z.array(z.string()).describe('A list of transaction names related to this suggestion.'),
});

const SuggestTaxOptimizationsOutputSchema = z.object({
  potentialDeductions: z.array(DeductionSuggestionSchema).describe('A list of transactions identified as potential tax deductions.'),
  savingsSuggestions: z.array(SavingsSuggestionSchema).describe('A list of actionable savings suggestions based on spending patterns.'),
  spendingSummary: z.string().describe('A high-level summary of spending habits, identifying top categories or notable patterns.'),
  disclaimer: z.string().describe('A standard disclaimer that this is not legal or financial advice.'),
});
export type SuggestTaxOptimizationsOutput = z.infer<typeof SuggestTaxOptimizationsOutputSchema>;

export async function suggestTaxOptimizations(
  input: SuggestTaxOptimizationsInput
): Promise<SuggestTaxOptimizationsOutput> {
  return suggestTaxOptimizationsFlow(input);
}

const analyzeTransactionsPrompt = ai.definePrompt({
  name: 'suggestTaxOptimizationsPrompt',
  input: { schema: SuggestTaxOptimizationsInputSchema },
  output: { schema: SuggestTaxOptimizationsOutputSchema },
  prompt: `You are an AI Financial Advisor for a financial app called FlowBank. Your expertise is in analyzing business transactions to provide actionable advice. You have deep knowledge of the U.S. IRS tax code and common small business financial patterns.

  Your goal is to help a user running a "{{businessType}}" to optimize their finances by analyzing their recent transactions.

  Analyze the following transactions:
  {{#each transactions}}
  - {{name}} (\${{amount}}) on {{date}}
  {{/each}}

  Based on the transactions, provide the following in valid JSON format:
  1.  A "spendingSummary" that gives a brief overview of their spending habits. Point out the largest expense categories or any surprising patterns.
  2.  A list of "potentialDeductions": For each transaction that is likely a business expense, identify it and explain why it's a potential deduction.
  3.  A list of "savingsSuggestions": Identify opportunities for the user to save money. Look for recurring subscriptions they might not need, areas of high spending, or cheaper alternatives. For each suggestion, provide a title, a detailed suggestion, and list the related transactions.
  4.  A "disclaimer" stating that you are an AI assistant and that the user should consult with a qualified professional for official advice. For example: "I am an AI assistant and cannot provide legal tax or financial advice. Please consult a qualified professional for guidance."

  Your entire response must conform to the output JSON schema. Be insightful and encouraging.
`,
});

const suggestTaxOptimizationsFlow = ai.defineFlow(
  {
    name: 'suggestTaxOptimizationsFlow',
    inputSchema: SuggestTaxOptimizationsInputSchema,
    outputSchema: SuggestTaxOptimizationsOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeTransactionsPrompt(input);
    return output!;
  }
);
