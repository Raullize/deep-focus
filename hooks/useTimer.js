'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const DEFAULT_SETTINGS = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  cyclesPerRound: 4,
  soundEnabled: true,
  autoStartNextCycle: false,
}

const TIMER_MODES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
}

// Função para obter configurações salvas (fora do componente)
const getSavedSettings = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  
  try {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (!savedSettings) return DEFAULT_SETTINGS;
    
    const parsedSettings = JSON.parse(savedSettings);
    // Garantir que todas as propriedades existam
    return { ...DEFAULT_SETTINGS, ...parsedSettings };
  } catch (e) {
    console.error('Erro ao carregar configurações:', e);
    return DEFAULT_SETTINGS;
  }
};

export default function useTimer() {
  // Inicialização segura - utilizamos DEFAULT_SETTINGS para o SSR
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [mode, setMode] = useState(TIMER_MODES.FOCUS);
  const [time, setTime] = useState(DEFAULT_SETTINGS.focusTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [cycle, setCycle] = useState(1);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const initializedRef = useRef(false);

  // Carregar configurações do localStorage apenas uma vez, quando estiver no cliente
  useEffect(() => {
    if (!initializedRef.current) {
      const savedSettings = getSavedSettings();
      setSettings(savedSettings);
      
      // Atualizar o tempo com base nas configurações carregadas
      if (mode === TIMER_MODES.FOCUS) {
        setTime(savedSettings.focusTime * 60);
      } else if (mode === TIMER_MODES.SHORT_BREAK) {
        setTime(savedSettings.shortBreakTime * 60);
      } else if (mode === TIMER_MODES.LONG_BREAK) {
        setTime(savedSettings.longBreakTime * 60);
      }
      
      initializedRef.current = true;
    }
  }, [mode]);

  // Inicializar áudio para notificações
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      
      fetch('/notification.mp3')
        .then(response => {
          if (response.ok) {
            audioRef.current.src = '/notification.mp3';
          } else {
            console.warn('Arquivo de notificação não encontrado');
            if ('Notification' in window && settings.soundEnabled) {
              Notification.requestPermission();
            }
          }
        })
        .catch(() => {});
    }
  }, [settings.soundEnabled]);

  // Atualizar timer com base em mudanças de modo
  useEffect(() => {
    if (!initializedRef.current) return;
    
    try {
      if (mode === TIMER_MODES.FOCUS) {
        setTime(settings.focusTime * 60);
      } else if (mode === TIMER_MODES.SHORT_BREAK) {
        setTime(settings.shortBreakTime * 60);
      } else if (mode === TIMER_MODES.LONG_BREAK) {
        setTime(settings.longBreakTime * 60);
      }
    } catch (error) {
      console.error('Erro ao atualizar o tempo:', error);
      setTime(25 * 60); // Valor padrão seguro
    }
  }, [mode, settings]);

  // Salvar configurações no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && initializedRef.current) {
      try {
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
      }
    }
  }, [settings]);

  // Lógica de contagem regressiva do timer
  useEffect(() => {
    if (!isActive) return;
    
    intervalRef.current = setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current);
          
          // Notificação sonora
          if (settings.soundEnabled) {
            if (audioRef.current && audioRef.current.src) {
              audioRef.current.play().catch(() => {});
            } else if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('DeepFocus', { 
                body: mode === TIMER_MODES.FOCUS ? 'Hora de descansar!' : 'Hora de focar!',
                icon: '/favicon.ico'
              });
            }
          }
          
          // Lógica de troca de modo
          if (mode === TIMER_MODES.FOCUS) {
            if (cycle >= settings.cyclesPerRound) {
              setMode(TIMER_MODES.LONG_BREAK);
              setCycle(1);
            } else {
              setMode(TIMER_MODES.SHORT_BREAK);
              setCycle(prev => prev + 1);
            }
          } else {
            setMode(TIMER_MODES.FOCUS);
          }
          
          // Auto-iniciar próximo ciclo, se configurado
          if (settings.autoStartNextCycle) {
            setTimeout(() => setIsActive(true), 100);
          } else {
            setIsActive(false);
          }
          
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isActive, mode, cycle, settings]);

  // Funções do timer
  const startTimer = useCallback(() => setIsActive(true), []);
  const pauseTimer = useCallback(() => setIsActive(false), []);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    
    if (mode === TIMER_MODES.FOCUS) {
      setTime(settings.focusTime * 60);
    } else if (mode === TIMER_MODES.SHORT_BREAK) {
      setTime(settings.shortBreakTime * 60);
    } else if (mode === TIMER_MODES.LONG_BREAK) {
      setTime(settings.longBreakTime * 60);
    }
  }, [mode, settings]);

  const skipToNext = useCallback(() => {
    setIsActive(false);
    
    if (mode === TIMER_MODES.FOCUS) {
      if (cycle >= settings.cyclesPerRound) {
        setMode(TIMER_MODES.LONG_BREAK);
        setCycle(1);
      } else {
        setMode(TIMER_MODES.SHORT_BREAK);
      }
    } else if (mode === TIMER_MODES.SHORT_BREAK) {
      setMode(TIMER_MODES.FOCUS);
      setCycle(prev => prev + 1);
    } else if (mode === TIMER_MODES.LONG_BREAK) {
      setMode(TIMER_MODES.FOCUS);
      setCycle(1);
    }
  }, [cycle, mode, settings.cyclesPerRound]);

  const updateSettings = useCallback((newSettings) => {
    // Validar e garantir valores seguros
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
    
    setSettings(validatedSettings);
    
    // Atualizar tempo imediatamente
    if (mode === TIMER_MODES.FOCUS) {
      setTime(validatedSettings.focusTime * 60);
    } else if (mode === TIMER_MODES.SHORT_BREAK) {
      setTime(validatedSettings.shortBreakTime * 60);
    } else if (mode === TIMER_MODES.LONG_BREAK) {
      setTime(validatedSettings.longBreakTime * 60);
    }
  }, [mode]);

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
  };
} 