'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
  glowEffect?: boolean
  delay?: number
}

export default function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  glowEffect = false,
  delay = 0,
}: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        glass rounded-xl p-6 
        ${hoverEffect ? 'hover:shadow-glow-md transition-shadow duration-300' : ''}
        ${glowEffect ? 'animate-glow' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}

// Variants for different card styles
export function GlassCardHeader({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mb-4 pb-4 border-b border-white/10 ${className}`}>
      {children}
    </div>
  )
}

export function GlassCardTitle({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={`text-lg font-serif font-medium text-primary-dark ${className}`}>
      {children}
    </h3>
  )
}

export function GlassCardContent({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  )
}

export function GlassCardFooter({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`mt-4 pt-4 border-t border-white/10 ${className}`}>
      {children}
    </div>
  )
}
