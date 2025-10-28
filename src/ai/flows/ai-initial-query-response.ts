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
  problem: z.string().describe("A one-liner summarizing the user's legal problem."),
  solution: z.string().describe("A suggested solution or next steps for the user."),
  ipcSections: z.string().describe("Relevant Indian Penal Code (IPC) sections with reference to the problem."),
});
export type AIInitialQueryResponseOutput = z.infer<typeof AIInitialQueryResponseOutputSchema>;

export async function aiInitialQueryResponse(input: AIInitialQueryResponseInput): Promise<AIInitialQueryResponseOutput> {
  return aiInitialQueryResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiInitialQueryResponsePrompt',
  input: {schema: AIInitialQueryResponseInputSchema},
  output: {schema: AIInitialQueryResponseOutputSchema},
  prompt: `You are an AI legal assistant specializing in Indian law. A user has submitted the following legal query:

{{{query}}}

Based on the user's query, provide the following, with specific reference to the Indian Constitution and Indian Penal Code:
1.  **Problem:** A one-sentence summary of the legal issue.
2.  **Solution:** A brief explanation of the possible legal recourse or next steps.
3.  **IPC Sections:** List any relevant Indian Penal Code sections that may apply to this issue.

Do not provide specific legal advice, but provide general legal information based on Indian law.`,
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
