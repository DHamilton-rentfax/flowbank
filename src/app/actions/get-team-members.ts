"use server";

export async function getTeamMembers() {
  // Placeholder function for fetching team members
  // Replace with actual data fetching logic from your database

  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return [
    { uid: '1', email: 'alice@example.com', role: 'Admin' },
    { uid: '2', email: 'bob@example.com', role: 'Member' },
    // Add more placeholder members as needed
  ];
}