'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/24/outline'

interface OnboardingTask {
  id: string
  title: string
  description: string
  completed: boolean
}

export default function OnboardingProgress() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your personal information to get personalized insights.',
      completed: false,
    },
    {
      id: 'first-test',
      title: 'Take your first test',
      description: 'Complete a personality assessment to discover your traits.',
      completed: false,
    },
    {
      id: 'generate-insights',
      title: 'Generate insights',
      description: 'Use AI to analyze your personality traits and get personalized insights.',
      completed: false,
    },
    {
      id: 'share-results',
      title: 'Share your results',
      description: 'Share your personality profile with friends and family.',
      completed: false,
    },
  ])

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('onboarding-progress')
    if (savedProgress) {
      try {
        const parsedTasks = JSON.parse(savedProgress) as OnboardingTask[]
        setTasks(parsedTasks)
      } catch (error) {
        console.error('Error parsing onboarding progress:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Calculate progress percentage
    const completedCount = tasks.filter((task) => task.completed).length
    const newProgress = Math.round((completedCount / tasks.length) * 100)
    setProgress(newProgress)

    // Save progress to localStorage
    localStorage.setItem('onboarding-progress', JSON.stringify(tasks))
  }, [tasks])

  const markTaskCompleted = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: true } : task
      )
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <motion.div
          className="bg-blue-600 h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Task list */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                task.completed
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {task.completed ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{tasks.findIndex((t) => t.id === task.id) + 1}</span>
              )}
            </div>
            <div>
              <h3
                className={`text-sm font-medium ${
                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
