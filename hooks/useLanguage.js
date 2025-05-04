'use client'

import { useState, useEffect, createContext, useContext } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('pt')
  const [isInitialized, setIsInitialized] = useState(false)
  // Flag para controlar se está na fase de hidratação
  const [isHydrating, setIsHydrating] = useState(true)

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
        // Marca que a hidratação inicial foi concluída
        setIsHydrating(false)
      } catch (error) {
        console.error('Error accessing localStorage:', error)
        setIsInitialized(true)
        setIsHydrating(false)
      }
    }
  }, [])

  // Efeito para salvar o idioma no localStorage sempre que mudar
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized && !isHydrating) {
      try {
        localStorage.setItem('language', language)
        // Só atualiza o atributo lang depois da hidratação inicial
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