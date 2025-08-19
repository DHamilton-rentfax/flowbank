"use server";

import { headers } from "next/headers";
import { getAdminDb, getAdminAuth } from "@/firebase/server";
import type { UserData } from "@/lib/types";
import { Resend } from 'resend';
import { getDocs, collection, addDoc } from "firebase/firestore";

const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to get the current user's UID from the session
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

export async function sendCampaignDigest() {
    const userId = await getUserId();
    const auth = getAdminAuth();
     const db = getAdminDb();
    const runAt = new Date().toISOString();
    let actorEmail = "auto-schedule";

    try {
        // Verify admin privileges if triggered manually
        const currentUserClaims = (await auth.getUser(userId))?.customClaims;
        if (currentUserClaims?.role !== 'admin') {
            throw new Error("You do not have permission to access this action.");
        }
        actorEmail = currentUserClaims.email || actorEmail;
        
        // Fetch data
        const campaignsSnap = await getDocs(collection(db, "campaigns"));
        const usersSnap = await getDocs(collection(db, "users"));
        const usersByEmail = usersSnap.docs.reduce((acc, doc) => {
            const data = doc.data();
            if (data.email) { acc[data.email] = data; }
            return acc;
        }, {} as { [email: string]: UserData });

        const campaignData = campaignsSnap.docs.map(d => {
            const campaign = d.data();
            const user = usersByEmail[campaign.email];
            return {
                Email: campaign.email,
                Offer: campaign.offer,
                SentAt: campaign.sentAt,
                Type: campaign.type,
                Activated: user?.features?.aiTaxCoach ? "Yes" : "No",
                ActivatedAt: user?.aiTrialActivatedAt || "",
                Plan: user?.plan?.id || 'N/A'
            };
        });

        const totalInvites = campaignData.length;
        const totalActivations = campaignData.filter(c => c.Activated === "Yes").length;

        // Send email
        await resend.emails.send({
            from: "FlowBank Digest <digest@flowbank.ai>",
            to: "support@flowbank.ai", // Send to admin
            subject: `Daily Campaign Digest - ${new Date().toLocaleDateString()}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px">
                    <h2>Daily AI Campaign Digest 📈</h2>
                    <p>Here's your summary for today:</p>
                    <ul>
                        <li><strong>Total Invites Sent:</strong> ${totalInvites}</li>
                        <li><strong>Total Activations:</strong> ${totalActivations}</li>
                    </ul>
                    <p>This is a text-only summary. PDF attachment has been removed to avoid server-side library issues.</p>
                    <br/>
                    <p>– The FlowBank System</p>
                </div>
            `,
        });

        await addDoc(collection(db, "cron_runs"), {
            job: "campaign_digest",
            runAt,
            triggeredBy: actorEmail,
            success: true
        });

        return { success: true, message: "Digest sent successfully." };
    } catch (error) {
        console.error("Failed to send digest email:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        
         const currentUserClaims = (await auth.getUser(userId))?.customClaims;
        actorEmail = currentUserClaims?.email || actorEmail;

        await addDoc(collection(db, "cron_runs"), {
            job: "campaign_digest",
            runAt,
            triggeredBy: actorEmail,
            success: false,
            error: errorMessage,
        });

        return { success: false, error: errorMessage };
    }
}