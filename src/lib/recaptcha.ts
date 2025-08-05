
'use server';

import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

interface CreateAssessmentParams {
  token: string;
  recaptchaAction: string;
}

export async function createAssessment({
  token,
  recaptchaAction,
}: CreateAssessmentParams): Promise<number | null> {
  const projectID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  // The reCAPTCHA secret key is used for server-side validation, but the Google Cloud library uses service account authentication.
  // The library doesn't directly take the secret key. It relies on the application's default credentials.
  // We'll proceed assuming the service account has the necessary permissions.

  if (!projectID || !recaptchaKey) {
    throw new Error("reCAPTCHA environment variables are not set.");
  }

  // Create the reCAPTCHA client.
  const client = new RecaptchaEnterpriseServiceClient();
  const projectPath = client.projectPath(projectID);

  // Build the assessment request.
  const request = {
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
        userIpAddress: undefined
      },
    },
    parent: projectPath,
  };

  try {
    const [response] = await client.createAssessment(request);

    // Check if the token is valid.
    if (!response.tokenProperties?.valid) {
      console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`);
      return null;
    }

    // Check if the expected action was executed.
    if (response.tokenProperties?.action === recaptchaAction) {
      if (response.riskAnalysis?.score === undefined || response.riskAnalysis?.score === null) {
        console.log("Risk analysis score not found in response.");
        return null;
      }
      
      console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
      response.riskAnalysis.reasons.forEach((reason) => {
        console.log(reason);
      });

      return response.riskAnalysis.score;
    } else {
      console.log(`The action attribute in your reCAPTCHA tag (${response.tokenProperties?.action}) does not match the action you are expecting to score (${recaptchaAction})`);
      return null;
    }
  } catch (error) {
    console.error("Error creating reCAPTCHA assessment:", error);
    return null;
  }
}

