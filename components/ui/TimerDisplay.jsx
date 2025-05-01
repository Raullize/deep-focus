'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const TimerDisplay = ({ time, isActive }) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = time % 60
  
  const prevTimeRef = useRef({ hours, minutes, seconds })
  
  useEffect(() => {
    prevTimeRef.current = { hours, minutes, seconds }
  }, [hours, minutes, seconds])

  const formatDigit = (digit) => {
    return digit.toString().padStart(2, '0')
  }
  
  // Format time as 00:00:00 or 00:00 if hours is 0
  const formattedTime = hours > 0 
    ? `${formatDigit(hours)}:${formatDigit(minutes)}:${formatDigit(seconds)}`
    : `${formatDigit(minutes)}:${formatDigit(seconds)}`

  const containerVariants = {
    active: {
      scale: 1.05,
      transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
    },
    inactive: {
      scale: 1,
      transition: { duration: 0.5 }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      animate={isActive ? "active" : "inactive"}
      className="text-center"
    >
      <div className="text-[8vw] md:text-[5vw] font-mono font-bold tracking-wider transition-all duration-300">
        {formattedTime}
      </div>
    </motion.div>
  )
}

export default TimerDisplay 