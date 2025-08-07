'use server';

/**
 * @fileOverview An AI financial coach that analyzes transactions and provides recommendations.
 *
 * - getFinancialCoaching - A function that analyzes transactions and provides financial advice.
 * - FinancialCoachInput - The input type for the getFinancialCoaching function.
 * - FinancialCoachOutput - The return type for the getFinancialCoaching function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

export const FinancialCoachInputSchema = z.object({
  transactions: z.array(PlaidTransactionSchema).describe('An array of Plaid bank transactions.'),
});
export type FinancialCoachInput = z.infer<typeof FinancialCoachInputSchema>;

export const FinancialCoachOutputSchema = z.object({
  spendingAnalysis: z.string().describe("An analysis of the user's spending habits with actionable recommendations."),
  savingsRecommendations: z.string().describe("Recommendations for savings, including emergency funds and goal-based saving."),
  investmentGuidance: z.string().describe("General guidance on investing, tailored to a small business owner or freelancer."),
  taxBestPractices: z.string().describe("A summary of tax best practices and tips relevant to the user's financial activity."),
});
export type FinancialCoachOutput = z.infer<typeof FinancialCoachOutputSchema>;


export async function getFinancialCoaching(input: FinancialCoachInput): Promise<FinancialCoachOutput> {
  return financialCoachFlow(input);
}

const financialCoachPrompt = ai.definePrompt({
    name: 'financialCoachPrompt',
    input: { schema: FinancialCoachInputSchema },
    output: { schema: FinancialCoachOutputSchema },
    prompt: `You are an expert financial coach and tax advisor for small business owners and freelancers. Your task is to analyze a user's bank transactions and provide clear, actionable advice.

    Analyze the provided list of transactions:
    {{{json transactions}}}

    Based on the transactions, provide the following:

    1.  **Spending Analysis**: Identify key spending categories. Highlight areas where the user might be overspending and offer specific, practical tips for them to reduce expenses without harming their business.
    2.  **Savings Recommendations**: Based on their income and spending, recommend a savings strategy. Suggest how much to put towards an emergency fund, long-term goals, and general savings.
    3.  **Investment Guidance**: Provide general advice on investment options suitable for a small business owner, such as SEP-IRAs, Solo 401(k)s, or standard brokerage accounts. Do not give specific stock recommendations.
    4.  **Tax Best Practices**: This is the most critical section. Provide advice on U.S. tax best practices. **You MUST use the official U.S. Tax Code as your primary source of information to ensure accuracy. You can access it here: https://www.law.cornell.edu/uscode/text/26**. Your advice should cover topics like estimating quarterly taxes, identifying common deductible business expenses from the transaction list, and the importance of keeping business and personal finances separate.

    Structure your entire response to fit the output schema perfectly. Provide your response in markdown format within each field.`,
});

const financialCoachFlow = ai.defineFlow(
    {
        name: 'financialCoachFlow',
        inputSchema: FinancialCoachInputSchema,
        outputSchema: FinancialCoachOutputSchema,
    },
    async (input) => {
        if (input.transactions.length === 0) {
            return {
                spendingAnalysis: "No transactions provided. Please sync your bank account to get an analysis.",
                savingsRecommendations: "Connect your bank account to receive personalized savings recommendations.",
                investmentGuidance: "Link your financial data for tailored investment guidance.",
                taxBestPractices: "Sync your transactions to get AI-powered tax tips based on your activity."
            };
        }
        const { output } = await financialCoachPrompt(input);
        return output!;
    }
);
