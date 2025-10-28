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
  const [textsToTranslate, setTextsToTranslate] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (language === 'English') {
      setTranslations({});
      return;
    }

    const newTexts = new Set<string>();
    textsToTranslate.forEach(text => {
      if (!translationsCache[language] || !translationsCache[language][text]) {
        newTexts.add(text);
      }
    });

    if (newTexts.size > 0) {
      newTexts.forEach(text => {
        getTranslation({ text, targetLanguage: language }).then(response => {
          if (response.success && response.data) {
            const translatedText = response.data.translatedText;
            
            if (!translationsCache[language]) {
              translationsCache[language] = {};
            }
            translationsCache[language][text] = translatedText;

            setTranslations(prev => ({ ...prev, [text]: translatedText }));
          }
        });
      });
    }

    // On language change, use cached translations if available
    setTranslations(translationsCache[language] || {});

  }, [language, textsToTranslate]);

  const t = useCallback(
    (text: string): string => {
      if (language === 'English') {
        return text;
      }
      
      // Register the text for translation if not already tracked
      if (!textsToTranslate.has(text)) {
        setTextsToTranslate(prev => new Set(prev).add(text));
      }

      return translations[text] || text;
    },
    [language, translations, textsToTranslate]
  );

  return { t, language };
}
