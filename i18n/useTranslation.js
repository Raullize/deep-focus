'use client'

import { useLanguage } from '../hooks/useLanguage'
import ptTranslations from './pt.json'
import enTranslations from './en.json'

const translations = {
  pt: ptTranslations,
  en: enTranslations
}

export default function useTranslation() {
  const { language, isInitialized } = useLanguage()
  
  const t = (key) => {
    // Get the translations for the current language
    const currentTranslations = translations[language] || translations.pt
    
    // Support for nested keys (e.g., 'onboarding.welcome')
    if (key.includes('.')) {
      const keys = key.split('.')
      let value = currentTranslations
      
      // Navigate through the nested object
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          // If any part of the path doesn't exist, return the key
          return key
        }
      }
      
      return value
    }
    
    // Handle simple keys
    return currentTranslations[key] || key
  }
  
  return { t, language, isInitialized }
} 