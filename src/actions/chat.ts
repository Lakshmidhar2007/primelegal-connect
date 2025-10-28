'use server';

import { aiChatResponse, AIChatResponseInput, AIChatResponseOutput } from '@/ai/flows/chat-flow';

type AIResponse = {
  success: boolean;
  data?: AIChatResponseOutput;
  error?: string;
}

export async function getAIChatResponse(input: AIChatResponseInput): Promise<AIResponse> {
  try {
    const response = await aiChatResponse(input);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error getting AI chat response:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
