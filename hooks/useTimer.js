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
  
  // Pure Refs (not connected to state)
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const initializedRef = useRef(false);
  const targetEndTimeRef = useRef(0);
  const timerStateRef = useRef({
    time: DEFAULT_SETTINGS.focusTime * 60,
    isActive: false,
    mode: TIMER_MODES.FOCUS,
    cycle: 1,
    settings: DEFAULT_SETTINGS,
    totalTime: DEFAULT_SETTINGS.focusTime * 60
  });
  
  // Função para sincronizar o estado do React com os refs
  const syncStateFromRef = useCallback(() => {
    setTime(timerStateRef.current.time);
  }, []);
  
  // Função para atualizar o timerStateRef sem causar renderizações
  const updateTimerState = useCallback((updates) => {
    timerStateRef.current = { ...timerStateRef.current, ...updates };
  }, []);

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
    updateTimerState({
      time: initialTime,
      totalTime: initialTime,
      settings: savedSettings
    });
      
      initializedRef.current = true;
  }, [mode, updateTimerState]);

  // Manter timerStateRef atualizado com os estados do React
  useEffect(() => {
    updateTimerState({
      time,
      isActive,
      mode,
      cycle,
      settings,
      totalTime
    });
  }, [time, isActive, mode, cycle, settings, totalTime, updateTimerState]);

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
          // Removido
        };
        
        audioRef.current.onerror = (e) => {
          if ('Notification' in window && settings.soundEnabled) {
            Notification.requestPermission();
          }
        };
        
        audioRef.current.src = soundPath;
        audioRef.current.load();
      } catch (error) {
        // Erro ao configurar áudio - simplesmente continua sem notificação
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
      updateTimerState({
        time: newTime,
        totalTime: newTime
      });
    } catch (error) {
      // Em caso de erro, voltar para valores padrão
      setTime(25 * 60);
      setTotalTime(25 * 60);
      updateTimerState({
        time: 25 * 60,
        totalTime: 25 * 60
      });
    }
  }, [mode, settings.focusTime, settings.shortBreakTime, settings.longBreakTime, updateTimerState]);

  // Save settings to localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !initializedRef.current) return;
    
      try {
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
      } catch (error) {
      // Erro ao salvar configurações - simplesmente continua
    }
  }, [settings]);

  // Timer countdown logic - completamente reconstruído para evitar loops
  useEffect(() => {
    // Cancelar qualquer timer anterior
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Se não estiver ativo, não iniciar o timer
    if (!isActive) return;
    
    // Contador apenas para saber quando sincronizar com o state do React
    let frameCount = 0;
    
    // Inicializar o temporizador
    if (targetEndTimeRef.current === 0) {
      targetEndTimeRef.current = Date.now() + timerStateRef.current.time * 1000;
    }
    
    // Função de atualização do temporizador - manipula apenas refs, não state
    const updateTimer = () => {
      // Verificar se ainda está ativo
      if (!timerStateRef.current.isActive) return;
      
      const now = Date.now();
      const remaining = Math.max(0, (targetEndTimeRef.current - now) / 1000);
      
      // Atualizar apenas o ref do time, não o state
      updateTimerState({ time: remaining });
      
      // A cada 10 frames, sincronizar com o state do React (aproximadamente 6 vezes por segundo em 60fps)
      frameCount++;
      if (frameCount >= 10) {
        syncStateFromRef();
        frameCount = 0;
      }
      
      // Verificar se o timer terminou
      if (remaining <= 0.01) {
        if (intervalRef.current) {
          cancelAnimationFrame(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Sincronizar uma última vez
        syncStateFromRef();
        
        // Play notification sound
        playNotificationSound();
        
        // Handle timer completion
        handleTimerCompletion();
        
        return;
      }
      
      intervalRef.current = requestAnimationFrame(updateTimer);
    };
    
    // Iniciar o timer
    intervalRef.current = requestAnimationFrame(updateTimer);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        cancelAnimationFrame(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, syncStateFromRef, updateTimerState]);

  // Play notification sound with fallbacks
  const playNotificationSound = useCallback(() => {
    const currentSettings = timerStateRef.current.settings;
    const currentMode = timerStateRef.current.mode;
    
    if (!currentSettings.soundEnabled) return;
    
    try {
      if (audioRef.current) {
        if (audioRef.current.readyState >= 2) {
          audioRef.current.currentTime = 0;
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
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
      showBrowserNotification(currentMode);
    }
  }, []);

  // Show browser notification as fallback
  const showBrowserNotification = useCallback((currentMode) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('DeepFocus', { 
        body: currentMode === TIMER_MODES.FOCUS ? 'Time to take a break!' : 'Time to focus!',
        icon: '/favicon.ico'
      });
    }
  }, []);
          
  // Handle timer completion and mode switching
  const handleTimerCompletion = useCallback(() => {
    const currentState = timerStateRef.current;
    const currentMode = currentState.mode;
    const currentCycle = currentState.cycle;
    const currentSettings = currentState.settings;
    
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
          
    // Resetar o timer
    targetEndTimeRef.current = 0;
    
    // Atualizar estado apenas quando houver mudanças
    let updates = {};
    
    if (nextMode !== currentMode) {
      updates.mode = nextMode;
      setMode(nextMode);
    }
    
    if (nextCycle !== currentCycle) {
      updates.cycle = nextCycle;
      setCycle(nextCycle);
    }
    
    if (!currentSettings.autoStartNextCycle) {
      updates.isActive = false;
      setIsActive(false);
    } else {
      // Pequeno atraso para garantir que os outros estados sejam atualizados primeiro
      setTimeout(() => {
        setIsActive(true);
        updateTimerState({ isActive: true });
      }, 100);
    }
    
    // Atualizar o ref com todas as mudanças
    if (Object.keys(updates).length > 0) {
      updateTimerState(updates);
    }
  }, [updateTimerState]);

  // Timer control functions
  const startTimer = useCallback(() => {
    if (!isActive) {
      targetEndTimeRef.current = Date.now() + timerStateRef.current.time * 1000;
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
    
    const currentState = timerStateRef.current;
    const currentMode = currentState.mode;
    const currentSettings = currentState.settings;
    
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
    updateTimerState({
      time: newTime,
      totalTime: newTime
    });
  }, [updateTimerState]);

  const skipToNext = useCallback(() => {
    setIsActive(false);
    
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = null;
    }
    
    const currentState = timerStateRef.current;
    const currentMode = currentState.mode;
    const currentCycle = currentState.cycle;
    const currentSettings = currentState.settings;
    
    targetEndTimeRef.current = 0;
    
    // Usar o setTimeout para evitar problemas de batching
    setTimeout(() => {
      if (currentMode === TIMER_MODES.FOCUS) {
        if (currentCycle >= currentSettings.cyclesPerRound) {
          setMode(TIMER_MODES.LONG_BREAK);
          setCycle(1);
          updateTimerState({
            mode: TIMER_MODES.LONG_BREAK,
            cycle: 1
          });
        } else {
          setMode(TIMER_MODES.SHORT_BREAK);
          updateTimerState({
            mode: TIMER_MODES.SHORT_BREAK
          });
        }
      } else if (currentMode === TIMER_MODES.SHORT_BREAK) {
        setMode(TIMER_MODES.FOCUS);
        const newCycle = currentCycle + 1;
        setCycle(newCycle);
        updateTimerState({
          mode: TIMER_MODES.FOCUS,
          cycle: newCycle
        });
      } else {
        setMode(TIMER_MODES.FOCUS);
        setCycle(1);
        updateTimerState({
          mode: TIMER_MODES.FOCUS,
          cycle: 1
        });
      }
    }, 0);
  }, [updateTimerState]);

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
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Resetar o tempo alvo
    targetEndTimeRef.current = 0;
    
    // Atualizações de estado em um setTimeout para evitar loops
    setTimeout(() => {
      // Atualizar configurações
      setSettings(validatedSettings);
    
      // Reiniciar o timer
      setIsActive(false);
      setCycle(1);
      
      // Atualizar o tempo com base no modo atual
      const currentMode = timerStateRef.current.mode;
      
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
      updateTimerState({
        time: newTime,
        totalTime: newTime
      });
    }, 0);
  }, [updateTimerState]);

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
    skipToNext
  };
} 