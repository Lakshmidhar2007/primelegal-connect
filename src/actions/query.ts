'use server';

import { aiInitialQueryResponse, AIInitialQueryResponseInput, AIInitialQueryResponseOutput } from '@/ai/flows/ai-initial-query-response';

type AIResponse = {
  success: boolean;
  data?: AIInitialQueryResponseOutput;
  error?: string;
}

export async function getAIResponse(input: AIInitialQueryResponseInput): Promise<AIResponse> {
  try {
    const response = await aiInitialQueryResponse(input);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error getting AI response:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
