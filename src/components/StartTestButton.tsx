'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SparklesIcon } from '@heroicons/react/24/outline'

export default function StartTestButton() {
  const router = useRouter()

  const handleStartTest = () => {
    router.push('/test')
  }

  return (
    <motion.button
      className="bg-gradient-to-r from-primary to-primary-dark text-white px-8 py-3 rounded-full font-medium
                shadow-md hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center gap-2"
      onClick={handleStartTest}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15,
        delay: 0.2
      }}
    >
      <SparklesIcon className="h-5 w-5" />
      <span>Start AI Test</span>

      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/20"
        animate={{
          opacity: [0, 0.5, 0],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  )
}
