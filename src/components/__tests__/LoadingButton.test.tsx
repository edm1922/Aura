import React from 'react'
import { render, screen } from '@testing-library/react'
import LoadingButton from '../LoadingButton'

describe('LoadingButton', () => {
  it('renders children when not loading', () => {
    render(<LoadingButton>Click me</LoadingButton>)
    
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
  
  it('renders loading text when loading', () => {
    render(<LoadingButton isLoading>Click me</LoadingButton>)
    
    expect(screen.queryByText('Click me')).not.toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
  
  it('renders custom loading text when provided', () => {
    render(<LoadingButton isLoading loadingText="Please wait...">Click me</LoadingButton>)
    
    expect(screen.queryByText('Click me')).not.toBeInTheDocument()
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })
  
  it('applies the correct variant classes', () => {
    const { rerender } = render(<LoadingButton variant="primary">Primary</LoadingButton>)
    expect(screen.getByText('Primary').closest('button')).toHaveClass('bg-blue-600')
    
    rerender(<LoadingButton variant="secondary">Secondary</LoadingButton>)
    expect(screen.getByText('Secondary').closest('button')).toHaveClass('bg-gray-200')
    
    rerender(<LoadingButton variant="danger">Danger</LoadingButton>)
    expect(screen.getByText('Danger').closest('button')).toHaveClass('bg-red-600')
    
    rerender(<LoadingButton variant="outline">Outline</LoadingButton>)
    expect(screen.getByText('Outline').closest('button')).toHaveClass('bg-white')
  })
  
  it('applies the correct size classes', () => {
    const { rerender } = render(<LoadingButton size="sm">Small</LoadingButton>)
    expect(screen.getByText('Small').closest('button')).toHaveClass('px-3 py-1.5 text-sm')
    
    rerender(<LoadingButton size="md">Medium</LoadingButton>)
    expect(screen.getByText('Medium').closest('button')).toHaveClass('px-4 py-2 text-base')
    
    rerender(<LoadingButton size="lg">Large</LoadingButton>)
    expect(screen.getByText('Large').closest('button')).toHaveClass('px-6 py-3 text-lg')
  })
  
  it('applies full width class when fullWidth is true', () => {
    render(<LoadingButton fullWidth>Full Width</LoadingButton>)
    expect(screen.getByText('Full Width').closest('button')).toHaveClass('w-full')
  })
  
  it('applies disabled styles when disabled', () => {
    render(<LoadingButton disabled>Disabled</LoadingButton>)
    const button = screen.getByText('Disabled').closest('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-70 cursor-not-allowed')
  })
  
  it('applies disabled styles when loading', () => {
    render(<LoadingButton isLoading>Loading</LoadingButton>)
    const button = screen.getByText('Loading...').closest('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-70 cursor-not-allowed')
  })
  
  it('passes additional props to the button element', () => {
    render(<LoadingButton type="submit" data-testid="test-button">Submit</LoadingButton>)
    const button = screen.getByTestId('test-button')
    expect(button).toHaveAttribute('type', 'submit')
  })
})
