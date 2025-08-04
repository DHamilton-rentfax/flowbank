
"use server";

import { suggestAllocationPlan, type SuggestAllocationPlanInput } from "@/ai/flows/suggest-allocation-plan";
import { z } from "zod";
import { plaidClient } from "@/lib/plaid";
import { Products } from "plaid";
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

export async function createLinkToken() {
    try {
        const response = await plaidClient.linkTokenCreate({
          user: {
            client_user_id: 'user-id', // This should be a unique ID for the user
          },
          client_name: 'AutoAllocator',
          products: [Products.Auth],
          country_codes: [CountryCode.Us],
          language: 'en',
        });
    
        return {
            success: true,
            linkToken: response.data.link_token
        };
      } catch (error) {
        console.error("Error creating Plaid link token:", error);
        return { success: false, error: "Failed to create Plaid link token." };
      }
}
