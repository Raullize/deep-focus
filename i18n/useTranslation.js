'use client'

import { useLanguage } from '../hooks/useLanguage'
import ptTranslations from './pt.json'
import enTranslations from './en.json'

const translations = {
  pt: ptTranslations,
  en: enTranslations
}

export default function useTranslation() {
  const { language } = useLanguage()
  
  const t = (key) => {
    // Get the translations for the current language
    const currentTranslations = translations[language] || translations.pt
    
    // Return the translation or the key if not found
    return currentTranslations[key] || key
  }
  
  return { t, language }
} 