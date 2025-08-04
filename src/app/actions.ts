
"use server";

import { suggestAllocationPlan, type SuggestAllocationPlanInput } from "@/ai/flows/suggest-allocation-plan";
import { identifyIncome, type IdentifyIncomeInput } from "@/ai/flows/identify-income";
import { z } from "zod";
import { plaidClient } from "@/lib/plaid";
import { Products, TransactionsSyncRequest } from "plaid";
import { CountryCode } from "plaid";

export async function getAISuggestion(input: SuggestAllocationPlanInput) {
    try {
        const result = await suggestAllocationPlan(input);
        
        // The allocationPlan is a stringified JSON, so we need to parse it.
        const plan = JSON.parse(result.allocationPlan);
        
        // Validate the structure of the parsed plan
        const planSchema = z.record(z.string(), z.number());
        const parsedPlan = planSchema.parse(plan);
        
        return {
            success: true,
            plan: parsedPlan,
            explanation: result.breakdownExplanation,
        };
    } catch (error) {
        console.error("Error getting AI suggestion:", error);
        
        let errorMessage = "An unknown error occurred.";
        if (error instanceof SyntaxError) {
            errorMessage = "Failed to parse AI response. The format was unexpected.";
        } else if (error instanceof z.ZodError) {
            errorMessage = "AI response had an invalid data structure.";
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function createLinkToken(accessToken?: string | null) {
    try {
        const tokenRequest: any = {
          user: {
            client_user_id: 'user-id', // This should be a unique ID for the user
          },
          client_name: 'AutoAllocator',
          country_codes: [CountryCode.Us],
          language: 'en',
          webhook: process.env.PLAID_WEBHOOK_URL,
        };

        if (accessToken) {
            tokenRequest.access_token = accessToken;
            tokenRequest.products = [];
        } else {
            tokenRequest.products = [Products.Auth, Products.Transactions];
        }

        const response = await plaidClient.linkTokenCreate(tokenRequest);
    
        return {
            success: true,
            linkToken: response.data.link_token
        };
      } catch (error) {
        console.error("Error creating Plaid link token:", error);
        return { success: false, error: "Failed to create Plaid link token." };
      }
}

export async function exchangePublicToken(publicToken: string) {
    try {
      const response = await plaidClient.itemPublicTokenExchange({
        public_token: publicToken,
      });
  
      const accessToken = response.data.access_token;
      const itemId = response.data.item_id;
  
      return { 
        success: true, 
        accessToken,
        itemId,
        message: "Bank account linked successfully!" 
      };
    } catch (error) {
      console.error("Error exchanging public token:", error);
      return { success: false, error: "Failed to link bank account." };
    }
}

export async function getTransactions(accessToken: string) {
    try {
        let hasMore = true;
        let allTransactions: any[] = [];
        let cursor: string | undefined = undefined;

        // In a real app, you would store and use the cursor to fetch only new transactions.
        // For this prototype, we'll fetch all transactions each time.
        // You might also want to set a date range for the transactions you fetch.

        while(hasMore) {
            const request: TransactionsSyncRequest = {
                access_token: accessToken,
                cursor: cursor,
            };
            const response = await plaidClient.transactionsSync(request);
            const transactions = response.data.added;
            
            allTransactions = allTransactions.concat(transactions);
            hasMore = response.data.has_more;
            cursor = response.data.next_cursor;
        }

        return { success: true, transactions: allTransactions };

    } catch (error) {
        console.error("Error fetching transactions:", error);
        return { success: false, error: "Could not fetch transactions." };
    }
}

export async function findIncomeTransactions(input: IdentifyIncomeInput) {
    try {
        const result = await identifyIncome(input);
        return { success: true, incomeTransactions: result.incomeTransactions };
    } catch (error) {
        console.error("Error identifying income:", error);
        return { success: false, error: "Failed to identify income from transactions." };
    }
}
