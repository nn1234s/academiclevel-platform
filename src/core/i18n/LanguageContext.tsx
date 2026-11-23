import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Language, Translations, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof Translations, fallback?: string) => string;
  isHinglish: boolean;
  showPromptModal: boolean;
  setShowPromptModal: (show: boolean) => void;
  chooseLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY_LANG = 'al_ui_language';
const STORAGE_KEY_SEEN = 'al_language_preference_selected_v1';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved === 'hi' || saved === 'en') return saved;
    } catch {
      // fallback
    }
    return 'en';
  });

  const [showPromptModal, setShowPromptModal] = useState<boolean>(false);

  // When a logged in user loads the site, ask if they haven't made a preference choice yet
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const seen = localStorage.getItem(STORAGE_KEY_SEEN);
        if (!seen) {
          // Open prompt for logged-in user
          const timer = setTimeout(() => {
            setShowPromptModal(true);
          }, 400);
          return () => clearTimeout(timer);
        }
      } catch {
        // storage disabled
      }
    }
  }, [isAuthenticated]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {
      // ignore
    }
  };

  const chooseLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEY_SEEN, 'true');
    } catch {
      // ignore
    }
    setShowPromptModal(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const t = (key: keyof Translations, fallback?: string): string => {
    const currentDict = translations[language] || translations.en;
    if (currentDict && key in currentDict) {
      return currentDict[key];
    }
    return fallback || translations.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isHinglish: language === 'hi',
        showPromptModal,
        setShowPromptModal,
        chooseLanguage,
        toggleLanguage
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
