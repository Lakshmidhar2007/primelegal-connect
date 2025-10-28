'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';
import { v4 as uuidv4 } from 'uuid';

const AIChatResponseInputSchema = z.object({
  lawyerName: z.string().describe("The name of the lawyer."),
  chatId: z.string().describe("The ID of the chat to add the message to."),
});
export type AIChatResponseInput = z.infer<typeof AIChatResponseInputSchema>;

const AIChatResponseOutputSchema = z.object({
  response: z.string().describe("The AI's welcome message."),
  messageId: z.string().describe("The ID of the message saved to Firestore."),
});
export type AIChatResponseOutput = z.infer<typeof AIChatResponseOutputSchema>;


export async function aiChatResponse(input: AIChatResponseInput): Promise<AIChatResponseOutput> {
  return aiChatResponseFlow(input);
}


const prompt = ai.definePrompt({
  name: 'aiChatResponsePrompt',
  input: {schema: z.object({ lawyerName: z.string() })},
  output: {schema: z.object({ response: z.string() })},
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
    
    // Save the AI message to the chat
    const { firestore } = initializeFirebase();
    const messagesRef = collection(firestore, 'chats', input.chatId, 'messages');
    
    const messageData = {
        id: uuidv4(),
        text: responseText,
        senderId: 'ai-bot',
        senderType: 'ai-bot',
        timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(messagesRef, messageData);
    
    return { response: responseText, messageId: docRef.id };
  }
);
