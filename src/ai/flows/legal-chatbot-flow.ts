'use server';

/**
 * @fileOverview This file defines a Genkit flow for a legal chatbot.
 *
 * - legalChatbot - A function that takes a user's query and conversation history, returning an AI response.
 * - LegalChatbotInput - The input type for the legalChatbot function.
 * - LegalChatbotOutput - The output type for the legalChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const LegalChatbotInputSchema = z.object({
  history: z.array(ChatMessageSchema),
  message: z.string().describe('The user\'s latest message.'),
});
export type LegalChatbotInput = z.infer<typeof LegalChatbotInputSchema>;

const LegalChatbotOutputSchema = z.object({
  response: z.string().describe('The AI\'s response.'),
});
export type LegalChatbotOutput = z.infer<typeof LegalChatbotOutputSchema>;

export async function legalChatbot(input: LegalChatbotInput): Promise<LegalChatbotOutput> {
  return legalChatbotFlow(input);
}

const legalChatbotFlow = ai.defineFlow(
  {
    name: 'legalChatbotFlow',
    inputSchema: LegalChatbotInputSchema,
    outputSchema: LegalChatbotOutputSchema,
  },
  async ({ history, message }) => {
    const systemPrompt = `You are an expert AI legal assistant. Your name is PrimeLegal AI.
    Your knowledge is strictly limited to legal subjects. Do not answer questions outside of this scope.
    If a user asks an off-topic question, politely decline and steer the conversation back to legal matters.
    Be helpful, clear, and professional. Do not provide legal advice, but you can provide legal information.
    Start the conversation by introducing yourself.`;

    const model = ai.model;

    const { text } = await ai.generate({
      prompt: message,
      history: [{ role: 'system', content: systemPrompt }, ...history],
    });

    return { response: text };
  }
);
