
'use server';
/**
 * @fileOverview An AI flow that generates a blog post based on a topic and transaction data.
 *
 * - generateBlogPost - A function that generates a blog post.
 * - GenerateBlogPostInput - The input type for the generateBlogPost function.
 * - GenerateBlogPostOutput - The return type for the generateBlogPost function.
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

export const GenerateBlogPostInputSchema = z.object({
  topic: z.string().describe('The main topic or title for the blog post.'),
  transactions: z.array(PlaidTransactionSchema).describe('An array of anonymized Plaid bank transactions to analyze for trends.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

export const GenerateBlogPostOutputSchema = z.object({
  title: z.string().describe('The generated title for the blog post.'),
  excerpt: z.string().describe('A short, engaging summary of the blog post, under 160 characters.'),
  content: z.string().describe('The full content of the blog post, formatted as engaging and readable HTML. Use headings (h2), paragraphs (p), lists (ul, li), and bold text (strong) to structure the content.'),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;


export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const generateBlogPostPrompt = ai.definePrompt({
    name: 'generateBlogPostPrompt',
    input: { schema: GenerateBlogPostInputSchema },
    output: { schema: GenerateBlogPostOutputSchema },
    prompt: `You are an expert financial writer and content creator for FlowBank, a financial technology company. Your task is to write an engaging, insightful, and SEO-friendly blog post based on a given topic and a set of anonymized user transaction data.

    **Topic:** {{{topic}}}

    **Anonymized Transaction Data:**
    {{{json transactions}}}

    **Your Task:**

    1.  **Analyze the Data:** Carefully review the provided transaction data to identify patterns, trends, and interesting insights related to the topic. For example, if the topic is about saving, look for common spending categories, income patterns, or potential areas for savings.
    2.  **Write a Compelling Blog Post:** Create a blog post that is helpful, easy to read, and provides actionable advice. The post should be structured with a clear introduction, body, and conclusion.
    3.  **Format as HTML:** The entire 'content' field of your output must be a single string of valid HTML.
        *   Use \`<h2>\` for main section headings.
        *   Use \`<p>\` for paragraphs.
        *   Use \`<ul>\` and \`<li>\` for bulleted lists.
        *   Use \`<strong>\` to emphasize key points.
    4.  **Create a Title and Excerpt:**
        *   **title:** Write a catchy, SEO-friendly title for the post.
        *   **excerpt:** Write a concise summary (under 160 characters) to be used for social media and search engine results.

    Your final output must strictly adhere to the defined JSON schema.`,
});

const generateBlogPostFlow = ai.defineFlow(
    {
        name: 'generateBlogPostFlow',
        inputSchema: GenerateBlogPostInputSchema,
        outputSchema: GenerateBlogPostOutputSchema,
    },
    async (input) => {
        // To keep costs and context size down, let's limit the transactions sent to the model.
        const transactionsForAnalysis = input.transactions.slice(0, 100);

        if (transactionsForAnalysis.length === 0) {
            throw new Error("Cannot generate a blog post without transaction data.");
        }

        const { output } = await generateBlogPostPrompt({ ...input, transactions: transactionsForAnalysis });
        return output!;
    }
);
