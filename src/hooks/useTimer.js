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
  const [notificationPermission, setNotificationPermission] = useState('default');
  
  // Pure Refs (not connected to state)
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);
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
  const audioUnlocked = useRef(false);
  const audioInitializationAttempted = useRef(false);
  
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

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
          return permission;
        } catch (error) {
          console.error('Erro ao solicitar permissão de notificação:', error);
          return 'default';
        }
      }
      return Notification.permission;
    }
    return 'default';
  }, []);

  // Inicializar o AudioContext - Modificado para previnir warning
  const initAudioContext = useCallback(() => {
    // Se já foi tentado inicializar e não há interação do usuário, não tente novamente
    if (audioInitializationAttempted.current && !audioContextRef.current) return;
    
    if (typeof window === 'undefined' || !window.AudioContext && !window.webkitAudioContext) return;
    
    try {
      // Só criar o AudioContext se ainda não existe
      if (!audioContextRef.current) {
        audioInitializationAttempted.current = true;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
        
        // Pré-carregar o buffer de áudio
        const loadSound = async () => {
          if (settings.soundEnabled && audioContextRef.current) {
            const timestamp = new Date().getTime();
            const soundPath = `/notifications/${settings.notificationSound}.mp3?t=${timestamp}`;
            audioBufferRef.current = await loadAudioBuffer(soundPath);
          }
        };
        
        loadSound().catch(console.error);
      }
      
      // Se o contexto estiver suspenso (política de autoplay), tentamos retomá-lo
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (error) {
      console.error('Erro ao inicializar AudioContext:', error);
    }
  }, [settings.soundEnabled, settings.notificationSound]);

  // Unlock audio for iOS and similar browsers with audio autoplay restrictions
  const unlockAudio = useCallback(() => {
    if (audioUnlocked.current) return;
    
    try {
      // Inicialize o AudioContext se ainda não foi feito
      initAudioContext();
      
      // Create and play a silent audio to unlock audio context
      if (audioContextRef.current) {
        // Cria um buffer de silêncio
        const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        
        // Tocar o som (vai destravar o áudio em alguns navegadores)
        source.start(0);
        
        // Também tentamos o método tradicional com o elemento de áudio
        const silentAudio = new Audio();
        silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABPgD///////////////////////////////////////////8AAAA8TEFNRTMuMTAwAQAAAAAAAAAAABSAJAi4hAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASDEwMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuMTAwBK8AAAAAAAAAADUgJAYXQQABrgAAPlD/ywFYAAABAAAAYS8ySgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQRMSBwAABpAAAACAAADSAAAAEAAAGkAAAAIAAANIAAAAQAAAAAAAAAAAAAAAAAAA=';
        silentAudio.volume = 0.01;
        silentAudio.loop = false;
        
        const playPromise = silentAudio.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Audio successfully unlocked
              audioUnlocked.current = true;
              silentAudio.pause();
              silentAudio.src = '';
            })
            .catch(error => {
              // Auto-play was prevented - requires user interaction
              console.log('Audio auto-play prevented, requires user interaction');
            });
        }
      }
    } catch (error) {
      console.error('Error unlocking audio:', error);
    }
  }, [initAudioContext]);

  // Carregar o buffer de áudio
  const loadAudioBuffer = useCallback(async (url) => {
    if (!audioContextRef.current) return null;
    
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio buffer:', error);
      return null;
    }
  }, []);

  // Audio notification setup - Modificado para evitar inicialização automática do AudioContext
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadAudio = async () => {
      try {
        // Não inicializar automaticamente o AudioContext aqui
        // Apenas configurar o elemento de áudio tradicional, que é mais seguro
        
        // Verificar permissão de notificação
        if ('Notification' in window && settings.soundEnabled && Notification.permission === 'default') {
          requestNotificationPermission();
        }
        
        // Método tradicional (fallback)
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        const timestamp = new Date().getTime();
        const soundPath = `/notifications/${settings.notificationSound}.mp3?t=${timestamp}`;
        
        audioRef.current.src = soundPath;
        audioRef.current.load();
      } catch (error) {
        console.error('Erro ao configurar áudio:', error);
      }
    };
    
    if (settings.soundEnabled) {
      loadAudio();
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [settings.soundEnabled, settings.notificationSound, requestNotificationPermission]);

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
  
  // Verificação do timestamp do último timer expirado (para background)
  useEffect(() => {
    if (typeof window === 'undefined' || !isActive) return;
    
    // Armazenar o tempo alvo no localStorage
    if (targetEndTimeRef.current > 0) {
      try {
        localStorage.setItem('timerEndTime', targetEndTimeRef.current.toString());
      } catch (error) {
        // Ignorar erro
      }
    }
    
    // Checar regularmente se passou do tempo alvo quando em background
    const checkInterval = setInterval(() => {
      const now = Date.now();
      try {
        const storedEndTime = parseInt(localStorage.getItem('timerEndTime') || '0', 10);
        
        // Se já passou do tempo e ainda não foi tratado
        if (storedEndTime > 0 && now >= storedEndTime && isActive) {
          // Limpar o tempo armazenado
          localStorage.removeItem('timerEndTime');
          
          // Finalizar o timer manualmente
          if (intervalRef.current) {
            cancelAnimationFrame(intervalRef.current);
            intervalRef.current = null;
          }
          
          // Definir tempo para 0
          updateTimerState({ time: 0 });
          syncStateFromRef();
          
          // Disparar notificação e som
          playNotificationSound();
          
          // Lidar com a conclusão do timer
          handleTimerCompletion();
        }
      } catch (error) {
        // Ignorar erro
      }
    }, 1000);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [isActive, syncStateFromRef]);

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
      
      // Armazenar também no localStorage para detecção em background
      try {
        localStorage.setItem('timerEndTime', targetEndTimeRef.current.toString());
      } catch (error) {
        // Ignorar erro
      }
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
        
        // Limpar o tempo armazenado no localStorage
        try {
          localStorage.removeItem('timerEndTime');
        } catch (error) {
          // Ignorar erro
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
    
    // 1. Mostrar notificação do navegador se permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('DeepFocus', { 
          body: currentMode === TIMER_MODES.FOCUS ? 'Time to take a break!' : 'Time to focus!',
          icon: '/favicon.ico',
          silent: true // Desativar o som padrão da notificação
        });
        
        // Fechar notificação após alguns segundos
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error('Erro ao mostrar notificação:', error);
      }
    }
    
    // 2. Reproduzir som usando Web Audio API (melhor para background)
    try {
      if (audioContextRef.current && audioBufferRef.current) {
        // Retomar o contexto de áudio se estiver suspenso
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        // Criar source node
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBufferRef.current;
        
        // Conectar ao destino (alto-falantes)
        source.connect(audioContextRef.current.destination);
        
        // Definir volume
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = 1.0; // volume máximo
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        // Reproduzir o som
        source.start(0);
        
        return; // Se Web Audio API funcionou, não precisamos do fallback
      }
    } catch (error) {
      console.error('Erro ao reproduzir som com Web Audio API:', error);
    }
    
    // 3. Fallback: usar elemento de áudio tradicional
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 1.0;
        
        // Tentar forçar a reprodução do áudio
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Erro ao reproduzir áudio com elemento HTML:', error);
          });
        }
      }
    } catch (error) {
      console.error('Erro ao reproduzir som de notificação:', error);
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
    
    // Limpar localStorage
    try {
      localStorage.removeItem('timerEndTime');
    } catch (error) {
      // Ignorar erro
    }
    
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
    // Desbloquear áudio ao iniciar o timer (necessário para iOS/Safari)
    unlockAudio();
    
    // Inicializar AudioContext - isso é seguro porque está respondendo a uma interação do usuário
    initAudioContext();
    
    // Solicitar permissão de notificação se ainda não solicitada
    if ('Notification' in window && settings.soundEnabled && Notification.permission === 'default') {
      requestNotificationPermission();
    }
    
    if (!isActive) {
      targetEndTimeRef.current = Date.now() + timerStateRef.current.time * 1000;
    }
    setIsActive(true);
  }, [isActive, settings.soundEnabled, unlockAudio, requestNotificationPermission, initAudioContext]);
  
  const pauseTimer = useCallback(() => {
    setIsActive(false);
    
    // Limpar o tempo armazenado no localStorage
    try {
      localStorage.removeItem('timerEndTime');
    } catch (error) {
      // Ignorar erro
    }
  }, []);
  
  const resetTimer = useCallback(() => {
    setIsActive(false);
    
    if (intervalRef.current) {
      cancelAnimationFrame(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Limpar o tempo armazenado no localStorage
    try {
      localStorage.removeItem('timerEndTime');
    } catch (error) {
      // Ignorar erro
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
    
    // Limpar o tempo armazenado no localStorage
    try {
      localStorage.removeItem('timerEndTime');
    } catch (error) {
      // Ignorar erro
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
    
    // Limpar localStorage
    try {
      localStorage.removeItem('timerEndTime');
    } catch (error) {
      // Ignorar erro
    }
    
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
    skipToNext,
    notificationPermission,
    requestNotificationPermission
  };
} 