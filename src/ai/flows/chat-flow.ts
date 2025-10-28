'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

const AIChatResponseInputSchema = z.object({
  chatId: z.string().describe("The ID of the chat session."),
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

    const firestore = getFirestore();
    const messagesRef = collection(firestore, 'chats', input.chatId, 'messages');

    await addDoc(messagesRef, {
        id: uuidv4(),
        text: responseText,
        senderId: 'ai-bot',
        timestamp: serverTimestamp(),
    });
    
    return { response: responseText };
  }
);
