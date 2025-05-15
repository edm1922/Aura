'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggeredListProps {
  children: ReactNode[]
  staggerDelay?: number
  className?: string
}

export default function StaggeredList({
  children,
  staggerDelay = 0.1,
  className = '',
}: StaggeredListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
