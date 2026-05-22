'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { getDashboardRoute } from '@/lib/auth'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    if (typeof window !== 'undefined') {
      const currentUser = localStorage.getItem('currentUser')
      if (!currentUser) {
        router.replace('/login')
      }
    }
  }, [router])

  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
    setNewPassword(password)
  }

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-muted'
    if (passwordStrength === 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-orange-500'
    if (passwordStrength === 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'No password'
    if (passwordStrength === 1) return 'Weak'
    if (passwordStrength === 2) return 'Fair'
    if (passwordStrength === 3) return 'Good'
    return 'Strong'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to change password')
        setIsLoading(false)
        return
      }

      setIsLoading(false)

      // Redirect immediately to dashboard
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        const route = getDashboardRoute(user.role)
        router.replace(route)
      } else {
        router.replace('/login')
      }
    } catch (err) {
      console.error('Change password error:', err)
      setError('An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md border border-border shadow-lg">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Change Password
            </h1>
            <p className="text-muted-foreground text-sm">
              You are required to change your password on first login
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-medium text-lg">Password Changed!</p>
              <p className="text-green-600 text-sm mt-1">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-foreground font-semibold">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                  className="border border-border h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-foreground font-semibold">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter a new password"
                  value={newPassword}
                  onChange={(e) => checkPasswordStrength(e.target.value)}
                  disabled={isLoading}
                  className="border border-border h-11 rounded-lg"
                />
                
                {newPassword && (
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Password Strength:</span>
                      <span className="text-xs font-semibold text-foreground">{getStrengthText()}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 4) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use 8+ characters with uppercase, numbers, and symbols
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-foreground font-semibold">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="border border-border h-11 rounded-lg"
                />
              </div>

              <div className="bg-accent border border-border rounded-lg p-4">
                <p className="text-xs font-semibold text-foreground mb-2">Password must contain:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                      newPassword.length >= 8 ? 'bg-green-500' : 'bg-muted'
                    }`}>
                      {newPassword.length >= 8 ? '✓' : ''}
                    </span>
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                      /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-muted'
                    }`}>
                      {/[A-Z]/.test(newPassword) ? '✓' : ''}
                    </span>
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                      /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-muted'
                    }`}>
                      {/[0-9]/.test(newPassword) ? '✓' : ''}
                    </span>
                    One number
                  </li>
                  <li className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                      /[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-muted'
                    }`}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : ''}
                    </span>
                    One special character (!@#$%^&*)
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  )
}