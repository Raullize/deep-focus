'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useTranslation from '../../i18n/useTranslation'

const ConfigPanel = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  const { t } = useTranslation()
  const [localSettings, setLocalSettings] = useState(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleInputChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: parseInt(value, 10) || 0
    }))
  }

  const handleSoundToggle = () => {
    setLocalSettings(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }))
  }

  const handleSave = () => {
    onUpdateSettings(localSettings)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-2xl p-6 z-50 max-w-md mx-auto"
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
              
              <div className="flex justify-between items-center py-2">
                <label className="text-onBackground">{t('soundNotification')}</label>
                <button 
                  onClick={handleSoundToggle}
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${
                    localSettings.soundEnabled ? 'bg-primary justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <motion.div 
                    layout
                    className="w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/80 transition-colors"
              >
                {t('save')}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const SettingItem = ({ label, value, onChange, min, max, unit }) => {
  return (
    <div className="flex flex-col py-2">
      <div className="flex justify-between items-center mb-2">
        <label className="text-onBackground">{label}</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            className="w-16 px-2 py-1 rounded bg-gray-800 text-center focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-sm text-gray-400">{unit}</span>
        </div>
      </div>
      <input
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

export default ConfigPanel 