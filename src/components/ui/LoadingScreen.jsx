'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GradientText from './GradientText'
import useTranslation from '../../i18n/useTranslation'

const PARTICLE_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899"]

const LoadingScreen = ({ onLoadingComplete }) => {
  const { t, language } = useTranslation()
  const [progress, setProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [preloadStarted, setPreloadStarted] = useState(false)

  useEffect(() => {
    let interval;
    
    const incrementProgress = () => {
      setProgress(prev => {
        const increment = 
          prev < 30 ? Math.random() * 3 : 
          prev < 70 ? Math.random() * 5 : 
          Math.random() * 2.5
        
        const nextProgress = Math.min(prev + increment, 100)
        
        if (nextProgress >= 85 && !preloadStarted) {
          setPreloadStarted(true)
          
          const preloadScripts = document.createElement('script')
          preloadScripts.textContent = `
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('preloadUIComponents'));
            }
          `
          document.head.appendChild(preloadScripts)
        }
        
        if (nextProgress === 100 && prev !== 100) {
          setTimeout(() => {
            setIsLoading(false)
            if (onLoadingComplete) {
              setTimeout(onLoadingComplete, 200)
            }
          }, 300)
        }
        
        return nextProgress
      })
    }

    const startDelay = setTimeout(() => {
      interval = setInterval(incrementProgress, 30)
    }, 200)

    return () => {
      clearTimeout(startDelay)
      if (interval) clearInterval(interval)
    }
  }, [onLoadingComplete, preloadStarted])

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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10 w-full"
        >
          <div className="text-center">
            <motion.img 
              src="/logos/logo.png" 
              alt="DeepFocus Logo" 
              className="w-20 h-20 mx-auto mb-4 object-contain"
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              onError={(e) => { 
                e.target.style.display = 'none';
              }}
            />
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
        
        <div className="w-full">
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
          
          <table className="w-full mb-8">
            <tbody>
              <tr>
                <td className="text-sm text-gray-400 text-left w-1/2">{t('loading')}</td>
                <td className="text-sm text-gray-400 text-right w-1/2">{Math.floor(progress)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen