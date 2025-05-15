'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/context/ThemeContext'
import AuraBadge from './AuraBadge'
import { generateTheme } from '@/lib/themeGenerator'
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline'

interface ThemeCustomizerProps {
  traits?: Record<string, number>
  className?: string
}

export default function ThemeCustomizer({
  traits,
  className = '',
}: ThemeCustomizerProps) {
  const { theme, setTheme, updateThemeFromTraits, resetToDefault } = useTheme()
  const [showThemeDetails, setShowThemeDetails] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Generate a new theme variation
  const generateNewVariation = () => {
    if (!traits) return
    
    setIsGenerating(true)
    
    // Add some randomness to the traits to get a different theme
    const modifiedTraits = { ...traits }
    
    // Slightly modify each trait value (±0.5)
    Object.keys(modifiedTraits).forEach(trait => {
      const randomAdjustment = (Math.random() - 0.5) * 1.0
      modifiedTraits[trait] = Math.max(1, Math.min(5, modifiedTraits[trait] + randomAdjustment))
    })
    
    // Generate a new theme with the modified traits
    const newTheme = generateTheme(modifiedTraits)
    setTheme(newTheme)
    
    setTimeout(() => {
      setIsGenerating(false)
    }, 600)
  }
  
  // Reset to personality-based theme
  const resetToPersonalityTheme = () => {
    if (traits) {
      updateThemeFromTraits(traits)
    }
  }
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Your Aura Theme
        </h2>
        
        <AuraBadge 
          size="sm" 
          onClick={() => setShowThemeDetails(!showThemeDetails)} 
        />
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {theme.description}
        </p>
      </div>
      
      {/* Theme preview */}
      <div className="mb-6">
        <div className="flex items-center justify-center py-8 bg-gray-50 rounded-lg">
          <AuraBadge size="lg" showLabel={true} />
        </div>
      </div>
      
      {/* Theme details (collapsible) */}
      {showThemeDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-sm font-medium text-gray-700 mb-2">Theme Colors</h3>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded mr-2" 
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-xs text-gray-600">Primary</span>
            </div>
            
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded mr-2" 
                style={{ backgroundColor: theme.secondary }}
              />
              <span className="text-xs text-gray-600">Secondary</span>
            </div>
            
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded mr-2" 
                style={{ backgroundColor: theme.accent }}
              />
              <span className="text-xs text-gray-600">Accent</span>
            </div>
            
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded mr-2" 
                style={{ backgroundColor: theme.background }}
              />
              <span className="text-xs text-gray-600">Background</span>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Theme actions */}
      <div className="flex flex-col space-y-2">
        <button
          onClick={generateNewVariation}
          disabled={!traits || isGenerating}
          className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
            !traits || isGenerating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'text-white bg-primary hover:bg-primary/90'
          }`}
        >
          {isGenerating ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Generate Variation
            </>
          )}
        </button>
        
        <button
          onClick={resetToPersonalityTheme}
          disabled={!traits}
          className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
            !traits
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'text-primary bg-primary/10 hover:bg-primary/20'
          }`}
        >
          <CheckIcon className="h-4 w-4 mr-2" />
          Reset to Personality Theme
        </button>
        
        <button
          onClick={resetToDefault}
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Reset to Default Theme
        </button>
      </div>
    </div>
  )
}
