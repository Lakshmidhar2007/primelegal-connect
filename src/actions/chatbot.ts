'use server';

import { legalChatbot, type LegalChatbotInput, type LegalChatbotOutput } from '@/ai/flows/legal-chatbot-flow';

type AIResponse = {
  success: boolean;
  data?: LegalChatbotOutput;
  error?: string;
}

export async function getChatbotResponse(input: LegalChatbotInput): Promise<AIResponse> {
  try {
    const response = await legalChatbot(input);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
