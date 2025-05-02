'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '../../hooks/useLanguage'

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage()
  
  const ariaLabel = language === 'pt' 
    ? 'Mudar idioma para inglês' 
    : 'Switch language to Portuguese'
  
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleLanguage}
      className="flex items-center justify-center p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {language === 'pt' 
        ? <span role="img" aria-label="Bandeira do Brasil">🇧🇷</span>
        : <span role="img" aria-label="Bandeira dos Estados Unidos">🇺🇸</span>
      }
    </motion.button>
  )
}

export default LanguageToggle 