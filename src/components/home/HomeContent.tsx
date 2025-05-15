'use client'

import StartTestButton from '@/components/StartTestButton'
import { SparklesIcon, StarIcon, MoonIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

export default function HomeContent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/10 blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-accent-alt/10 blur-3xl"></div>
        
        {/* Floating elements */}
        <motion.div 
          className="absolute top-20 right-[20%]"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <SparklesIcon className="h-8 w-8 text-primary/40" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 left-[15%]"
          animate={{ 
            y: [0, 20, 0],
            rotate: [0, -8, 0]
          }}
          transition={{ 
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <StarIcon className="h-10 w-10 text-accent-alt/40" />
        </motion.div>
        
        <motion.div 
          className="absolute top-1/3 left-[10%]"
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <MoonIcon className="h-6 w-6 text-accent/40" />
        </motion.div>
      </div>
      
      <div className="max-w-4xl w-full space-y-12 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-serif font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Your Personality
          </h1>
          
          <motion.div
            className="mt-6 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="text-xl text-text-light">
              Take our AI-powered personality test to gain insights into your unique traits and characteristics.
            </p>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="glass p-8 rounded-2xl max-w-3xl mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h2 className="text-2xl font-serif font-medium text-primary-dark mb-4">
                Personalized Insights
              </h2>
              <p className="text-text-light mb-6">
                Our AI analyzes your responses to generate personalized insights about your personality traits, strengths, and potential growth areas.
              </p>
              <StartTestButton />
            </div>
            
            <div className="flex-1 flex justify-center">
              <motion.div
                className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                animate={{ 
                  boxShadow: ['0 0 15px rgba(139, 92, 246, 0.3)', '0 0 25px rgba(139, 92, 246, 0.5)', '0 0 15px rgba(139, 92, 246, 0.3)']
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div 
                  className="absolute inset-3 rounded-full bg-gradient-to-tr from-primary/40 to-accent-alt/40 backdrop-blur-sm"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                  <SparklesIcon className="h-12 w-12 text-primary" />
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          className="text-center text-sm text-text-light/70 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          Powered by advanced AI to provide unique, personalized questions for each test-taker
        </motion.div>
      </div>
    </div>
  )
}
