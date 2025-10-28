'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from './use-language';
import { getTranslation } from '@/actions/translate';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The language to translate the text into (e.g., "Spanish", "Hindi").'),
});
type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const translationsCache: Record<string, Record<string, string>> = {};

export function useTranslation() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>(translationsCache[language] || {});

  useEffect(() => {
    // When language changes, load translations from cache if available
    if (translationsCache[language]) {
      setTranslations(translationsCache[language]);
    } else {
      setTranslations({});
    }
  }, [language]);

  const t = useCallback(
    (text: string): string => {
      // If language is English, return original text
      if (language === 'English') {
        return text;
      }

      // If translation is already in the component's state, return it
      if (translations[text]) {
        return translations[text];
      }

      // If translation is in the global cache for the current language, use it
      if (translationsCache[language] && translationsCache[language][text]) {
        return translationsCache[language][text];
      }
      
      // If not translated yet, initiate translation
      getTranslation({ text, targetLanguage: language }).then(response => {
        if (response.success && response.data) {
          const translatedText = response.data.translatedText;
          
          // Update global cache
          if (!translationsCache[language]) {
            translationsCache[language] = {};
          }
          translationsCache[language][text] = translatedText;

          // Update local state to trigger re-render
          setTranslations(prev => ({ ...prev, [text]: translatedText }));
        }
      });

      // Return original text as a fallback while translation is in progress
      return text;
    },
    [language, translations]
  );

  return { t, language };
}
