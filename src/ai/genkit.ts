import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import "server-only";

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: false,
});
