'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  cyclesPerRound: 4,
  soundEnabled: true,
}

const TIMER_MODES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
}

export default function useTimer() {
  // Load settings from localStorage
  const getInitialSettings = () => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('pomodoroSettings')
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS
    }
    return DEFAULT_SETTINGS
  }

  const [settings, setSettings] = useState(getInitialSettings)
  const [mode, setMode] = useState(TIMER_MODES.FOCUS)
  const [time, setTime] = useState(settings.focusTime * 60)
  const [isActive, setIsActive] = useState(false)
  const [cycle, setCycle] = useState(1)
  
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  // Initialize audio for notifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification.mp3')
    }
  }, [])

  // Update timer based on mode changes
  useEffect(() => {
    if (mode === TIMER_MODES.FOCUS) {
      setTime(settings.focusTime * 60)
    } else if (mode === TIMER_MODES.SHORT_BREAK) {
      setTime(settings.shortBreakTime * 60)
    } else if (mode === TIMER_MODES.LONG_BREAK) {
      setTime(settings.longBreakTime * 60)
    }
  }, [mode, settings])

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
    }
  }, [settings])

  // Timer tick logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current)
            
            // Play sound notification
            if (settings.soundEnabled && audioRef.current) {
              audioRef.current.play().catch(e => console.error('Audio play error:', e))
            }
            
            // Mode switching logic
            if (mode === TIMER_MODES.FOCUS) {
              // After focus period ends
              if (cycle >= settings.cyclesPerRound) {
                // Long break after completing all cycles
                setMode(TIMER_MODES.LONG_BREAK)
                setCycle(1)
              } else {
                // Short break after each focus period
                setMode(TIMER_MODES.SHORT_BREAK)
                setCycle(prev => prev + 1)
              }
            } else {
              // After any break, go back to focus
              setMode(TIMER_MODES.FOCUS)
            }
            
            setIsActive(false)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [isActive, mode, cycle, settings])

  const startTimer = useCallback(() => {
    setIsActive(true)
  }, [])

  const pauseTimer = useCallback(() => {
    setIsActive(false)
  }, [])

  const resetTimer = useCallback(() => {
    setIsActive(false)
    if (mode === TIMER_MODES.FOCUS) {
      setTime(settings.focusTime * 60)
    } else if (mode === TIMER_MODES.SHORT_BREAK) {
      setTime(settings.shortBreakTime * 60)
    } else if (mode === TIMER_MODES.LONG_BREAK) {
      setTime(settings.longBreakTime * 60)
    }
  }, [mode, settings])

  const skipToNext = useCallback(() => {
    setIsActive(false)
    
    if (mode === TIMER_MODES.FOCUS) {
      if (cycle >= settings.cyclesPerRound) {
        setMode(TIMER_MODES.LONG_BREAK)
        setCycle(1)
      } else {
        setMode(TIMER_MODES.SHORT_BREAK)
      }
    } else if (mode === TIMER_MODES.SHORT_BREAK) {
      setMode(TIMER_MODES.FOCUS)
      setCycle(prev => prev + 1)
    } else if (mode === TIMER_MODES.LONG_BREAK) {
      setMode(TIMER_MODES.FOCUS)
      setCycle(1)
    }
  }, [cycle, mode, settings.cyclesPerRound])

  const updateSettings = useCallback((newSettings) => {
    setSettings(newSettings)
  }, [])

  return {
    time,
    mode,
    isActive,
    cycle,
    totalCycles: settings.cyclesPerRound,
    settings,
    updateSettings,
    startTimer,
    pauseTimer,
    resetTimer,
    skipToNext,
  }
} 