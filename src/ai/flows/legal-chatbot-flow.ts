'use server';

/**
 * @fileOverview This file defines a Genkit flow for a legal chatbot.
 *
 * - legalChatbot - A function that takes a user's query and conversation history, returning an AI response.
 * - LegalChatbotInput - The input type for the legalChatbot function.
 * - LegalChatbotOutput - The output type for the legalChatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
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
      description: 'Drafts a legal complaint for police submission based on user-provided details. Use this tool if the user agrees to draft a complaint.',
      inputSchema: z.object({
        fullName: z.string().describe("The complainant's full name."),
        ageAndGender: z.string().describe("The complainant's age and gender."),
        parentName: z.string().describe("The complainant's father's or mother's name."),
        address: z.string().describe("The complainant's full residential address."),
        contactInfo: z.string().describe("The complainant's contact number and/or email."),
        occupation: z.string().describe("The complainant's occupation."),
        incidentDate: z.string().describe("The date, time, and place of the incident."),
        incidentDetails: z.string().describe("A clear, chronological description of what happened."),
        suspectDetails: z.string().describe("Details of the suspect(s), if known."),
        evidence: z.string().describe("Mention of any available evidence like photos, videos, or witnesses."),
        requestedAction: z.string().describe("The specific action the user wants to be taken."),
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
    You must use the 'draftComplaint' tool. To use the tool, you must first ask the user for all the necessary information.
    **CRITICAL INSTRUCTION:** You MUST ask for each piece of information ONE BY ONE. Wait for the user's answer before you ask the next question. Do not ask for multiple details at once.
    
    Ask for each piece of information in this specific order:
    a) "To begin, what is your full name?"
    b) "What is your age and gender?"
    c) "What is your father's or mother's name?"
    d) "What is your full residential address, including any landmarks?"
    e) "What is your contact number and/or email address?"
    f) "What is your occupation?"
    g) "Next, please state the date, approximate time, and location of the incident."
    h) "Now, please describe the incident in detail, from start to finish."
    i) "Do you have any details about the suspect(s)? Please provide their name, description, or any other identifying information if you can."
    j) "Do you have any evidence to support your complaint, such as photos, videos, messages, or names of witnesses?"
    k) "Finally, what specific action would you like the authorities to take?"

    Once you have gathered all eleven pieces of information, and only then, call the 'draftComplaint' tool with all the details. After the tool returns the drafted complaint, present it to the user.

    If the user wants to ask a legal question, proceed to answer their question based on your legal knowledge.`;


    const { text } = await ai.generate({
      prompt: message,
      history: [{ role: 'system', content: systemPrompt }, ...history],
      tools: [draftComplaintTool],
    });

    return { response: text };
  }
);
