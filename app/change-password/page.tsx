'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

export default function ChangePasswordPage() {
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [newPassword, setNewPassword] = useState('')

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
    if (passwordStrength === 0) return 'bg-gray-300'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md border border-blue-100 shadow-lg">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Change Password
            </h1>
            <p className="text-gray-600 text-sm">
              You are required to change your password on first login
            </p>
          </div>

          <form className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-gray-700 font-semibold">
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter your current password"
                className="border border-gray-300 h-11 rounded-lg"
              />
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-gray-700 font-semibold">
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter a new password"
                value={newPassword}
                onChange={(e) => checkPasswordStrength(e.target.value)}
                className="border border-gray-300 h-11 rounded-lg"
              />
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Password Strength:</span>
                    <span className="text-xs font-semibold text-gray-700">{getStrengthText()}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Use 8+ characters with uppercase, numbers, and symbols
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700 font-semibold">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                className="border border-gray-300 h-11 rounded-lg"
              />
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-900 mb-2">Password must contain:</p>
              <ul className="text-xs text-gray-700 space-y-1">
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                    newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {newPassword.length >= 8 ? '✓' : ''}
                  </span>
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                    /[A-Z]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {/[A-Z]/.test(newPassword) ? '✓' : ''}
                  </span>
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                    /[0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {/[0-9]/.test(newPassword) ? '✓' : ''}
                  </span>
                  One number
                </li>
                <li className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-xs ${
                    /[^A-Za-z0-9]/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : ''}
                  </span>
                  One special character (!@#$%^&*)
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-4">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold h-11">
                Update Password
              </Button>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full border border-gray-300 text-gray-900 hover:bg-gray-50 font-semibold h-11">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
