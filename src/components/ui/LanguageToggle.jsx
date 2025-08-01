'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
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
      className="flex items-center justify-center p-1 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors overflow-hidden"
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {language === 'pt' 
        ? <Image 
            src="/icons/pt-br.png"
            alt="Bandeira do Brasil"
            width={32}
            height={32}
            className="rounded-full"
          />
        : <Image 
            src="/icons/en.png"
            alt="Bandeira dos Estados Unidos"
            width={32}
            height={32}
            className="rounded-full"
          />
      }
    </motion.button>
  )
}

export default LanguageToggle 