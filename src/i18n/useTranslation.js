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
    const currentTranslations = translations[language] || translations.pt
    
    if (key.includes('.')) {
      const keys = key.split('.')
      let value = currentTranslations
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          return key
        }
      }
      
      return value
    }
    
    return currentTranslations[key] || key
  }
  
  return { t, language, isInitialized }
}