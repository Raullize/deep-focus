'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Controls from '../components/ui/Controls'
import LanguageToggle from '../components/ui/LanguageToggle'
import GradientText from '../components/ui/GradientText'
import ClickSpark from '../components/ui/ClickSpark'
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
  const [isFocusMode, setIsFocusMode] = useState(false)
  const { t } = useTranslation()
  const timer = useTimer()
  
  // Extrair dados do timer
  const {
    time,
    totalTime,
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
          if (!isFocusMode) setIsSettingsOpen(prev => !prev)
          break
        case 'KeyF':
          toggleFullscreen()
          break
        case 'KeyM':
          toggleFocusMode()
          break
        case 'Escape':
          if (isSettingsOpen) {
            setIsSettingsOpen(false)
          } else if (isFocusMode) {
            setIsFocusMode(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isActive, pauseTimer, resetTimer, skipToNext, startTimer, mounted, isSettingsOpen, isFocusMode])

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

  // Função para alternar Focus Mode
  const toggleFocusMode = () => {
    setIsFocusMode(prev => !prev)
    if (isSettingsOpen) {
      setIsSettingsOpen(false)
    }
  }

  // Não renderiza nada até estar montado no cliente
  if (!mounted) return null

  return (
    <ClickSpark
      sparkColors={["#3B82F6", "#8B5CF6", "#EC4899"]} // Blue, Purple, Pink
      sparkSize={10}
      sparkRadius={25}
      sparkCount={12}
      duration={650}
      extraScale={1.2}
      multiColor={true}
    >
      <main className="flex h-screen w-screen flex-col items-center justify-between p-6 relative overflow-hidden">
        {/* Particles Background - mantidas no Focus Mode */}
        {mounted && (
          <Particles 
            particleCount={100}
            particleSpread={15}
            speed={0.05}
            particleColors={["#3B82F6", "#8B5CF6", "#EC4899"]}
            moveParticlesOnHover={true}
            particleHoverFactor={0.5}
            alphaParticles={true}
            particleBaseSize={80}
          />
        )}
        
        {/* Language Toggle - escondido no Focus Mode */}
        {!isFocusMode && (
          <div className="absolute top-4 right-4 z-10">
            <LanguageToggle />
          </div>
        )}
        
        <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center flex-grow gap-8">
          {/* Título - escondido ou adaptado no Focus Mode */}
          {isFocusMode ? (
            <div className="flex items-center text-xl opacity-50">
              <span>{t('focusMode')}</span>
              <button 
                onClick={toggleFocusMode}
                className="ml-4 p-2 rounded-full hover:bg-gray-800/50 transition-colors"
                aria-label={t('exitFocusMode')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                </svg>
              </button>
            </div>
          ) : (
            <GradientText 
              className="text-3xl font-bold" 
              colors={["#3B82F6", "#8B5CF6", "#EC4899", "#8B5CF6", "#3B82F6"]}
              animationSpeed={5}
            >
              DeepFocus
            </GradientText>
          )}
          
          {/* Informações do Timer - adaptados no Focus Mode */}
          <div className="text-center">
            {!isFocusMode && (
              <div className="mb-2 text-xl">
                {mode === 'focus' && t('focus')}
                {mode === 'shortBreak' && t('shortBreak')}
                {mode === 'longBreak' && t('longBreak')}
              </div>
            )}
            
            {!isFocusMode && mode === 'focus' && (
              <div className="text-sm mb-2">
                {t('cycle')} {cycle}/{totalCycles}
              </div>
            )}
            
            <TimerDisplay 
              time={time} 
              totalTime={totalTime}
              mode={mode}
            />
          </div>

          {/* Controles - escondidos ou adaptados no Focus Mode */}
          {isFocusMode ? (
            <div>
              <button
                onClick={isActive ? pauseTimer : startTimer}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  isActive ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-primary hover:bg-primary/80 text-black'
                }`}
              >
                {isActive ? t('pause') : t('start')}
              </button>
            </div>
          ) : (
            <>
              <Controls 
                isActive={isActive}
                onStart={startTimer}
                onPause={pauseTimer}
                onReset={resetTimer} 
                onSkip={skipToNext}
                onSettings={() => setIsSettingsOpen(true)}
                onFocusMode={toggleFocusMode}
              />
            </>
          )}
        </div>

        {/* Configurações - escondido no Focus Mode */}
        {!isFocusMode && (
          <ConfigPanel 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onUpdateSettings={updateSettings}
          />
        )}
        
        {/* Atalhos de teclado para desktop - escondido no Focus Mode */}
        {!isFocusMode && settings.showKeyboardShortcuts && (
          <div className="w-full text-center text-xs mt-4 mb-0 opacity-70 hidden md:block">
            <p className="mb-1">{t('shortcuts')}</p>
            <p>
              <span className="bg-gray-800 px-2 py-1 rounded mr-1">{t('spaceKey')}</span> {t('startPause')} |
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">R</span> {t('reset')} |
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">N</span> {t('next')} |
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">S</span> {t('settings')} |
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">F</span> {t('fullscreen')} |
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">M</span> {t('focusMode')} |
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">ESC</span> {t('closeModal')}
            </p>
          </div>
        )}
      </main>
    </ClickSpark>
  )
} 