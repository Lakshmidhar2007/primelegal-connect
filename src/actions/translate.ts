'use server';
import { translateText } from '@/ai/flows/translate-text';
import { z } from 'zod';

export const TranslateTextInputSchema = z.object({
    text: z.string().describe('The text to be translated.'),
    targetLanguage: z.string().describe('The language to translate the text into (e.g., "Spanish", "Hindi").'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

type TranslationResponse = {
    success: boolean;
    data?: { translatedText: string };
    error?: string;
}

export async function getTranslation(input: TranslateTextInput): Promise<TranslationResponse> {
    try {
        const response = await translateText(input);
        return { success: true, data: response };
    } catch (error) {
        console.error('Error getting translation:', error);
        return { success: false, error: 'An unexpected error occurred during translation.' };
    }
}
