'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface AuraLevelOrbProps {
  level: number
  progress: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: string
  showLevel?: boolean
}

export default function AuraLevelOrb({
  level,
  progress,
  size = 'md',
  className = '',
  color = '#8B5CF6',
  showLevel = true
}: AuraLevelOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // Size mapping
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160
  }
  
  const orbSize = sizeMap[size]
  
  // Draw the orb
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8
    
    // Draw background circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
    ctx.fill()
    
    // Draw progress arc
    const startAngle = -Math.PI / 2 // Start from top
    const endAngle = startAngle + (Math.PI * 2 * (progress / 100))
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.lineTo(centerX, centerY)
    ctx.closePath()
    
    // Create gradient for progress
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, adjustColor(color, 30))
    
    ctx.fillStyle = gradient
    ctx.fill()
    
    // Draw inner circle
    const innerRadius = radius * 0.85
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fill()
    
    // Draw glow effect
    const glowRadius = radius * 1.1
    const glowGradient = ctx.createRadialGradient(
      centerX, centerY, radius,
      centerX, centerY, glowRadius
    )
    glowGradient.addColorStop(0, `${color}40`)
    glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2)
    ctx.fillStyle = glowGradient
    ctx.fill()
    
    // Draw particles
    const particleCount = 10 + level * 2
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * radius * 1.2
      
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance
      
      const particleSize = Math.random() * 2 + 1
      const particleOpacity = Math.random() * 0.7 + 0.3
      
      ctx.beginPath()
      ctx.arc(x, y, particleSize, 0, Math.PI * 2)
      ctx.fillStyle = `${color}${Math.round(particleOpacity * 255).toString(16).padStart(2, '0')}`
      ctx.fill()
    }
    
    // Draw level text if showLevel is true
    if (showLevel) {
      ctx.font = `bold ${radius * 0.5}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = color
      ctx.fillText(level.toString(), centerX, centerY)
    }
  }, [level, progress, color, showLevel, orbSize])
  
  // Helper function to adjust color brightness
  function adjustColor(color: string, amount: number): string {
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16)
    let g = parseInt(color.substring(3, 5), 16)
    let b = parseInt(color.substring(5, 7), 16)
    
    // Adjust brightness
    r = Math.min(255, Math.max(0, r + amount))
    g = Math.min(255, Math.max(0, g + amount))
    b = Math.min(255, Math.max(0, b + amount))
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  
  return (
    <motion.div 
      className={`relative ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{ 
        duration: 0.5,
        rotate: {
          repeat: Infinity,
          duration: 10,
          ease: "easeInOut"
        }
      }}
    >
      <canvas 
        ref={canvasRef} 
        width={orbSize} 
        height={orbSize}
        className="mx-auto"
      />
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/50 blur-sm"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 20 - 10],
              y: [0, Math.random() * 20 - 10],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
