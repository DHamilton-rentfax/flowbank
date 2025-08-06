
'use server';

interface CreateAssessmentParams {
  token: string;
  recaptchaAction: string; // This is kept for interface consistency but won't be used in v2 verification
}

export async function createAssessment({
  token,
}: CreateAssessmentParams): Promise<number | null> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const projectID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  
  if (!projectID || !recaptchaKey || !secretKey) {
    console.error("reCAPTCHA environment variables are not set.");
    throw new Error("reCAPTCHA environment variables are not set.");
  }
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    if (data.success) {
      console.log('reCAPTCHA verification successful.');
      // Return a high score for success, as v2 doesn't provide a score.
      // The calling function checks for a score > 0.5.
      return 1.0; 
    } else {
      console.error('reCAPTCHA verification failed:', data['error-codes']);
      return null;
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA token:", error);
    return null;
  }
}
