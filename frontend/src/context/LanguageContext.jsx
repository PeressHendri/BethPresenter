import React, { createContext, useContext, useState, useEffect } from 'react';

// Import translations
import enTranslations from '../locales/en.json';
import idTranslations from '../locales/id.json';

// Available languages
const LANGUAGES = {
  en: { name: 'English', code: 'en' },
  es: { name: 'Spanish', code: 'es' },
  pt: { name: 'Portuguese', code: 'pt' },
  tl: { name: 'Tagalog', code: 'tl' },
  ko: { name: 'Korean', code: 'ko' },
  fr: { name: 'French', code: 'fr' },
  zh: { name: 'Chinese', code: 'zh' },
  hi: { name: 'Hindi', code: 'hi' },
  ar: { name: 'Arabic', code: 'ar' },
  id: { name: 'Indonesian', code: 'id' },
  ta: { name: 'Tamil', code: 'ta' },
  ru: { name: 'Russian', code: 'ru' },
  uk: { name: 'Ukrainian', code: 'uk' }
};

// Translation cache
const translationCache = {
  en: enTranslations,
  id: idTranslations
};

// Multi-script font support
const MULTI_SCRIPT_FONTS = {
  // Latin scripts
  en: 'Poppins, Arial, sans-serif',
  es: 'Poppins, Arial, sans-serif',
  pt: 'Poppins, Arial, sans-serif',
  fr: 'Poppins, Arial, sans-serif',
  ru: 'Poppins, Arial, sans-serif',
  uk: 'Poppins, Arial, sans-serif',
  
  // Non-Latin scripts
  ar: 'Noto Sans Arabic, Arial, sans-serif',
  zh: 'Noto Sans SC, SimHei, sans-serif',
  hi: 'Noto Sans Devanagari, Mangal, sans-serif',
  ta: 'Noto Sans Tamil, Latha, sans-serif',
  ko: 'Noto Sans KR, Malgun Gothic, sans-serif',
  tl: 'Poppins, Arial, sans-serif', // Tagalog uses Latin script
  id: 'Poppins, Arial, sans-serif'  // Indonesian uses Latin script
};

const LanguageContext = createContext();

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to English
    const savedLanguage = localStorage.getItem('beth_language');
    return savedLanguage && LANGUAGES[savedLanguage] ? savedLanguage : 'en';
  });

  const [translations, setTranslations] = useState(() => {
    return translationCache[language] || translationCache.en;
  });

  // Load translations for the current language
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Use cached translations if available
        if (translationCache[language]) {
          setTranslations(translationCache[language]);
          return;
        }

        // For other languages, we would load from JSON files
        // For now, fallback to English
        console.warn(`Translations for ${language} not yet implemented, using English`);
        setTranslations(translationCache.en);
      } catch (error) {
        console.error('Failed to load translations:', error);
        setTranslations(translationCache.en);
      }
    };

    loadTranslations();
  }, [language]);

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('beth_language', language);
  }, [language]);

  // Translation function
  const t = (key, fallback = null) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        if (language !== 'en') {
          let fallbackValue = translationCache.en;
          for (const fk of keys) {
            if (fallbackValue && typeof fallbackValue === 'object' && fk in fallbackValue) {
              fallbackValue = fallbackValue[fk];
            } else {
              break;
            }
          }
          if (fallbackValue && typeof fallbackValue === 'string') {
            return fallbackValue;
          }
        }
        return fallback || key; // Return key if no fallback provided
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  // Get current font family for the language
  const getFontFamily = () => {
    return MULTI_SCRIPT_FONTS[language] || MULTI_SCRIPT_FONTS.en;
  };

  // Check if current language uses RTL (Right-to-Left)
  const isRTL = () => {
    return language === 'ar'; // Arabic is RTL
  };

  // Get available languages
  const getAvailableLanguages = () => {
    return Object.values(LANGUAGES);
  };

  // Change language
  const changeLanguage = (langCode) => {
    if (LANGUAGES[langCode]) {
      setLanguage(langCode);
    }
  };

  const value = {
    language,
    setLanguage: changeLanguage,
    t,
    getFontFamily,
    isRTL,
    getAvailableLanguages,
    currentLanguage: LANGUAGES[language],
    allLanguages: LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
