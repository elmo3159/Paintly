'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

// Screen reader only text for accessibility
export function ScreenReaderOnly({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className="sr-only"
      {...props}
    >
      {children}
    </span>
  )
}

// Skip to main content link for keyboard navigation
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground 
                 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
    >
      メインコンテンツに移動
    </a>
  )
}

// Accessible button with proper ARIA attributes
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isPressed?: boolean
  isExpanded?: boolean
  describedBy?: string
  label?: string
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ className, isPressed, isExpanded, describedBy, label, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        aria-pressed={isPressed}
        aria-expanded={isExpanded}
        aria-describedby={describedBy}
        aria-label={label}
        {...props}
      >
        {children}
      </button>
    )
  }
)
AccessibleButton.displayName = "AccessibleButton"

// Accessible form field with proper labeling
interface AccessibleFieldProps {
  id: string
  label: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function AccessibleField({ 
  id, 
  label, 
  description, 
  error, 
  required = false, 
  children 
}: AccessibleFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ')

  return (
    <div className="space-y-2">
      <label 
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1" aria-label="必須">*</span>}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement<any>, {
          id,
          'aria-describedby': describedBy || undefined,
          'aria-invalid': error ? 'true' : undefined,
          'aria-required': required
        })}
      </div>
      
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// Accessible heading with proper hierarchy
interface AccessibleHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6
  visualLevel?: 1 | 2 | 3 | 4 | 5 | 6
}

export function AccessibleHeading({ 
  level, 
  visualLevel, 
  className, 
  children, 
  ...props 
}: AccessibleHeadingProps) {
  const Tag = `h${level}` as React.ElementType
  const visualClass = visualLevel ? `text-${getVisualHeadingClass(visualLevel)}` : ''
  
  return (
    <Tag 
      className={cn(visualClass || getVisualHeadingClass(level), className)} 
      {...props}
    >
      {children}
    </Tag>
  )
}

function getVisualHeadingClass(level: number): string {
  const classes = {
    1: '4xl font-bold tracking-tight',
    2: '3xl font-bold tracking-tight',
    3: '2xl font-semibold',
    4: 'xl font-semibold',
    5: 'lg font-medium',
    6: 'base font-medium'
  }
  return classes[level as keyof typeof classes] || classes[1]
}

// Accessible modal/dialog wrapper
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function AccessibleModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children 
}: AccessibleModalProps) {
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`
  const descriptionId = description ? `modal-description-${Math.random().toString(36).substr(2, 9)}` : undefined

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Focus trap implementation would go here
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-lg max-h-[85vh] overflow-auto">
        <div className="bg-background p-6 rounded-lg shadow-lg">
          <AccessibleHeading level={2} id={titleId} className="mb-4">
            {title}
          </AccessibleHeading>
          
          {description && (
            <p id={descriptionId} className="text-muted-foreground mb-4">
              {description}
            </p>
          )}
          
          {children}
        </div>
      </div>
    </div>
  )
}

// Accessible status announcement for screen readers
export function announceToScreenReader(message: string) {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// High contrast mode detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = React.useState(false)
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setIsHighContrast(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setIsHighContrast(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return isHighContrast
}

// Reduced motion detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)
  
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])
  
  return prefersReducedMotion
}

// Focus management hook
export function useFocusManagement() {
  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
    }
  }
  
  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
  
  return { focusElement, trapFocus }
}