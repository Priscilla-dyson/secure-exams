'use client'

import { AlertTriangle, Shield, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AntiCheatWarningProps {
  isLocked: boolean
  warningMessage: string
  violationCount: number
  maxViolations: number
  onRequestFullscreen: () => void
}

export function AntiCheatWarning({
  isLocked,
  warningMessage,
  violationCount,
  maxViolations,
  onRequestFullscreen
}: AntiCheatWarningProps) {
  if (!isLocked && !warningMessage) return null

  const isTerminated = violationCount >= maxViolations

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="max-w-md w-full mx-4">
        <div className={`rounded-xl border-2 p-6 ${
          isTerminated 
            ? 'bg-red-950/90 border-red-500' 
            : 'bg-slate-900/95 border-orange-500'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 p-3 rounded-full ${
              isTerminated 
                ? 'bg-red-500/20' 
                : 'bg-orange-500/20'
            }`}>
              {isTerminated ? (
                <Shield className="w-6 h-6 text-red-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-xl font-bold mb-2 ${
                isTerminated ? 'text-red-400' : 'text-orange-400'
              }`}>
                {isTerminated ? 'Exam Terminated' : 'Security Violation Detected'}
              </h3>
              
              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                {warningMessage}
              </p>

              {!isTerminated && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Violations:</span>
                    <span className="font-mono text-orange-400">
                      {violationCount} / {maxViolations}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(violationCount / maxViolations) * 100}%` }}
                    />
                  </div>

                  <Button
                    onClick={onRequestFullscreen}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  >
                    Return to Fullscreen
                  </Button>
                </div>
              )}

              {isTerminated && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Total Violations:</span>
                    <span className="font-mono text-red-400">
                      {violationCount} / {maxViolations}
                    </span>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 text-xs">
                      Your exam has been automatically submitted due to repeated security violations. 
                      Please contact your lecturer if you believe this is an error.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
