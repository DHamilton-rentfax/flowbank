
'use server';

interface CreateAssessmentParams {
  token: string;
  recaptchaAction: string;
}

export async function createAssessment({
  token,
}: CreateAssessmentParams): Promise<number | null> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  
  if (!secretKey) {
    console.error("reCAPTCHA secret key is not set.");
    throw new Error("reCAPTCHA secret key is not set.");
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
      // For v2, 'success: true' is the main indicator. We can return a high score
      // to pass the check in the server action.
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
