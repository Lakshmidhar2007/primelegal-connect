'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIChatResponseInputSchema = z.object({
  lawyerName: z.string().describe("The name of the lawyer."),
});
export type AIChatResponseInput = z.infer<typeof AIChatResponseInputSchema>;

const AIChatResponseOutputSchema = z.object({
  response: z.string().describe("The AI's welcome message."),
});
export type AIChatResponseOutput = z.infer<typeof AIChatResponseOutputSchema>;


export async function aiChatResponse(input: AIChatResponseInput): Promise<AIChatResponseOutput> {
  return aiChatResponseFlow(input);
}


const prompt = ai.definePrompt({
  name: 'aiChatResponsePrompt',
  input: {schema: z.object({ lawyerName: z.string() })},
  output: {schema: AIChatResponseOutputSchema},
  prompt: `You are an AI assistant for a legal platform. A user has just started a chat with a lawyer named {{lawyerName}}. 
  
  Generate a friendly, professional welcome message. Inform the user that {{lawyerName}} has been notified and will respond shortly. Ask them to briefly describe their legal issue in the meantime. 
  
  Keep the message concise, around 2-3 sentences.`,
});


const aiChatResponseFlow = ai.defineFlow(
  {
    name: 'aiChatResponseFlow',
    inputSchema: AIChatResponseInputSchema,
    outputSchema: AIChatResponseOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ lawyerName: input.lawyerName });
    const responseText = output!.response;
    
    // The client will be responsible for creating the message document in Firestore.
    // This flow's only job is to generate the response text.
    return { response: responseText };
  }
);
