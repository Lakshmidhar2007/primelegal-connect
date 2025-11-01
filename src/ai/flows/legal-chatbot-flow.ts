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

    When the conversation starts, you must follow this exact sequence:
    1.  Introduce yourself by saying: "Hello! I'm PrimeLegal AI, your virtual legal assistant. How can I help you today? Would you like to draft a legal complaint or ask a legal question?"
    2.  Wait for the user's response.

    If the user wants to draft a complaint:
    You must use the 'draftComplaint' tool. To use the tool, you must first ask the user for all the necessary information one by one. Do not ask for all details at once.
    Ask for each piece of information in this specific order:
    a) "To start, could you please provide the full name of the person filing the complaint (the complainant)?"
    b) After they answer, ask: "Thank you. What is the complainant's contact information (email or phone number)?"
    c) After they answer, ask: "Next, what is the full name of the person or entity the complaint is against (the respondent)?"
    d) After they answer, ask: "And what is the respondent's contact information?"
    e) After they answer, ask: "Please provide a detailed account of the facts leading to this complaint. Be as specific as possible."
    f) After they answer, ask: "Finally, what specific relief or outcome are you seeking from this complaint?"

    Once you have gathered all six pieces of information, and only then, call the 'draftComplaint' tool with all the details. After the tool returns the drafted complaint, present it to the user.

    If the user wants to ask a legal question, proceed to answer their question based on your legal knowledge.`;


    const { text } = await ai.generate({
      prompt: message,
      history: [{ role: 'system', content: systemPrompt }, ...history],
      tools: [draftComplaintTool],
    });

    return { response: text };
  }
);
