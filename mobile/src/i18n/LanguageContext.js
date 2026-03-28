import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { translations } from './translations';

const LanguageContext = createContext(null);

const LANG_KEY = 'app_language';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((saved) => {
      if (saved && translations[saved]) {
        setLanguageState(saved);
      }
      setReady(true);
    });
  }, []);

  const t = useCallback(
    (key) => translations[language]?.[key] || translations.en[key] || key,
    [language]
  );

  const isRTL = language === 'ar';

  const setLanguage = async (lang) => {
    await AsyncStorage.setItem(LANG_KEY, lang);
    setLanguageState(lang);
    const needsRTL = lang === 'ar';
    if (I18nManager.isRTL !== needsRTL) {
      I18nManager.allowRTL(needsRTL);
      I18nManager.forceRTL(needsRTL);
      // Reload to apply RTL change
      try {
        await Updates.reloadAsync();
      } catch {
        // In dev or if reload fails, the change applies on next launch
      }
    }
  };

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
