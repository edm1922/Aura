'use client'

import { useState } from 'react'
import AuraOrbToggle from '@/components/visualizations/AuraOrbToggle'

export default function TestOrbPage() {
  const [traits, setTraits] = useState({
    openness: 3,
    conscientiousness: 3,
    extraversion: 3,
    agreeableness: 3,
    neuroticism: 3,
  })

  const handleTraitChange = (trait: string, value: number) => {
    setTraits(prev => ({
      ...prev,
      [trait]: value,
    }))
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-serif text-center mb-8">3D Aura Orb Test</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Orb Display */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <h2 className="text-xl font-medium mb-6">Interactive Aura Orb</h2>
            <AuraOrbToggle 
              traits={traits} 
              size="lg" 
              animated={true} 
              defaultMode="3d"
              showToggle={true}
            />
            <p className="mt-6 text-sm text-gray-500">
              Click and drag to rotate the orb. Use the toggle button to switch between 2D and 3D views.
            </p>
          </div>
          
          {/* Controls */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-medium mb-6">Adjust Personality Traits</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Openness: {traits.openness}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={traits.openness}
                  onChange={(e) => handleTraitChange('openness', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Practical</span>
                  <span>Creative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conscientiousness: {traits.conscientiousness}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={traits.conscientiousness}
                  onChange={(e) => handleTraitChange('conscientiousness', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Flexible</span>
                  <span>Organized</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extraversion: {traits.extraversion}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={traits.extraversion}
                  onChange={(e) => handleTraitChange('extraversion', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Introverted</span>
                  <span>Extraverted</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreeableness: {traits.agreeableness}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={traits.agreeableness}
                  onChange={(e) => handleTraitChange('agreeableness', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Challenging</span>
                  <span>Cooperative</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Neuroticism: {traits.neuroticism}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={traits.neuroticism}
                  onChange={(e) => handleTraitChange('neuroticism', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Stable</span>
                  <span>Sensitive</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
