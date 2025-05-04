'use client'

import { useState, useEffect, createContext, useContext } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('pt')
  const [isInitialized, setIsInitialized] = useState(false)

  // Efeito para carregar o idioma do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = localStorage.getItem('language')
        if (savedLanguage && ['pt', 'en'].includes(savedLanguage)) {
          setLanguage(savedLanguage)
        }
        // Marca como inicializado para evitar flickering
        setIsInitialized(true)
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        setIsInitialized(true)
      }
    }
  }, [])

  // Efeito para salvar o idioma no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem('language', language)
        // Atualiza o atributo lang do HTML para refletir a mudança de idioma
        document.documentElement.lang = language
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }, [language, isInitialized])

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