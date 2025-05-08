'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useTranslation from '../../i18n/useTranslation'

// Constante para definir o tempo de expiração em dias
const WARNING_EXPIRATION_DAYS = 7;

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    // Detectar se é um dispositivo móvel
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isNarrowScreen = window.innerWidth < 768
      
      return isMobileDevice || isNarrowScreen
    }

    // Verificar o localStorage para ver se o aviso já foi dispensado e se não expirou
    const checkDismissed = () => {
      try {
        const dismissedData = localStorage.getItem('mobileWarningSeen');
        
        // Se não há registro, nunca foi dispensado
        if (!dismissedData) return false;
        
        // Tentar obter o objeto com timestamp
        try {
          const data = JSON.parse(dismissedData);
          const dismissedTime = new Date(data.timestamp);
          const now = new Date();
          
          // Calcular diferença em dias
          const differenceInTime = now.getTime() - dismissedTime.getTime();
          const differenceInDays = differenceInTime / (1000 * 3600 * 24);
          
          // Retornar true se ainda estiver dentro do período de dispensa
          return differenceInDays < WARNING_EXPIRATION_DAYS;
        } catch (e) {
          // Se não for um JSON válido (formato antigo), considerar expirado
          return false;
        }
      } catch (e) {
        return false;
      }
    }

    const handleResize = () => {
      setIsMobile(checkMobile())
    }

    setIsMobile(checkMobile())
    setDismissed(checkDismissed())

    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const dismissWarning = () => {
    setDismissed(true)
    try {
      // Armazenar com timestamp para expiração
      const dismissData = {
        timestamp: new Date().toISOString(),
        dismissed: true
      };
      localStorage.setItem('mobileWarningSeen', JSON.stringify(dismissData));
    } catch (e) {
      // Ignorar erro de localStorage
    }
  }

  if (!isMobile || dismissed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-yellow-900/90 backdrop-blur-md border border-yellow-700 text-yellow-100 rounded-lg p-4 shadow-lg z-50"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium">
              {t('mobileWarning') || "Esta versão do DeepFocus ainda não reproduz som em segundo plano no celular. Estamos trabalhando para resolver isso em futuras atualizações."}
            </p>
          </div>
        </div>
        <button onClick={dismissWarning} className="ml-4 flex-shrink-0 text-yellow-300 hover:text-yellow-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
} 