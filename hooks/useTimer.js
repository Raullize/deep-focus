'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  cyclesPerRound: 4,
  soundEnabled: true,
  autoStartNextCycle: false,
  notificationSound: 'notification1',
  showKeyboardShortcuts: true,
}

const TIMER_MODES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
}

const getSavedSettings = () => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (!savedSettings) return DEFAULT_SETTINGS;
    
    return { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
  } catch (e) {
    console.error('Error loading settings:', e);
    return DEFAULT_SETTINGS;
  }
};

export default function useTimer() {
  // State
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mode, setMode] = useState(TIMER_MODES.FOCUS);
  const [time, setTime] = useState(DEFAULT_SETTINGS.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [totalTime, setTotalTime] = useState(DEFAULT_SETTINGS.focusTime * 60);
  
  // Refs
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const initializedRef = useRef(false);
  const targetEndTimeRef = useRef(0);
  
  // State refs for async operations
  const modeRef = useRef(mode);
  const cycleRef = useRef(cycle);
  const settingsRef = useRef(settings);
  const isActiveRef = useRef(isActive);
  const timeRef = useRef(time);
  const totalTimeRef = useRef(totalTime);
  
  // Keep refs updated
  useEffect(() => {
    modeRef.current = mode;
    cycleRef.current = cycle;
    settingsRef.current = settings;
    isActiveRef.current = isActive;
    timeRef.current = time;
    totalTimeRef.current = totalTime;
  }, [mode, cycle, settings, isActive, time, totalTime]);

  // Initialization
  useEffect(() => {
    if (initializedRef.current) return;
    
    const savedSettings = getSavedSettings();
    setSettings(savedSettings);
    
    let initialTime;
    if (mode === TIMER_MODES.FOCUS) {
      initialTime = savedSettings.focusTime * 60;
    } else if (mode === TIMER_MODES.SHORT_BREAK) {
      initialTime = savedSettings.shortBreakTime * 60;
    } else {
      initialTime = savedSettings.longBreakTime * 60;
    }
    
    setTime(initialTime);
    setTotalTime(initialTime);
    initializedRef.current = true;
  }, []);

  // Audio notification setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadAudio = () => {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        const timestamp = new Date().getTime();
        const soundPath = `/notifications/${settings.notificationSound}.mp3?t=${timestamp}`;
        
        audioRef.current.oncanplaythrough = () => {
          console.log("Audio loaded successfully:", settings.notificationSound);
        };
        
        audioRef.current.onerror = (e) => {
          console.warn(`Could not load audio: ${settings.notificationSound}`, e.target.error);
          if ('Notification' in window && settings.soundEnabled) {
            Notification.requestPermission();
          }
        };
        
        audioRef.current.src = soundPath;
        audioRef.current.load();
      } catch (error) {
        console.error("Error setting up audio:", error);
      }
    };
    
    if (settings.soundEnabled) {
      loadAudio();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.oncanplaythrough = null;
        audioRef.current.onerror = null;
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [settings.soundEnabled, settings.notificationSound]);

  // Update timer when mode or settings change
  useEffect(() => {
    if (!initializedRef.current) return;
    
    try {
      let newTime;
      if (mode === TIMER_MODES.FOCUS) {
        newTime = settings.focusTime * 60;
      } else if (mode === TIMER_MODES.SHORT_BREAK) {
        newTime = settings.shortBreakTime * 60;
      } else {
        newTime = settings.longBreakTime * 60;
      }
      setTime(newTime);
      setTotalTime(newTime);
    } catch (error) {
      console.error('Error updating time:', error);
      setTime(25 * 60);
      setTotalTime(25 * 60);
    }
  }, [mode, settings.focusTime, settings.shortBreakTime, settings.longBreakTime]);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !initializedRef.current) return;
    
    try {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  // Timer countdown logic
  useEffect(() => {
    if (!isActive) return;
    
    if (targetEndTimeRef.current === 0) {
      targetEndTimeRef.current = Date.now() + timeRef.current * 1000;
    }
    
    const updateTimer = () => {
      if (!isActiveRef.current) return;
      
      const now = Date.now();
      const remaining = Math.max(0, (targetEndTimeRef.current - now) / 1000);
      
      // Atualizando o valor de time através do setState
      // Mas só quando há uma mudança significativa
      if (Math.abs(remaining - timeRef.current) > 0.01) {
        setTime(remaining);
      }
      
      if (remaining <= 0.01) {
        if (intervalRef.current) {
          cancelAnimationFrame(intervalRef.current);
          intervalRef.current = null;
        }
        
        const currentMode = modeRef.current;
        const currentCycle = cycleRef.current;
        const currentSettings = settingsRef.current;
        
        // Play notification sound
        playNotificationSound(currentMode, currentSettings);
        
        // Handle timer completion and mode switching
        handleTimerCompletion(currentMode, currentCycle, currentSettings);
        
        return;
      }
      
      intervalRef.current = requestAnimationFrame(updateTimer);
    };
    
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
    }
    intervalRef.current = requestAnimationFrame(updateTimer);
    
    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]); // Apenas isActive como dependência

  // Play notification sound with fallbacks
  const playNotificationSound = (currentMode, currentSettings) => {
    if (!currentSettings.soundEnabled) return;
    
    try {
      if (audioRef.current) {
        if (audioRef.current.readyState >= 2) {
          audioRef.current.currentTime = 0;
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn("Could not play sound:", error);
              showBrowserNotification(currentMode);
            });
          }
        } else {
          showBrowserNotification(currentMode);
        }
      } else {
        showBrowserNotification(currentMode);
      }
    } catch (error) {
      console.error("Error playing notification:", error);
      showBrowserNotification(currentMode);
    }
  };

  // Show browser notification as fallback
  const showBrowserNotification = (currentMode) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('DeepFocus', { 
        body: currentMode === TIMER_MODES.FOCUS ? 'Time to take a break!' : 'Time to focus!',
        icon: '/favicon.ico'
      });
    }
  };

  // Handle timer completion and mode switching
  const handleTimerCompletion = (currentMode, currentCycle, currentSettings) => {
    let nextMode = currentMode;
    let nextCycle = currentCycle;
    
    if (currentMode === TIMER_MODES.FOCUS) {
      if (currentCycle >= currentSettings.cyclesPerRound) {
        nextMode = TIMER_MODES.LONG_BREAK;
        nextCycle = 1;
      } else {
        nextMode = TIMER_MODES.SHORT_BREAK;
        nextCycle = currentCycle + 1;
      }
    } else {
      nextMode = TIMER_MODES.FOCUS;
    }
    
    // Use a single setTimeout to batch state updates (mais confiável que requestAnimationFrame neste caso)
    setTimeout(() => {
      if (nextMode !== currentMode) {
        setMode(nextMode);
      }
      
      if (nextCycle !== currentCycle) {
        setCycle(nextCycle);
      }
      
      if (currentSettings.autoStartNextCycle) {
        setTimeout(() => setIsActive(true), 100);
      } else {
        setIsActive(false);
      }
      
      // Resetar o targetEndTimeRef após alterações de modo para evitar problemas
      targetEndTimeRef.current = 0;
    }, 0);
  };

  // Timer control functions
  const startTimer = useCallback(() => {
    if (!isActive) {
      targetEndTimeRef.current = Date.now() + timeRef.current * 1000;
    }
    setIsActive(true);
  }, [isActive]);
  
  const pauseTimer = useCallback(() => {
    setIsActive(false);
  }, []);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = null;
    }
    
    const currentMode = modeRef.current;
    const currentSettings = settingsRef.current;
    
    let newTime;
    if (currentMode === TIMER_MODES.FOCUS) {
      newTime = currentSettings.focusTime * 60;
    } else if (currentMode === TIMER_MODES.SHORT_BREAK) {
      newTime = currentSettings.shortBreakTime * 60;
    } else {
      newTime = currentSettings.longBreakTime * 60;
    }
    
    targetEndTimeRef.current = 0;
    
    setTime(newTime);
    setTotalTime(newTime);
  }, []);

  const skipToNext = useCallback(() => {
    setIsActive(false);
    
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = null;
    }
    
    const currentMode = modeRef.current;
    const currentCycle = cycleRef.current;
    const currentSettings = settingsRef.current;
    
    targetEndTimeRef.current = 0;
    
    // Usar setTimeout para garantir que as atualizações de estado não entrem em conflito
    setTimeout(() => {
      if (currentMode === TIMER_MODES.FOCUS) {
        if (currentCycle >= currentSettings.cyclesPerRound) {
          setMode(TIMER_MODES.LONG_BREAK);
          setCycle(1);
        } else {
          setMode(TIMER_MODES.SHORT_BREAK);
        }
      } else if (currentMode === TIMER_MODES.SHORT_BREAK) {
        setMode(TIMER_MODES.FOCUS);
        setCycle(prev => prev + 1);
      } else {
        setMode(TIMER_MODES.FOCUS);
        setCycle(1);
      }
    }, 0);
  }, []);

  const updateSettings = useCallback((newSettings) => {
    // Validar as configurações primeiro
    const validatedSettings = { ...DEFAULT_SETTINGS };
    
    if (newSettings) {
      Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (typeof DEFAULT_SETTINGS[key] === 'number') {
          const value = newSettings[key];
          validatedSettings[key] = (typeof value === 'number' && !isNaN(value) && value > 0)
            ? value
            : DEFAULT_SETTINGS[key];
        } else {
          validatedSettings[key] = key in newSettings
            ? newSettings[key]
            : DEFAULT_SETTINGS[key];
        }
      });
    }
    
    // Pausar o timer e cancelar o intervalo imediatamente
    if (isActiveRef.current) {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    // Resetar o tempo alvo
    targetEndTimeRef.current = 0;
    
    // Usar setTimeout para garantir que as atualizações de estado não entrem em conflito
    setTimeout(() => {
      // Atualizar configurações
      setSettings(validatedSettings);
      
      // Reiniciar o timer
      setIsActive(false);
      setCycle(1);
      
      // Atualizar o tempo com base no modo atual
      const currentMode = modeRef.current;
      
      let newTime;
      if (currentMode === TIMER_MODES.FOCUS) {
        newTime = validatedSettings.focusTime * 60;
      } else if (currentMode === TIMER_MODES.SHORT_BREAK) {
        newTime = validatedSettings.shortBreakTime * 60;
      } else {
        newTime = validatedSettings.longBreakTime * 60;
      }
      
      setTime(newTime);
      setTotalTime(newTime);
    }, 0);
  }, []);

  return {
    time,
    totalTime,
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
  };
} 