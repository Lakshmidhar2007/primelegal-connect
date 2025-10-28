'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from './use-language';
import { getTranslation } from '@/actions/translate';

const translationsCache: Record<string, Record<string, string>> = {};

export function useTranslation() {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>(translationsCache[language] || {});
  const textsToTranslate = useRef(new Set<string>());

  useEffect(() => {
    if (language === 'English') {
      setTranslations({});
      return;
    }

    const newTexts = Array.from(textsToTranslate.current).filter(text => {
        return !translationsCache[language] || !translationsCache[language][text];
    });

    if (newTexts.length > 0) {
      newTexts.forEach(text => {
        // Ensure cache exists for the language
        if (!translationsCache[language]) {
            translationsCache[language] = {};
        }

        // Avoid re-fetching if another component already initiated it
        if (translationsCache[language][text]) {
            return;
        }

        // Mark as fetching to prevent duplicates
        translationsCache[language][text] = text;

        getTranslation({ text, targetLanguage: language }).then(response => {
          if (response.success && response.data) {
            const translatedText = response.data.translatedText;
            translationsCache[language][text] = translatedText;
            // Update state with the new translation
            setTranslations(prev => ({ ...prev, [text]: translatedText }));
          } else {
             // If translation fails, revert to original text in cache
            translationsCache[language][text] = text;
          }
        });
      });
    }

    // On language change, immediately update with any cached translations
    setTranslations(translationsCache[language] || {});

  }, [language, textsToTranslate.current]);

  const t = useCallback(
    (text: string): string => {
      if (language === 'English') {
        return text;
      }
      
      if (text && !textsToTranslate.current.has(text)) {
        textsToTranslate.current.add(text);
      }

      return translations[text] || text;
    },
    [language, translations]
  );

  return { t, language };
}
