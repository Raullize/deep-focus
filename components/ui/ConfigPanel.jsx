'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useTranslation from '../../i18n/useTranslation'

// Valores padrão para garantir que sempre tenhamos configurações válidas
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

// Lista de sons disponíveis
const NOTIFICATION_SOUNDS = [
  { id: 'notification1', name: 'Notificação 1' },
  { id: 'notification10', name: 'Notificação 2' },
  { id: 'notification11', name: 'Notificação 3' },
  { id: 'notification12', name: 'Notificação 4' },
  { id: 'notification2', name: 'Notificação 5' },
  { id: 'notification3', name: 'Notificação 6' },
  { id: 'notification4', name: 'Notificação 7' },
  { id: 'notification5', name: 'Notificação 8' },
  { id: 'notification6', name: 'Notificação 9' },
  { id: 'notification7', name: 'Notificação 10' },
  { id: 'notification8', name: 'Notificação 11' },
  { id: 'notification9', name: 'Notificação 12' },
]

const ConfigPanel = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const { t } = useTranslation()
  const audioRef = useRef(null)
  
  // Estado para controlar o modal de confirmação de reset
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  
  // Garantir que temos um objeto settings válido e com valores padrão para propriedades ausentes
  const safeSettings = { ...DEFAULT_SETTINGS, ...(settings || {}) }
  
  // Inicializar com os valores seguros
  const [localSettings, setLocalSettings] = useState(safeSettings)

  // Atualizar apenas quando temos configurações válidas
  useEffect(() => {
    if (settings && typeof settings === 'object') {
      setLocalSettings({ ...DEFAULT_SETTINGS, ...settings })
    }
  }, [settings])

  // Inicializar o elemento de áudio para teste de som
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio()
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [])

  const handleInputChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: parseInt(value, 10) || 0
    }))
  }

  const handleToggle = (field) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }
  
  const handleSelectChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const handleTestSound = (soundId) => {
    if (audioRef.current) {
      // Parar qualquer reprodução atual
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      
      // Carregar e reproduzir o som selecionado
      audioRef.current.src = `/notifications/${soundId}.mp3`
      audioRef.current.play().catch(error => {
        console.error('Erro ao reproduzir som:', error)
      })
    }
  }
  
  const handleResetToDefaults = () => {
    // Ao invés de resetar diretamente, abrir o modal de confirmação
    setIsResetModalOpen(true)
  }
  
  const confirmReset = () => {
    // Resetar para valores padrão
    setLocalSettings(DEFAULT_SETTINGS)
    // Fechar o modal de confirmação
    setIsResetModalOpen(false)
    // Salvar automaticamente
    onUpdateSettings(DEFAULT_SETTINGS)
  }
  
  const cancelReset = () => {
    // Apenas fechar o modal de confirmação
    setIsResetModalOpen(false)
  }

  const handleSave = () => {
    onUpdateSettings(localSettings)
    onClose()
  }

  // Se não tivermos configurações válidas, não renderize
  if (!localSettings) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="config-panel-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-labelledby="settings-title"
          aria-modal="true"
        >
          <motion.div
            key="config-panel-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-[90%] max-w-md bg-gray-900 rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 id="settings-title" className="text-xl font-bold text-primary">{t('settings')}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-800"
                aria-label={t('close')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <SettingItem 
                label={t('focusLength')}
                value={localSettings.focusTime}
                onChange={(e) => handleInputChange('focusTime', e.target.value)}
                min={1}
                max={90}
                unit={t('minutes')}
              />
              
              <SettingItem 
                label={t('shortBreakLength')}
                value={localSettings.shortBreakTime}
                onChange={(e) => handleInputChange('shortBreakTime', e.target.value)}
                min={1}
                max={30}
                unit={t('minutes')}
              />
              
              <SettingItem 
                label={t('longBreakLength')}
                value={localSettings.longBreakTime}
                onChange={(e) => handleInputChange('longBreakTime', e.target.value)}
                min={1}
                max={60}
                unit={t('minutes')}
              />
              
              <SettingItem 
                label={t('cyclesUntilLongBreak')}
                value={localSettings.cyclesPerRound}
                onChange={(e) => handleInputChange('cyclesPerRound', e.target.value)}
                min={1}
                max={10}
                unit={t('cycles')}
              />
              
              <ToggleItem 
                label={t('soundNotification')}
                isEnabled={localSettings.soundEnabled}
                onToggle={() => handleToggle('soundEnabled')}
              />
              
              {localSettings.soundEnabled && (
                <SoundSelectorItem
                  label={t('notificationSound')}
                  value={localSettings.notificationSound}
                  onChange={(value) => handleSelectChange('notificationSound', value)}
                  onTest={handleTestSound}
                  options={NOTIFICATION_SOUNDS}
                />
              )}
              
              <ToggleItem 
                label={t('autoStartNextCycle')}
                isEnabled={localSettings.autoStartNextCycle}
                onToggle={() => handleToggle('autoStartNextCycle')}
              />
              
              {/* Opção para mostrar/ocultar atalhos de teclado (apenas na versão desktop) */}
              <div className="hidden md:block">
                <ToggleItem 
                  label={t('showKeyboardShortcuts')}
                  isEnabled={localSettings.showKeyboardShortcuts}
                  onToggle={() => handleToggle('showKeyboardShortcuts')}
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={handleResetToDefaults}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                {t('resetToDefaults')}
              </button>
              
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 transition-colors"
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      
      {/* Modal de Confirmação para Reset */}
      <AnimatePresence>
        {isResetModalOpen && (
          <motion.div
            key="reset-confirm-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && cancelReset()}
            role="dialog"
            aria-labelledby="reset-confirm-title"
            aria-modal="true"
          >
            <motion.div
              key="reset-confirm-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-[90%] max-w-sm bg-gray-900 rounded-xl p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 id="reset-confirm-title" className="text-lg font-medium text-center mb-4">{t('confirmReset')}</h3>
              <p className="text-sm text-gray-300 text-center mb-6">{t('confirmResetMessage')}</p>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={cancelReset}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={confirmReset}
                  className="px-4 py-2 bg-error text-white rounded-lg font-medium hover:bg-error/80 transition-colors"
                >
                  {t('confirmYes')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}

const SettingItem = ({ label, value, onChange, min, max, unit }) => {
  // Gera um ID único para este campo específico
  const inputId = `input-${label.replace(/\s+/g, '-').toLowerCase()}`
  const rangeId = `range-${label.replace(/\s+/g, '-').toLowerCase()}`
  
  return (
    <div className="flex flex-col py-2">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={inputId} className="text-onBackground">{label}</label>
        <div className="flex items-center space-x-2">
          <input
            id={inputId}
            type="number"
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            className="w-16 px-2 py-1 rounded bg-gray-800 text-center focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label={`${label} (${min}-${max} ${unit})`}
          />
          <span className="text-sm text-gray-400">{unit}</span>
        </div>
      </div>
      <label htmlFor={rangeId} className="sr-only">{`${label} - slider`}</label>
      <input
        id={rangeId}
        type="range"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
    </div>
  )
}

const ToggleItem = ({ label, isEnabled, onToggle }) => {
  // Generate a unique ID for this toggle
  const id = `toggle-${label.replace(/\s+/g, '-').toLowerCase()}`
  
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-onBackground">{label}</span>
      <label 
        htmlFor={id} 
        className="cursor-pointer"
        onClick={(e) => e.preventDefault()}
      >
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={isEnabled}
          onChange={onToggle}
          aria-label={label}
        />
        <button 
          type="button"
          onClick={onToggle}
          role="switch"
          aria-checked={isEnabled}
          className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
            isEnabled ? 'bg-primary justify-end' : 'bg-gray-700 justify-start'
          }`}
        >
          <motion.div 
            layout
            className="w-4 h-4 bg-white rounded-full"
          />
        </button>
      </label>
    </div>
  )
}

const SoundSelectorItem = ({ label, value, onChange, onTest, options }) => {
  // Gera um ID único para este campo específico
  const groupName = `sound-selector-${label.replace(/\s+/g, '-').toLowerCase()}`
  
  return (
    <div className="flex flex-col py-2" role="radiogroup" aria-labelledby={`${groupName}-label`}>
      <div id={`${groupName}-label`} className="text-onBackground mb-2">{label}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
        {options.map((option) => (
          <div key={option.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-2">
            <div className="flex items-center">
              <input
                type="radio"
                id={`${groupName}-${option.id}`}
                name={groupName}
                value={option.id}
                checked={value === option.id}
                onChange={() => onChange(option.id)}
                className="mr-2"
              />
              <label htmlFor={`${groupName}-${option.id}`} className="text-sm">
                {option.name}
              </label>
            </div>
            <button
              type="button"
              onClick={() => onTest(option.id)}
              className="p-1 ml-2 text-xs bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              aria-label={`Testar som ${option.name}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ConfigPanel 