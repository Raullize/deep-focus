'use client'

import { motion } from 'framer-motion'
import { useLanguage } from '../../hooks/useLanguage'

const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage()
  
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleLanguage}
      className="flex items-center justify-center p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
      aria-label={language === 'pt' ? 'Switch to English' : 'Mudar para Português'}
    >
      <div className="relative w-6 h-6 overflow-hidden">
        {language === 'pt' ? (
          <span className="text-lg">🇧🇷</span>
        ) : (
          <span className="text-lg">🇺🇸</span>
        )}
      </div>
    </motion.button>
  )
}

export default LanguageToggle 