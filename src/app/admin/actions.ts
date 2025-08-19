'use server';

import { getAdminAuth, getAdminDb } from "@/firebase/server";
import { headers } from 'next/headers';
import { Resend } from 'resend';
import { plans } from "@/lib/plans";
import type { UserPlan } from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

const getUserId = async () => {
    const idToken = headers().get('Authorization')?.split('Bearer ')[1];
    if (!idToken) {
        throw new Error("User not authenticated");
    }
    try {
        const decodedToken = await getAdminAuth().verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        console.error("Error verifying ID token:", error);
        throw new Error("Invalid authentication token.");
    }
};

export async function grantHighestTierPlan(email: string) {
    const auth = getAdminAuth();
    const db = getAdminDb();

    try {
        const user = await auth.getUserByEmail(email);
        const proPlan = plans.find(p => p.id === 'pro');
        if (!proPlan) throw new Error("Pro plan not found in configuration.");

        const userPlan: UserPlan = {
            id: proPlan.id,
            name: proPlan.name,
        };

        // Set in Firestore
        await db.collection("users").doc(user.uid).set({ plan: userPlan }, { merge: true });

        // Set custom claims
        await auth.setCustomUserClaims(user.uid, { plan: proPlan.id, role: 'user' });

        return { success: true, message: `Successfully upgraded ${email} to the ${proPlan.name} plan.` };
    } catch (error) {
        console.error("Error granting plan:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: errorMessage };
    }
}


export async function sendAiTrialInvite(email: string) {
    const userId = await getUserId();
    const auth = getAdminAuth();
    const db = getAdminDb();

    // Verify admin privileges
    const currentUserClaims = (await auth.getUser(userId)).customClaims;
    if (currentUserClaims?.role !== 'admin') {
      throw new Error("You do not have permission to access admin actions.");
    }

    try {
        await resend.emails.send({
          from: "FlowBank <support@flowbank.ai>",
          to: email,
          subject: "🎁 Enjoy 7 Days of AI Financial Coaching on Us",
          html: `
            <div style="font-family: sans-serif; padding: 20px">
              <h2>Hello from FlowBank 👋</h2>
              <p>We noticed you're on a paid plan but haven't explored our AI Financial Advisor yet.</p>
              <p><strong>We'd love to give you a 7-day free trial of our AI-powered coaching and insights — starting now.</strong></p>
              <p>No credit card required, just click below to activate it:</p>
              <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="background:#4A90E2;color:white;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Activate Free Trial</a></p>
              <p>If you have any questions, just reply to this email. Cheers!</p>
              <br />
              <p>– The FlowBank Team</p>
            </div>
          `
        });
    
        await db.collection("campaigns").doc(email).set({
          offer: "7-day AI trial",
          email,
          sentAt: new Date().toISOString(),
          type: "ai_trial_invite"
        }, { merge: true });
    
        return { success: true, message: `Trial invite sent to ${email}.` };

      } catch (error) {
        console.error("Failed to send AI trial email:", error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, message: errorMessage };
    }
}