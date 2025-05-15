'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { generateTheme, Theme } from '@/lib/themeGenerator'

// Default theme
const defaultTheme: Theme = {
  name: 'Default',
  description: 'The default application theme.',
  primary: '#4F46E5', // Indigo
  secondary: '#C7D2FE', // Light indigo
  accent: '#10B981', // Emerald
  background: '#F9FAFB', // Gray 50
  text: '#374151', // Gray 700
  badge: {
    background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
    border: '#C7D2FE',
    shadow: 'rgba(79, 70, 229, 0.3)',
  },
}

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  updateThemeFromTraits: (traits: Record<string, number>) => void
  applyThemeToDocument: () => void
  resetToDefault: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  
  // Update theme based on personality traits
  const updateThemeFromTraits = (traits: Record<string, number>) => {
    const newTheme = generateTheme(traits)
    setTheme(newTheme)
    
    // Save theme to localStorage
    localStorage.setItem('aura-theme', JSON.stringify(newTheme))
  }
  
  // Apply theme to document (CSS variables)
  const applyThemeToDocument = () => {
    const root = document.documentElement
    
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-secondary', theme.secondary)
    root.style.setProperty('--color-accent', theme.accent)
    root.style.setProperty('--color-background', theme.background)
    root.style.setProperty('--color-text', theme.text)
    root.style.setProperty('--badge-background', theme.badge.background)
    root.style.setProperty('--badge-border', theme.badge.border)
    root.style.setProperty('--badge-shadow', theme.badge.shadow)
  }
  
  // Reset to default theme
  const resetToDefault = () => {
    setTheme(defaultTheme)
    localStorage.removeItem('aura-theme')
  }
  
  // Load theme from localStorage on initial render
  useEffect(() => {
    const savedTheme = localStorage.getItem('aura-theme')
    
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme)
        setTheme(parsedTheme)
      } catch (error) {
        console.error('Error parsing saved theme:', error)
        // If there's an error parsing, use default theme
        setTheme(defaultTheme)
      }
    }
  }, [])
  
  // Apply theme whenever it changes
  useEffect(() => {
    applyThemeToDocument()
  }, [theme])
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        updateThemeFromTraits,
        applyThemeToDocument,
        resetToDefault,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}
