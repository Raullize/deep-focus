'use client'

import { useState, useEffect, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Controls from '../components/ui/Controls'
import LanguageToggle from '../components/ui/LanguageToggle'
import GradientText from '../components/ui/GradientText'
import ClickSpark from '../components/ui/ClickSpark'
import LoadingScreen from '../components/ui/LoadingScreen'
import useTranslation from '../i18n/useTranslation'
import useTimer from '../hooks/useTimer'
import MobileWarning from '../components/ui/MobileWarning'

// Dynamic imports to avoid hydration errors
const TimerDisplay = dynamic(() => import('../components/ui/TimerDisplay'), { 
  ssr: false,
  loading: () => <div className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px]"></div>
})
const ConfigPanel = dynamic(() => import('../components/ui/ConfigPanel'), { ssr: false })
const Particles = dynamic(() => import('../components/ui/Particles'), { ssr: false })
const OnboardingStepper = dynamic(() => import('../components/OnboardingStepper'), { ssr: false })

const PARTICLE_COLORS = ["#3B82F6", "#8B5CF6", "#EC4899"] // Blue, Purple, Pink

// Adicione este estilo para evitar o flash inicial
function InitialLoadingStyle() {
  return (
    <style jsx global>{`
      /* Esconde o conteúdo até que o JavaScript inicialize */
      html.loading-app {
        background-color: #111827;
      }
      
      html.loading-app main,
      html.loading-app header,
      html.loading-app footer {
        display: none !important;
      }
      
      /* Apenas mostra o componente de loading */
      html.loading-app [data-loading-screen="true"] {
        display: flex !important;
      }
      
      html.loading-app [data-loading-screen="true"] * {
        display: revert !important;
      }

      /* Animação de fade in para a aplicação principal */
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.4s ease-in-out;
      }
    `}</style>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { t, language, isInitialized } = useTranslation()
  
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
  } = useTimer()

  // Variável para controlar se o timer está pré-carregado
  const [timerPreloaded, setTimerPreloaded] = useState(false)

  // Adicionamos a classe loading-app ao html quando o componente é montado
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('loading-app');
    }
    
    // Inicializa como mounted após um pequeno delay
    const timer = setTimeout(() => {
      setMounted(true);
      
      // Preload do TimerDisplay em segundo plano
      const preloadTimer = setTimeout(() => {
        setTimerPreloaded(true);
      }, 200);
      
      return () => clearTimeout(preloadTimer);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Responder ao evento de pré-carregamento disparado pelo LoadingScreen
  useEffect(() => {
    if (!mounted) return;
    
    const handlePreload = () => {
      setTimerPreloaded(true);
    };
    
    window.addEventListener('preloadUIComponents', handlePreload);
    
    return () => {
      window.removeEventListener('preloadUIComponents', handlePreload);
    };
  }, [mounted]);

  // Quando o loading terminar, remova a classe loading-app
  const handleLoadingComplete = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('loading-app');
    }
    setIsLoading(false);
  };

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
        case 'KeyH':
          setShowOnboarding(true);
          break
        case 'Escape':
          if (isSettingsOpen) {
            setIsSettingsOpen(false)
          } else if (isFocusMode) {
            setIsFocusMode(false)
          } else if (showOnboarding) {
            setShowOnboarding(false)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [
    isActive, 
    pauseTimer, 
    resetTimer, 
    skipToNext, 
    startTimer, 
    mounted, 
    isSettingsOpen, 
    isFocusMode, 
    showOnboarding, 
    setShowOnboarding
  ])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error entering fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const toggleFocusMode = () => {
    setIsFocusMode(prev => !prev)
    if (isSettingsOpen) {
      setIsSettingsOpen(false)
    }
  }

  // Se não estiver montado, renderiza apenas o estilo inicial
  if (!mounted) {
    return <InitialLoadingStyle />;
  }

  return (
    <>
      <InitialLoadingStyle />
      
      {/* Elemento oculto para pré-renderizar o TimerDisplay durante o carregamento */}
      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', visibility: 'hidden' }}>
        {timerPreloaded && (
          <TimerDisplay 
            time={time} 
            totalTime={totalTime}
            mode={mode}
          />
        )}
      </div>
      
      {isLoading && (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      )}
      
      {!isLoading && (
        <div className="animate-fadeIn">
          <ClickSpark
            sparkColors={PARTICLE_COLORS}
            sparkSize={10}
            sparkRadius={25}
            sparkCount={12}
            duration={650}
            extraScale={1.2}
            multiColor={true}
          >
            <main className="flex h-screen w-screen flex-col items-center justify-between p-6 relative overflow-hidden">
              {/* Componente Onboarding - mostrado na primeira visita ou quando showOnboarding é true */}
              {mounted && (
                <OnboardingStepper 
                  forceShow={showOnboarding} 
                  onComplete={() => setShowOnboarding(false)}
                />
              )}
              
              {mounted && (
                <Particles 
                  particleCount={100}
                  particleSpread={15}
                  speed={0.05}
                  particleColors={PARTICLE_COLORS}
                  moveParticlesOnHover={true}
                  particleHoverFactor={0.5}
                  alphaParticles={true}
                  particleBaseSize={80}
                />
              )}
              
              {/* Mobile warning para alertar sobre limitações em dispositivos móveis */}
              <MobileWarning />
              
              {!isFocusMode && (
                <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
                    title={t('helpTip') || "Ver tutorial"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </button>
                  <LanguageToggle />
                </div>
              )}
              
              <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center flex-grow gap-8">
                {renderTitle()}
                
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

                {renderControls()}
              </div>

              {!isFocusMode && (
                <ConfigPanel 
                  isOpen={isSettingsOpen}
                  onClose={() => setIsSettingsOpen(false)}
                  settings={settings}
                  onUpdateSettings={updateSettings}
                />
              )}
              
              {renderKeyboardShortcuts()}
            </main>
          </ClickSpark>
        </div>
      )}
    </>
  )
  
  function renderTitle() {
    if (isFocusMode) {
      return (
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
      )
    }
    
    return (
      <GradientText 
        className="text-3xl font-bold" 
        colors={PARTICLE_COLORS.concat(PARTICLE_COLORS[1], PARTICLE_COLORS[0])}
        animationSpeed={5}
      >
        DeepFocus
      </GradientText>
    )
  }
  
  function renderControls() {
    if (isFocusMode) {
      return (
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
      )
    }
    
    return (
      <Controls 
        isActive={isActive}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={resetTimer} 
        onSkip={skipToNext}
        onSettings={() => setIsSettingsOpen(true)}
        onFocusMode={toggleFocusMode}
      />
    )
  }
  
  function renderKeyboardShortcuts() {
    if (!isFocusMode && settings.showKeyboardShortcuts) {
      return (
        <div className="w-full text-center text-xs mt-4 mb-0 opacity-70 hidden md:block">
          <p className="mb-1">{t('shortcuts')}</p>
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-2 px-2">
            <div className="whitespace-nowrap">
              <span className="bg-gray-800 px-2 py-1 rounded mr-1">{t('spaceKey')}</span> {t('startPause')}
            </div>
            <div className="whitespace-nowrap">
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">R</span> {t('reset')}
            </div>
            <div className="whitespace-nowrap">
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">N</span> {t('next')}
            </div>
            <div className="whitespace-nowrap">
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">S</span> {t('settings')}
            </div>
            <div className="whitespace-nowrap">
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">F</span> {t('fullscreen')}
            </div>
            <div className="whitespace-nowrap">
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">M</span> {t('focusMode')}
            </div>
            <div className="whitespace-nowrap">
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">H</span> {t('help') || "Ajuda"}
            </div>
            <div className="whitespace-nowrap">
              <span className="bg-gray-800 px-2 py-1 rounded mx-1">ESC</span> {t('closeModal')}
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }
} 