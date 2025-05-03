'use client'

import { useState, useEffect } from 'react'

const CIRCLE_RADIUS = 116
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

const GRADIENT_COLORS = {
  focus: ["#3B82F6", "#8B5CF6", "#EC4899"], // Blue to Purple to Pink
  shortBreak: ["#10B981", "#059669", "#047857"], // Green shades
  longBreak: ["#6366F1", "#4F46E5", "#4338CA"], // Indigo shades
}

const TimerDisplay = ({ time, totalTime, mode }) => {
  const [displayTime, setDisplayTime] = useState("25:00")
  
  const progressPercentage = totalTime > 0 ? (time / totalTime) * 100 : 0
  const colors = GRADIENT_COLORS[mode] || GRADIENT_COLORS.focus

  useEffect(() => {
    const safeTime = typeof time === 'number' && !isNaN(time) ? time : 1500
    const roundedTime = Math.ceil(safeTime)
    
    const hours = Math.floor(roundedTime / 3600)
    const minutes = Math.floor((roundedTime % 3600) / 60)
    const seconds = Math.floor(roundedTime % 60)
    
    const formatDigit = digit => digit.toString().padStart(2, '0')
    
    const formatted = hours > 0 
      ? `${formatDigit(hours)}:${formatDigit(minutes)}:${formatDigit(seconds)}`
      : `${formatDigit(minutes)}:${formatDigit(seconds)}`
    
    setDisplayTime(formatted)
  }, [time])

  return (
    <div className="text-center relative">
      <div className="relative flex items-center justify-center w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[380px] md:h-[380px] mx-auto">
        <svg 
          className="absolute transform -rotate-90 w-full h-full" 
          viewBox="0 0 250 250"
        >
          <circle
            cx="125"
            cy="125"
            r={CIRCLE_RADIUS}
            fill="transparent"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {colors.map((color, index) => (
                <stop 
                  key={index} 
                  offset={`${index * 50}%`} 
                  stopColor={color} 
                />
              ))}
            </linearGradient>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          <circle
            cx="125"
            cy="125"
            r={CIRCLE_RADIUS}
            fill="transparent"
            stroke="url(#progressGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - progressPercentage / 100)}
            style={{ transition: 'none' }}
            filter="url(#glow)"
          />
        </svg>
        
        <div className="text-[8vw] md:text-[5vw] font-mono font-bold tracking-wider transition-all duration-300 z-10">
          {displayTime}
        </div>
      </div>
    </div>
  )
}

export default TimerDisplay 