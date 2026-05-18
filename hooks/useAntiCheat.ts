'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface AntiCheatOptions {
  enabled: boolean
  maxViolations?: number
  onViolation?: (count: number) => void
  onAutoSubmit?: () => void
  onFullscreenExit?: () => void
}

export function useAntiCheat({
  enabled,
  maxViolations = 3,
  onViolation,
  onAutoSubmit,
  onFullscreenExit
}: AntiCheatOptions) {
  const [violationCount, setViolationCount] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const violationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    if (!enabled) return
    
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        await (document.documentElement as any).webkitRequestFullscreen()
      } else if ((document.documentElement as any).mozRequestFullScreen) {
        await (document.documentElement as any).mozRequestFullScreen()
      } else if ((document.documentElement as any).msRequestFullscreen) {
        await (document.documentElement as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } catch (error) {
      console.error('Fullscreen request failed:', error)
    }
  }, [enabled])

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
      setIsFullscreen(false)
    } catch (error) {
      console.error('Fullscreen exit failed:', error)
    }
  }, [])

  // Handle violation
  const handleViolation = useCallback((reason: string) => {
    if (!enabled) return

    setViolationCount(prev => {
      const newCount = prev + 1
      onViolation?.(newCount)

      // Set warning message
      if (newCount === 1) {
        setWarningMessage(`Warning 1 of ${maxViolations}: ${reason}. Return to fullscreen to continue.`)
      } else if (newCount === 2) {
        setWarningMessage(`Final Warning (2 of ${maxViolations}): ${reason}. One more violation will auto-submit your exam.`)
      } else if (newCount >= maxViolations) {
        setWarningMessage(`Exam terminated due to repeated violations (${newCount}/${maxViolations}).`)
        setIsLocked(true)
        onAutoSubmit?.()
        exitFullscreen()
      }

      // Lock UI temporarily
      setIsLocked(true)
      
      // Auto-unlock after 5 seconds if not at max violations
      if (newCount < maxViolations) {
        if (violationTimeoutRef.current) {
          clearTimeout(violationTimeoutRef.current)
        }
        violationTimeoutRef.current = setTimeout(() => {
          setIsLocked(false)
          setWarningMessage('')
          // Request fullscreen again
          requestFullscreen()
        }, 5000)
      }

      return newCount
    })
  }, [enabled, maxViolations, onViolation, onAutoSubmit, exitFullscreen, requestFullscreen])

  // Handle visibility change (tab switching)
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('Tab switching detected')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, handleViolation])

  // Handle window blur (minimizing or switching apps)
  useEffect(() => {
    if (!enabled) return

    const handleBlur = () => {
      // Set a timeout to distinguish between quick blur (alt+tab back) vs actual leaving
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
      blurTimeoutRef.current = setTimeout(() => {
        handleViolation('Browser focus lost')
      }, 1000)
    }

    const handleFocus = () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
        blurTimeoutRef.current = null
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [enabled, handleViolation])

  // Handle fullscreen change
  useEffect(() => {
    if (!enabled) return

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )

      if (!isCurrentlyFullscreen && isFullscreen) {
        // User exited fullscreen
        setIsFullscreen(false)
        handleViolation('Fullscreen mode exited')
        onFullscreenExit?.()
      } else if (isCurrentlyFullscreen) {
        setIsFullscreen(true)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [enabled, isFullscreen, handleViolation, onFullscreenExit])

  // Block keyboard shortcuts
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+T, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 't')) ||
        e.key === 'F12'
      ) {
        e.preventDefault()
        handleViolation('Prohibited keyboard shortcut detected')
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      handleViolation('Right-click detected')
    }

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      handleViolation('Copy attempt detected')
    }

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault()
      handleViolation('Paste attempt detected')
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
    }
  }, [enabled, handleViolation])

  // Request fullscreen on mount if enabled
  useEffect(() => {
    if (enabled) {
      requestFullscreen()
    }
  }, [enabled, requestFullscreen])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current)
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  // Reset function
  const resetViolations = useCallback(() => {
    setViolationCount(0)
    setIsLocked(false)
    setWarningMessage('')
  }, [])

  return {
    violationCount,
    isLocked,
    isFullscreen,
    warningMessage,
    requestFullscreen,
    exitFullscreen,
    resetViolations
  }
}
