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
import { draftComplaint } from './draft-complaint-flow';

const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model', 'system', 'tool']),
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

const draftComplaintTool = ai.defineTool(
    {
      name: 'draftComplaint',
      description: 'Drafts a legal complaint based on the user provided details. Use this tool if the user asks to draft a complaint, lawsuit, or legal notice.',
      inputSchema: z.object({
        complainantName: z.string().describe("The name of the person filing the complaint."),
        complainantContact: z.string().describe("The contact information of the person filing the complaint."),
        respondentName: z.string().describe("The name of the person or entity the complaint is against."),
        respondentContact: z.string().describe("The contact information of the person or entity the complaint is against."),
        facts: z.string().describe("A detailed account of the events and facts leading to the complaint."),
        reliefSought: z.string().describe("What the complainant is asking for as a resolution."),
      }),
      outputSchema: z.string(),
    },
    async (input) => {
        const { complaintText } = await draftComplaint(input);
        return complaintText;
    }
);

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
    Start the conversation by introducing yourself.
    
    You have the ability to draft a legal complaint. If the user asks you to draft a complaint, you must use the 'draftComplaint' tool. To use the tool, you must first ask the user for all the necessary information:
    - Their full name and contact information.
    - The full name and contact information of the person/entity they are complaining against.
    - A detailed account of the facts.
    - The specific relief or outcome they are seeking.
    
    Once you have all the details, call the tool. After the tool returns the drafted complaint, present it to the user.`;


    const { text } = await ai.generate({
      prompt: message,
      history: [{ role: 'system', content: systemPrompt }, ...history],
      tools: [draftComplaintTool],
    });

    return { response: text };
  }
);
