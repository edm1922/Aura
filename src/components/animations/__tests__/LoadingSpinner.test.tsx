import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-8 w-8') // Default size is md
    expect(spinner).toHaveClass('text-blue-600') // Default color is primary
  })
  
  it('applies the correct size classes', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-4 w-4')
    
    rerender(<LoadingSpinner size="md" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-8 w-8')
    
    rerender(<LoadingSpinner size="lg" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('h-12 w-12')
  })
  
  it('applies the correct color classes', () => {
    const { rerender } = render(<LoadingSpinner color="primary" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('text-blue-600')
    
    rerender(<LoadingSpinner color="white" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('text-white')
    
    rerender(<LoadingSpinner color="gray" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('text-gray-500')
  })
  
  it('applies additional classes from className prop', () => {
    render(<LoadingSpinner className="custom-class" />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('custom-class')
  })
  
  it('has the animate-spin class for animation', () => {
    render(<LoadingSpinner />)
    expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin')
  })
})
