
'use server';
/**
 * @fileOverview An AI flow that suggests financial products based on transaction data.
 *
 * - suggestFinancialProducts - A function that suggests financial products.
 * - FinancialProductsInput - The input type for the suggestFinancialProducts function.
 * - FinancialProductsOutput - The return type for the suggestFinancialProducts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

export const FinancialProductSchema = z.object({
  productType: z.enum(['Credit Card', 'Business Loan', 'High-Yield Savings Account']).describe("The type of financial product being recommended."),
  productName: z.string().describe("The specific name of the recommended product, e.g., 'Business Cashback Rewards Card'."),
  category: z.string().describe("A brief category for the product, e.g., 'Cashback Rewards' or 'Startup Funding'."),
  recommendationReason: z.string().describe("A concise, one-sentence explanation of why this product is a good fit for the user based on their data."),
  keyFeatures: z.array(z.string()).describe("A list of 2-3 key features or benefits of the product."),
});
export type FinancialProduct = z.infer<typeof FinancialProductSchema>;


export const FinancialProductsInputSchema = z.object({
  transactions: z.array(PlaidTransactionSchema).describe('An array of Plaid bank transactions.'),
});
export type FinancialProductsInput = z.infer<typeof FinancialProductsInputSchema>;

export const FinancialProductsOutputSchema = z.object({
  products: z.array(FinancialProductSchema).describe("A list of recommended financial products, tailored to the user's transaction history."),
});
export type FinancialProductsOutput = z.infer<typeof FinancialProductsOutputSchema>;

export async function suggestFinancialProducts(input: FinancialProductsInput): Promise<FinancialProductsOutput> {
  return suggestFinancialProductsFlow(input);
}

const suggestFinancialProductsPrompt = ai.definePrompt({
    name: 'suggestFinancialProductsPrompt',
    input: { schema: FinancialProductsInputSchema },
    output: { schema: FinancialProductsOutputSchema },
    prompt: `You are an expert financial advisor for a platform called FlowBank. Your role is to act like a recommendation engine similar to Credit Karma.

    Analyze the user's transaction data to identify their financial habits, needs, and potential opportunities. Based on this analysis, recommend up to 3 financial products that would be highly beneficial for them.

    **Transaction Data:**
    {{{json transactions}}}

    **Your Task:**

    1.  **Analyze Spending & Income:** Look for patterns. Do they have high recurring expenses (good for a rewards card)? Are they receiving large, infrequent payments (might need a business loan for cash flow)? Do they have a high savings balance in a low-yield account?
    2.  **Identify Opportunities:** Based on the analysis, identify which types of financial products would be most suitable.
        *   **Credit Card:** Recommend if you see high spending in categories like supplies, travel, or dining. Tailor the card type (e.g., cashback, travel rewards) to their spending.
        *   **Business Loan:** Recommend if you see signs of growth (increasing revenue) but potential cash flow gaps, or large one-off expenses that suggest a need for capital.
        *   **High-Yield Savings Account:** Recommend if the user has a significant amount of cash sitting in what appears to be a standard checking account.
    3.  **Generate Recommendations:** Create a list of 1 to 3 product recommendations. For each product:
        *   Provide a generic but descriptive \`productName\` (e.g., "Premier Business Rewards Card," not "Chase Sapphire").
        *   Write a clear \`recommendationReason\` that directly ties the product to their observed financial behavior. For example, "Because you spend over $2,000 monthly on supplies, a cashback card could earn you significant rewards."
        *   List 2-3 compelling \`keyFeatures\`.

    Your final output must strictly adhere to the defined JSON output schema.`,
});

const suggestFinancialProductsFlow = ai.defineFlow(
    {
        name: 'suggestFinancialProductsFlow',
        inputSchema: FinancialProductsInputSchema,
        outputSchema: FinancialProductsOutputSchema,
    },
    async (input) => {
        if (input.transactions.length < 10) {
            return { products: [] }; // Not enough data for a meaningful recommendation
        }

        // To keep costs and context size down, let's limit the transactions sent to the model.
        const transactionsForAnalysis = input.transactions.slice(0, 200);

        const { output } = await suggestFinancialProductsPrompt({ ...input, transactions: transactionsForAnalysis });
        return output!;
    }
);
