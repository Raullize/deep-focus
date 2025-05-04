'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GradientText from './GradientText'
import useTranslation from '../../i18n/useTranslation'

// Mantendo consistência com as cores da aplicação
const PARTICLE_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899"] // Blue, Purple, Pink

const LoadingScreen = ({ onLoadingComplete }) => {
  const { t, language } = useTranslation()
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [preloadStarted, setPreloadStarted] = useState(false)

  useEffect(() => {
    let interval;
    
    // Simulação de carregamento - aumenta gradualmente de 0 a 100
    const incrementProgress = () => {
      setProgress(prev => {
        // Começar devagar, depois acelerar e depois desacelerar novamente
        const increment = 
          prev < 30 ? Math.random() * 3 : 
          prev < 70 ? Math.random() * 5 : 
          Math.random() * 2.5
        
        // Certifique-se de que ele termine em 100
        const nextProgress = Math.min(prev + increment, 100)
        
        // Quando atingir 85%, inicie a pré-carga dos componentes principais
        if (nextProgress >= 85 && !preloadStarted) {
          setPreloadStarted(true)
          
          // Comece a carregar os componentes principais aqui
          // Isso é apenas para sincronizar os timings
          const preloadScripts = document.createElement('script')
          preloadScripts.textContent = `
            // Inicia a pré-carga dos componentes UI
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('preloadUIComponents'));
            }
          `
          document.head.appendChild(preloadScripts)
        }
        
        // Quando chegar a 100, agende a finalização do loading após um pequeno delay
        if (nextProgress === 100 && prev !== 100) {
          setTimeout(() => {
            setIsLoading(false)
            if (onLoadingComplete) {
              setTimeout(onLoadingComplete, 200)
            }
          }, 300) // Tempo para ver o 100% completo
        }
        
        return nextProgress
      })
    }

    // Começa com um pequeno atraso para garantir que pelo menos a tela de loading seja vista
    const startDelay = setTimeout(() => {
      // Depois, inicia a atualização do progresso em intervalos
      interval = setInterval(incrementProgress, 30)
    }, 200)

    return () => {
      clearTimeout(startDelay)
      if (interval) clearInterval(interval)
    }
  }, [onLoadingComplete, preloadStarted])

  // Se não estiver mais carregando, retorna null para não renderizar nada
  if (!isLoading) return null

  return (
    <motion.div 
      className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
      data-loading-screen="true"
    >
      <div className="w-full max-w-md px-8 flex flex-col items-center">
        {/* Logo ou Título com GradientText */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10 w-full"
        >
          <div className="text-center">
            <GradientText 
              className="text-4xl font-bold" 
              colors={PARTICLE_COLORS}
              animationSpeed={5}
            >
              DeepFocus
            </GradientText>
            <p className="text-gray-400 text-center mt-2">{t('tagline')}</p>
          </div>
        </motion.div>
        
        {/* Barra de progresso com mesmas cores do tema */}
        <div className="w-full bg-gray-800 rounded-full h-2.5 mb-3 overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${PARTICLE_COLORS[0]}, ${PARTICLE_COLORS[1]}, ${PARTICLE_COLORS[2]})`
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        
        {/* Porcentagem - Agora com o texto à esquerda e o valor à direita */}
        <div className="w-full flex justify-between text-sm text-gray-400 mb-8">
          <span>{t('loading')}</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        
        {/* Mensagens de Loading */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-300"
        >
          {progress < 30 && (
            <p>{t('preparingEnvironment')}</p>
          )}
          {progress >= 30 && progress < 60 && (
            <p>{t('loadingResources')}</p>
          )}
          {progress >= 60 && progress < 90 && (
            <p>{t('startingTimers')}</p>
          )}
          {progress >= 90 && (
            <p>{t('almostReady')}</p>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen 