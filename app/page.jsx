'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Controls from '../components/ui/Controls'
import LanguageToggle from '../components/ui/LanguageToggle'
import GradientText from '../components/ui/GradientText'
import useTranslation from '../i18n/useTranslation'
import useTimer from '../hooks/useTimer'

// Importação dinâmica para evitar erros de hidratação
const TimerDisplay = dynamic(() => import('../components/ui/TimerDisplay'), { ssr: false })
const ConfigPanel = dynamic(() => import('../components/ui/ConfigPanel'), { ssr: false })
const Particles = dynamic(() => import('../components/ui/Particles'), { ssr: false })

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const { t } = useTranslation()
  const timer = useTimer()
  
  // Extrair dados do timer
  const {
    time,
    mode,
    isActive,
    cycle,
    totalCycles,
    settings,
    updateSettings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNext
  } = timer

  // Montar componente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Atalhos de teclado
  useEffect(() => {
    if (!mounted) return
    
    const handleKeyPress = (e) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          isActive ? pauseTimer() : startTimer()
          break
        case 'KeyR':
          resetTimer()
          break
        case 'KeyN':
          skipToNext()
          break
        case 'KeyS':
          setIsSettingsOpen(prev => !prev)
          break
        case 'KeyF':
          toggleFullscreen()
          break
        case 'Escape':
          if (isSettingsOpen) {
            setIsSettingsOpen(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isActive, pauseTimer, resetTimer, skipToNext, startTimer, mounted, isSettingsOpen])

  // Função para alternar modo tela cheia
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Erro ao tentar entrar em modo tela cheia: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Não renderiza nada até estar montado no cliente
  if (!mounted) return null

  return (
    <main className="flex h-screen w-screen flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Particles Background */}
      {mounted && (
        <Particles 
          particleCount={150}
          particleSpread={15}
          speed={0.05}
          particleColors={["#3B82F6", "#8B5CF6", "#EC4899"]}
          moveParticlesOnHover={true}
          particleHoverFactor={0.5}
          alphaParticles={true}
          particleBaseSize={80}
        />
      )}
      
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center flex-grow gap-8">
        <GradientText 
          className="text-3xl font-bold" 
          colors={["#3B82F6", "#8B5CF6", "#EC4899", "#8B5CF6", "#3B82F6"]}
          animationSpeed={5}
        >
          DeepFocus
        </GradientText>
        
        <div className="text-center">
          <div className="mb-2 text-xl">
            {mode === 'focus' && t('focus')}
            {mode === 'shortBreak' && t('shortBreak')}
            {mode === 'longBreak' && t('longBreak')}
          </div>
          
          {mode === 'focus' && (
            <div className="text-sm mb-6">
              {t('cycle')} {cycle}/{totalCycles}
            </div>
          )}
          
          <TimerDisplay time={time} />
        </div>

        <Controls 
          isActive={isActive}
          onStart={startTimer}
          onPause={pauseTimer}
          onReset={resetTimer} 
          onSkip={skipToNext}
          onSettings={() => setIsSettingsOpen(true)}
        />
      </div>

      <ConfigPanel 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
      
      <div className="w-full text-center text-xs mt-8 opacity-70 hidden md:block">
        <p>{t('shortcuts')}</p>
        <p className="mt-1">
          <span className="bg-gray-800 px-2 py-1 rounded mr-1">{t('spaceKey')}</span> {t('startPause')} |
          <span className="bg-gray-800 px-2 py-1 rounded mx-1">R</span> {t('reset')} |
          <span className="bg-gray-800 px-2 py-1 rounded mx-1">N</span> {t('next')} |
          <span className="bg-gray-800 px-2 py-1 rounded mx-1">S</span> {t('settings')} |
          <span className="bg-gray-800 px-2 py-1 rounded mx-1">F</span> {t('fullscreen')} |
          <span className="bg-gray-800 px-2 py-1 rounded mx-1">ESC</span> {t('closeModal')}
        </p>
      </div>
    </main>
  )
} 