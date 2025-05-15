'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Metric {
  id: string
  name: string
  value: number
  tags: Record<string, string>
  timestamp: string
}

interface PerformanceDashboardProps {
  metrics: Record<string, Metric[]>
}

export default function PerformanceDashboard({ metrics }: PerformanceDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(
    Object.keys(metrics)[0] || null
  )
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week')

  // Get unique metric names
  const metricNames = Object.keys(metrics)

  // Filter metrics by time range
  const getFilteredMetrics = () => {
    if (!selectedMetric) return []

    const now = new Date()
    let cutoff = new Date()

    switch (timeRange) {
      case 'day':
        cutoff.setDate(now.getDate() - 1)
        break
      case 'week':
        cutoff.setDate(now.getDate() - 7)
        break
      case 'month':
        cutoff.setMonth(now.getMonth() - 1)
        break
    }

    return metrics[selectedMetric].filter(
      metric => new Date(metric.timestamp) >= cutoff
    )
  }

  const filteredMetrics = getFilteredMetrics()

  // Calculate statistics
  const calculateStats = () => {
    if (filteredMetrics.length === 0) {
      return { avg: 0, min: 0, max: 0, p95: 0 }
    }

    const values = filteredMetrics.map(m => m.value)
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    
    // Calculate 95th percentile
    const sortedValues = [...values].sort((a, b) => a - b)
    const p95Index = Math.floor(sortedValues.length * 0.95)
    const p95 = sortedValues[p95Index]

    return { avg, min, max, p95 }
  }

  const stats = calculateStats()

  // Format value based on metric type
  const formatValue = (value: number, metricName: string) => {
    if (metricName.includes('time') || metricName.includes('duration')) {
      return `${value.toFixed(2)}ms`
    }
    return value.toFixed(2)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Metric selector */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Select Metric</h2>
        <div className="flex flex-wrap gap-2">
          {metricNames.map(name => (
            <button
              key={name}
              onClick={() => setSelectedMetric(name)}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedMetric === name
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {name.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Time range selector */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Time Range</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('day')}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeRange === 'day'
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Last 24 Hours
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeRange === 'week'
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-4 py-2 rounded-md transition-colors ${
              timeRange === 'month'
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats cards */}
      {selectedMetric && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h3 className="text-sm text-gray-500 mb-1">Average</h3>
            <p className="text-2xl font-bold">
              {formatValue(stats.avg, selectedMetric)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h3 className="text-sm text-gray-500 mb-1">Minimum</h3>
            <p className="text-2xl font-bold">
              {formatValue(stats.min, selectedMetric)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h3 className="text-sm text-gray-500 mb-1">Maximum</h3>
            <p className="text-2xl font-bold">
              {formatValue(stats.max, selectedMetric)}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <h3 className="text-sm text-gray-500 mb-1">95th Percentile</h3>
            <p className="text-2xl font-bold">
              {formatValue(stats.p95, selectedMetric)}
            </p>
          </motion.div>
        </div>
      )}

      {/* Metrics table */}
      {selectedMetric && filteredMetrics.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Timestamp</th>
                <th className="px-4 py-2 text-left">Value</th>
                <th className="px-4 py-2 text-left">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetrics.map(metric => (
                <tr key={metric.id} className="border-t border-gray-100">
                  <td className="px-4 py-2">
                    {new Date(metric.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    {formatValue(metric.value, selectedMetric)}
                  </td>
                  <td className="px-4 py-2">
                    {Object.entries(metric.tags).map(([key, value]) => (
                      <span
                        key={key}
                        className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs mr-2 mb-1"
                      >
                        {key}: {value}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {selectedMetric
            ? 'No metrics data available for the selected time range.'
            : 'Please select a metric to view data.'}
        </div>
      )}
    </div>
  )
}
