'use client'

import { useState, useEffect } from 'react'
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
}

const ConfigPanel = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const { t } = useTranslation()
  
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
  
  const handleResetToDefaults = () => {
    setLocalSettings(DEFAULT_SETTINGS)
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-[90%] max-w-md bg-gray-900 rounded-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary">{t('settings')}</h2>
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
              
              <ToggleItem 
                label={t('autoStartNextCycle')}
                isEnabled={localSettings.autoStartNextCycle}
                onToggle={() => handleToggle('autoStartNextCycle')}
              />
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
    </AnimatePresence>
  )
}

const SettingItem = ({ label, value, onChange, min, max, unit }) => {
  // Gera um ID único para este campo específico
  const id = `setting-${label.replace(/\s+/g, '-').toLowerCase()}`
  
  return (
    <div className="flex flex-col py-2">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="text-onBackground">{label}</label>
        <div className="flex items-center space-x-2">
          <input
            id={id}
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
      <input
        type="range"
        aria-labelledby={id}
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
      <label htmlFor={id} className="text-onBackground">{label}</label>
      <button 
        id={id}
        onClick={onToggle}
        role="switch"
        aria-checked={isEnabled}
        aria-labelledby={id}
        className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
          isEnabled ? 'bg-primary justify-end' : 'bg-gray-700 justify-start'
        }`}
      >
        <motion.div 
          layout
          className="w-4 h-4 bg-white rounded-full"
        />
      </button>
    </div>
  )
}

export default ConfigPanel 