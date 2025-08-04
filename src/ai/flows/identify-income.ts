// src/ai/flows/identify-income.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for identifying income transactions from a list of Plaid transactions.
 *
 * - identifyIncome - A function that takes a list of transactions and returns the ones identified as income.
 * - IdentifyIncomeInput - The input type for the identifyIncome function.
 * - IdentifyIncomeOutput - The return type for the identifyIncome function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define a schema for a single Plaid transaction to ensure type safety.
const PlaidTransactionSchema = z.object({
  account_id: z.string(),
  amount: z.number(),
  iso_currency_code: z.string().nullable(),
  date: z.string(),
  name: z.string(),
  merchant_name: z.string().nullable(),
  pending: z.boolean(),
  payment_channel: z.string(),
  category: z.array(z.string()).nullable(),
});

const IdentifyIncomeInputSchema = z.object({
  transactions: z.array(PlaidTransactionSchema).describe('An array of Plaid transactions.'),
});
export type IdentifyIncomeInput = z.infer<typeof IdentifyIncomeInputSchema>;

const IdentifyIncomeOutputSchema = z.object({
    incomeTransactions: z.array(PlaidTransactionSchema).describe('An array of transactions identified as income.'),
});
export type IdentifyIncomeOutput = z.infer<typeof IdentifyIncomeOutputSchema>;

export async function identifyIncome(
  input: IdentifyIncomeInput
): Promise<IdentifyIncomeOutput> {
  return identifyIncomeFlow(input);
}

const identifyIncomePrompt = ai.definePrompt({
  name: 'identifyIncomePrompt',
  input: {schema: IdentifyIncomeInputSchema},
  output: {schema: IdentifyIncomeOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to identify income deposits from a list of bank transactions.

  Analyze the provided list of transactions:
  {{{json transactions}}}

  Identify transactions that are income. Income is typically characterized by:
  - Positive amounts (credits to the account).
  - Descriptions like "payroll", "deposit", "payment", "salary", "commission", or "customer payment".
  - Recurring deposits from the same source.
  - Do NOT include refunds, transfers from other personal accounts, or small credits like interest payments.

  Return a JSON object containing a list of only the transactions you have identified as income under the key "incomeTransactions".
  Ensure the output format strictly matches the provided schema.
`,
});


const identifyIncomeFlow = ai.defineFlow(
  {
    name: 'identifyIncomeFlow',
    inputSchema: IdentifyIncomeInputSchema,
    outputSchema: IdentifyIncomeOutputSchema,
  },
  async (input) => {
    // In a real application, you might filter for positive amounts first
    // to reduce tokens sent to the model.
    const credits = input.transactions.filter(t => t.amount < 0);
    
    if (credits.length === 0) {
        return { incomeTransactions: [] };
    }

    const {output} = await identifyIncomePrompt({transactions: credits});
    return output!;
  }
);
