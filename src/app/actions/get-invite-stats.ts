"use server";

// Minimal stub; replace with your Firestore query later.
export async function getInviteStats() {
  // Example shape expected by dashboards
  return {
    pendingInvites: 0,
    acceptedInvites: 0,
    lastUpdatedAt: new Date().toISOString(),
  };
}