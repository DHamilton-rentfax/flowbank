"use server";

import { suggestAllocationPlan } from "@/ai/flows/suggest-allocation-plan";

export async function getAISuggestion(businessType: string) {
    try {
      const result = await suggestAllocationPlan({ businessType });
      return {
        success: true,
        plan: result.allocationPlan,
        explanation: result.breakdownExplanation,
      };
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, error: errorMessage };
    }
}

    