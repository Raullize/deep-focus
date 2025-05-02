'use client'

import { useState, useEffect } from 'react'

const TimerDisplay = ({ time }) => {
  // Estado para armazenar o tempo formatado
  const [displayTime, setDisplayTime] = useState("25:00")
  
  // Atualiza o tempo formatado quando o tempo muda
  useEffect(() => {
    // Garantindo que time seja um número válido
    const safeTime = typeof time === 'number' && !isNaN(time) ? time : 1500
    
    // Calculando horas, minutos e segundos
    const hours = Math.floor(safeTime / 3600)
    const minutes = Math.floor((safeTime % 3600) / 60)
    const seconds = safeTime % 60
    
    // Formatando com zeros à esquerda
    const formatDigit = digit => digit.toString().padStart(2, '0')
    
    // Formatando o tempo final
    const formatted = hours > 0 
      ? `${formatDigit(hours)}:${formatDigit(minutes)}:${formatDigit(seconds)}`
      : `${formatDigit(minutes)}:${formatDigit(seconds)}`
    
    setDisplayTime(formatted)
  }, [time])

  return (
    <div className="text-center">
      <div className="text-[8vw] md:text-[5vw] font-mono font-bold tracking-wider transition-all duration-300">
        {displayTime}
      </div>
    </div>
  )
}

export default TimerDisplay 