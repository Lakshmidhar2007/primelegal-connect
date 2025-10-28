'use server';
import { translateText, type TranslateTextInput } from '@/ai/flows/translate-text';

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
