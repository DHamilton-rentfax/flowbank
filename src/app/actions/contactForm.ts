"use server";

export async function submitContactForm(formData: { name: string; email: string; company: string; message: string; }) {
  // In a real application, you would handle the form submission here,
  // e.g., send an email, save to a database, or call a CRM API.
  console.log("New contact form submission:", formData);

  // Simulate a delay and potential error for demonstration
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (formData.email.includes('fail')) {
    throw new Error("Simulated submission failure.");
  }

  // Return a success message or data if needed
  return { success: true, message: "Form submitted successfully!" };
}