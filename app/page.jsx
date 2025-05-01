'use client'

import { useState, useEffect } from 'react'
import TimerDisplay from '../components/ui/TimerDisplay'
import Controls from '../components/ui/Controls'
import ConfigPanel from '../components/ui/ConfigPanel'
import LanguageToggle from '../components/ui/LanguageToggle'
import useTranslation from '../i18n/useTranslation'
import useTimer from '../hooks/useTimer'

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { t } = useTranslation()
  
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
  } = useTimer()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Space - Start/Pause
      if (e.code === 'Space') {
        e.preventDefault()
        isActive ? pauseTimer() : startTimer()
      }
      // R - Reset
      if (e.code === 'KeyR') {
        resetTimer()
      }
      // N - Next
      if (e.code === 'KeyN') {
        skipToNext()
      }
      // S - Settings
      if (e.code === 'KeyS') {
        setIsSettingsOpen(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isActive, pauseTimer, resetTimer, skipToNext, startTimer])

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center flex-grow gap-8">
        <h1 className="text-3xl font-bold text-primary">DeepFocus</h1>
        
        <div className="text-center">
          <div className="mb-2 text-xl">
            {mode === 'focus' && t('focus')}
            {mode === 'shortBreak' && t('shortBreak')}
            {mode === 'longBreak' && t('longBreak')}
          </div>
          
          <div className="text-sm mb-6">
            {mode === 'focus' && (
              <span>
                {t('cycle')} {cycle}/{totalCycles}
              </span>
            )}
          </div>
          
          <TimerDisplay time={time} isActive={isActive} />
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
      
      <div className="w-full text-center text-xs mt-8 opacity-70">
        <p>{t('shortcuts')}</p>
        <p className="mt-1">
          <span className="bg-gray-800 px-2 py-1 rounded mr-1">{t('spaceKey')}</span> {t('startPause')} |
          <span className="bg-gray-800 px-2 py-1 rounded mx-1">R</span> {t('reset')} |
          <span className="bg-gray-800 px-2 py-1 rounded mx-1">N</span> {t('next')} |
          <span className="bg-gray-800 px-2 py-1 rounded mx-1">S</span> {t('settings')}
        </p>
      </div>
    </main>
  )
} 