'use client'

import { useState, useEffect, createContext, useContext } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('pt')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem('language')
        if (savedLanguage && ['pt', 'en'].includes(savedLanguage)) {
          setLanguage(savedLanguage)
        }
        setIsInitialized(true)
        setIsHydrating(false)
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        setIsInitialized(true)
        setIsHydrating(false)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && !isHydrating) {
      try {
        localStorage.setItem('language', language)
        document.documentElement.lang = language
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }, [language, isInitialized, isHydrating])

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'pt' ? 'en' : 'pt')
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, isInitialized }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}