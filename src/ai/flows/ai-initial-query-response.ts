'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing an initial AI response to a user's legal query.
 *
 * - aiInitialQueryResponse -  A function that takes a user's legal query and returns an initial AI response.
 * - AIInitialQueryResponseInput - The input type for the aiInitialQueryResponse function.
 * - AIInitialQueryResponseOutput - The output type for the aiInitialQueryResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIInitialQueryResponseInputSchema = z.object({
  query: z.string().describe('The user\u0027s legal query.'),
});
export type AIInitialQueryResponseInput = z.infer<typeof AIInitialQueryResponseInputSchema>;

const AIInitialQueryResponseOutputSchema = z.object({
  initialResponse: z.string().describe('The AI\u0027s initial response to the legal query, including potentially relevant information.'),
});
export type AIInitialQueryResponseOutput = z.infer<typeof AIInitialQueryResponseOutputSchema>;

export async function aiInitialQueryResponse(input: AIInitialQueryResponseInput): Promise<AIInitialQueryResponseOutput> {
  return aiInitialQueryResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiInitialQueryResponsePrompt',
  input: {schema: AIInitialQueryResponseInputSchema},
  output: {schema: AIInitialQueryResponseOutputSchema},
  prompt: `You are an AI legal assistant. A user has submitted the following legal query:

{{{query}}}

Provide an initial response with potentially relevant information to help the user understand the possible scope of their issue.  Be as helpful as possible.  Do not provide specific legal advice, but provide general legal information.`,
});

const aiInitialQueryResponseFlow = ai.defineFlow(
  {
    name: 'aiInitialQueryResponseFlow',
    inputSchema: AIInitialQueryResponseInputSchema,
    outputSchema: AIInitialQueryResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
