'use server';

import { aiChatResponse, AIChatResponseInput } from '@/ai/flows/chat-flow';

export async function getAIChatResponse(input: AIChatResponseInput) {
  try {
    await aiChatResponse(input);
  } catch (error) {
    console.error('Error getting AI chat response:', error);
    // We don't return an error to the client here, as it's a background task.
  }
}
