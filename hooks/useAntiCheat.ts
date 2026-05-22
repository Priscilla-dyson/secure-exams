'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface AntiCheatOptions {
  enabled: boolean
  maxViolations?: number
  onViolation?: (count: number) => void
  onAutoSubmit?: (reason: string) => void
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
  const fullscreenExitStartRef = useRef<number | null>(null)
  const fullscreenTimerRef = useRef<NodeJS.Timeout | null>(null)
  const tabSwitchStartRef = useRef<number | null>(null)
  const tabSwitchTimerRef = useRef<NodeJS.Timeout | null>(null)
  const autoSubmitRef = useRef<boolean>(false)

  const DURATION_THRESHOLD = 20000 // 20 seconds

  const triggerAutoSubmit = useCallback((reason: string) => {
    if (autoSubmitRef.current) return // Prevent multiple triggers
    autoSubmitRef.current = true
    setWarningMessage(`Exam auto-submitted: ${reason}. You were away for more than 20 seconds.`)
    setIsLocked(true)
    onAutoSubmit?.(reason)
    exitFullscreen()
  }, [onAutoSubmit])

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
    if (!enabled || autoSubmitRef.current) return

    setViolationCount(prev => {
      const newCount = prev + 1
      onViolation?.(newCount)

      // Set warning message
      if (newCount === 1) {
        setWarningMessage(`Warning 1 of ${maxViolations}: ${reason}. Return immediately to continue.`)
      } else if (newCount === 2) {
        setWarningMessage(`Final Warning (2 of ${maxViolations}): ${reason}. One more violation will auto-submit your exam.`)
      } else if (newCount >= maxViolations) {
        setWarningMessage(`Exam terminated: Repeated violations (${newCount}/${maxViolations}). Auto-submitting...`)
        setIsLocked(true)
        onAutoSubmit?.(reason)
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
          requestFullscreen()
        }, 5000)
      }

      return newCount
    })
  }, [enabled, maxViolations, onViolation, onAutoSubmit, exitFullscreen, requestFullscreen])

  // Handle visibility change (tab switching) with duration tracking
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched away - record start time and set 20-second timer
        handleViolation('Tab switching detected')
        tabSwitchStartRef.current = Date.now()
        
        if (tabSwitchTimerRef.current) {
          clearTimeout(tabSwitchTimerRef.current)
        }
        tabSwitchTimerRef.current = setTimeout(() => {
          // If still hidden after 20 seconds, auto-submit
          if (document.hidden && !autoSubmitRef.current) {
            triggerAutoSubmit('Tab switched for more than 20 seconds')
          }
        }, DURATION_THRESHOLD)
      } else {
        // Tab returned - cancel the 20-second timer and show warning
        if (tabSwitchTimerRef.current) {
          clearTimeout(tabSwitchTimerRef.current)
          tabSwitchTimerRef.current = null
        }
        
        // Check how long they were away
        if (tabSwitchStartRef.current) {
          const durationAway = Date.now() - tabSwitchStartRef.current
          if (durationAway >= DURATION_THRESHOLD) {
            triggerAutoSubmit('Tab switched for more than 20 seconds')
          } else if (durationAway > 1000) {
            // Show a warning about how long they were away
            setWarningMessage(`Warning: You were away for ${Math.round(durationAway / 1000)} seconds. Continued violations may auto-submit.`)
            setTimeout(() => {
              if (!autoSubmitRef.current) setWarningMessage('')
            }, 4000)
          }
          tabSwitchStartRef.current = null
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, handleViolation, triggerAutoSubmit])

  // Handle window blur (minimizing or switching apps)
  useEffect(() => {
    if (!enabled) return

    const handleBlur = () => {
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

  // Handle fullscreen change with duration tracking
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
        // User exited fullscreen - record start time and set 20-second timer
        setIsFullscreen(false)
        handleViolation('Fullscreen mode exited')
        onFullscreenExit?.()
        
        fullscreenExitStartRef.current = Date.now()
        if (fullscreenTimerRef.current) {
          clearTimeout(fullscreenTimerRef.current)
        }
        fullscreenTimerRef.current = setTimeout(() => {
          // If still not in fullscreen after 20 seconds, auto-submit
          const stillNotFullscreen = !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
          )
          if (!stillNotFullscreen && !autoSubmitRef.current) {
            triggerAutoSubmit('Fullscreen exited for more than 20 seconds')
          }
        }, DURATION_THRESHOLD)
      } else if (isCurrentlyFullscreen) {
        // User returned to fullscreen
        setIsFullscreen(true)
        
        // Cancel the 20-second timer
        if (fullscreenTimerRef.current) {
          clearTimeout(fullscreenTimerRef.current)
          fullscreenTimerRef.current = null
        }
        
        // Check how long they were out of fullscreen
        if (fullscreenExitStartRef.current) {
          const durationAway = Date.now() - fullscreenExitStartRef.current
          if (durationAway >= DURATION_THRESHOLD) {
            triggerAutoSubmit('Fullscreen exited for more than 20 seconds')
          } else if (durationAway > 1000) {
            setWarningMessage(`Warning: You were out of fullscreen for ${Math.round(durationAway / 1000)} seconds. Continued violations may auto-submit.`)
            setTimeout(() => {
              if (!autoSubmitRef.current) setWarningMessage('')
            }, 4000)
          }
          fullscreenExitStartRef.current = null
        }
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
  }, [enabled, isFullscreen, handleViolation, onFullscreenExit, triggerAutoSubmit])

  // Block keyboard shortcuts and copy/paste
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+T, Ctrl+Shift+I (dev tools), F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 't' || e.key === 'u' || e.key === 's' || e.key === 'p')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        e.key === 'F12'
      ) {
        e.preventDefault()
        e.stopPropagation()
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

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      handleViolation('Cut attempt detected')
    }

    // Prevent text selection
    const disableSelect = (e: Event) => {
      if (e.target instanceof HTMLElement && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopy)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('cut', handleCut)
    document.addEventListener('selectstart', disableSelect)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('cut', handleCut)
      document.removeEventListener('selectstart', disableSelect)
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
      if (fullscreenTimerRef.current) {
        clearTimeout(fullscreenTimerRef.current)
      }
      if (tabSwitchTimerRef.current) {
        clearTimeout(tabSwitchTimerRef.current)
      }
    }
  }, [])

  // Reset function
  const resetViolations = useCallback(() => {
    setViolationCount(0)
    setIsLocked(false)
    setWarningMessage('')
    autoSubmitRef.current = false
    fullscreenExitStartRef.current = null
    tabSwitchStartRef.current = null
    if (fullscreenTimerRef.current) {
      clearTimeout(fullscreenTimerRef.current)
      fullscreenTimerRef.current = null
    }
    if (tabSwitchTimerRef.current) {
      clearTimeout(tabSwitchTimerRef.current)
      tabSwitchTimerRef.current = null
    }
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