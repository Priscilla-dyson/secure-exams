'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AIProctorOptions {
  enabled: boolean
  attemptId?: string | null
  onViolation?: (type: string, details: string) => void
}

interface ProctorState {
  faceDetected: boolean
  multipleFaces: boolean
  lookingAway: boolean
  phoneDetected: boolean
  bookDetected: boolean
  confidence: number
}

export function useAIProctor({
  enabled,
  attemptId,
  onViolation
}: AIProctorOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [proctorState, setProctorState] = useState<ProctorState>({
    faceDetected: false,
    multipleFaces: false,
    lookingAway: false,
    phoneDetected: false,
    bookDetected: false,
    confidence: 0
  })
  const [error, setError] = useState<string | null>(null)
  const lastLogTimeRef = useRef<Record<string, number>>({})
  const consecutiveNoFaceRef = useRef(0)
  const warningShownRef = useRef(false)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  // Rate limit logging to avoid flooding (1 log per 10 seconds per type)
  const canLog = useCallback((type: string) => {
    const now = Date.now()
    const last = lastLogTimeRef.current[type] || 0
    if (now - last < 10000) return false
    lastLogTimeRef.current[type] = now
    return true
  }, [])

  // Start webcam
  const startWebcam = useCallback(async () => {
    if (!enabled) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 320,
          height: 240,
          facingMode: 'user'
        },
        audio: false
      })
      streamRef.current = stream
      
      const video = document.createElement('video')
      video.srcObject = stream
      video.playsInline = true
      video.autoplay = true
      video.muted = true
      video.width = 320
      video.height = 240
      videoRef.current = video
      
      await video.play()
      setIsActive(true)
      setError(null)
    } catch (err) {
      console.error('Webcam access denied:', err)
      setError('Webcam access denied. AI proctoring will not be available.')
      setIsActive(false)
    }
  }, [enabled])

  // Stop webcam
  const stopWebcam = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    videoRef.current = null
    setIsActive(false)
    setWarningMessage(null)
  }, [])

  // Simulated face detection using Canvas-based brightness/contrast analysis
  // In production, you'd use MediaPipe/TensorFlow.js
  const runDetection = useCallback(() => {
    const video = videoRef.current
    if (!video || video.readyState < 2) return

    try {
      // Create a temporary canvas to analyze video frames
      const canvas = document.createElement('canvas')
      canvas.width = 160
      canvas.height = 120
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0, 160, 120)
      const imageData = ctx.getImageData(0, 0, 160, 120)
      const pixels = imageData.data

      // Simple heuristic: check if there's significant pixel variation (indicating a face is present)
      let totalBrightness = 0
      let variance = 0
      const sampleSize = 100
      const samples: number[] = []

      for (let i = 0; i < sampleSize; i++) {
        const idx = Math.floor(Math.random() * pixels.length / 4) * 4
        const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3
        samples.push(brightness)
        totalBrightness += brightness
      }

      const avgBrightness = totalBrightness / sampleSize
      for (const s of samples) {
        variance += Math.pow(s - avgBrightness, 2)
      }
      variance /= sampleSize

      // Low variance = blank wall or no face
      // Medium variance = likely a face
      // High variance = could be multiple objects/people
      const threshold = 500
      const faceLikelihood = Math.min(1, variance / threshold)

      // Check center of frame for face presence
      const centerX = 80
      const centerY = 60
      const centerPixel = ctx.getImageData(centerX - 20, centerY - 20, 40, 40)
      let centerBrightness = 0
      for (let i = 0; i < centerPixel.data.length; i += 4) {
        centerBrightness += (centerPixel.data[i] + centerPixel.data[i + 1] + centerPixel.data[i + 2]) / 3
      }
      centerBrightness /= (centerPixel.data.length / 4)

      // Check edges for movement/multiple people
      const leftEdge = ctx.getImageData(0, 0, 20, 120)
      const rightEdge = ctx.getImageData(140, 0, 20, 120)
      let leftBrightness = 0
      let rightBrightness = 0
      for (let i = 0; i < leftEdge.data.length; i += 4) {
        leftBrightness += (leftEdge.data[i] + leftEdge.data[i + 1] + leftEdge.data[i + 2]) / 3
      }
      for (let i = 0; i < rightEdge.data.length; i += 4) {
        rightBrightness += (rightEdge.data[i] + rightEdge.data[i + 1] + rightEdge.data[i + 2]) / 3
      }
      leftBrightness /= (leftEdge.data.length / 4)
      rightBrightness /= (rightEdge.data.length / 4)

      const faceDetected = faceLikelihood > 0.4
      const edgeDiff = Math.abs(leftBrightness - rightBrightness)
      const multipleFaces = edgeDiff > 50 && faceLikelihood > 0.7
      const lookingCenter = centerBrightness > 100

      setProctorState(prev => ({
        ...prev,
        faceDetected,
        multipleFaces,
        lookingAway: !lookingCenter,
        confidence: faceLikelihood
      }))

      // Handle face absence
      if (!faceDetected) {
        consecutiveNoFaceRef.current++
        if (consecutiveNoFaceRef.current > 10 && canLog('FACE_ABSENT') && attemptId) {
          onViolation?.('FACE_ABSENT', 'Student face not visible in camera')
          setWarningMessage('Warning: Your face is not visible. Please position yourself in front of the camera.')
          consecutiveNoFaceRef.current = 0
        }
      } else {
        consecutiveNoFaceRef.current = 0
        setWarningMessage(null)
      }

      // Handle multiple faces
      if (multipleFaces && canLog('MULTIPLE_FACES') && attemptId) {
        onViolation?.('MULTIPLE_FACES', 'Multiple people detected in frame')
        setWarningMessage('Warning: Multiple people detected in camera frame.')
      }

      // Handle looking away
      if (!lookingCenter && faceDetected && canLog('LOOKING_AWAY') && attemptId) {
        onViolation?.('LOOKING_AWAY', 'Student looking away from screen')
      }

    } catch (err) {
      console.error('Face detection error:', err)
    }
  }, [canLog, attemptId, onViolation])

  // Start detection loop
  useEffect(() => {
    if (!enabled || !isActive) return
    intervalRef.current = setInterval(runDetection, 3000) // Run every 3 seconds
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [enabled, isActive, runDetection])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  return {
    videoRef,
    isActive,
    proctorState,
    error,
    warningMessage,
    startWebcam,
    stopWebcam
  }
}