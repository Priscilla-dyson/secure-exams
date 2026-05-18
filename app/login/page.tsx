'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getDashboardRoute } from '@/lib/auth'
import { Shield, User, Lock, Eye, EyeOff, ArrowRight, GraduationCap, BookOpen, Award } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email.trim()) {
      setError('Please enter your email')
      setIsLoading(false)
      return
    }

    if (!password.trim()) {
      setError('Please enter your password')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed. Please try again.')
        setIsLoading(false)
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        localStorage.setItem('rememberMe', JSON.stringify(rememberMe))
      }

      const route = getDashboardRoute(data.user.role)
      router.replace(route)
    } catch (err) {
      console.error('[Login error]', err)
      setError('An error occurred during login. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_1fr]">
        {/* Left Side - Hero Section with Blur Effect */}
        <section className="relative hidden lg:flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <Image
            src="/4.jpeg"
            alt="University campus"
            fill
            className="object-cover scale-105"
            priority
          />
          
          {/* Gradient Overlay with Blur */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary-container/85 backdrop-blur-sm" />
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-primary-inverse/10 blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-primary-onContainer/10 blur-3xl" />
          
          {/* Content */}
          <div className="relative z-10 mx-auto w-full max-w-xl px-10 py-16">
            <div className="mb-8">
              
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-white mb-4">
                SWEARS
              </h1>
              
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                Secure Web-Based Examination and Automated Results System designed for high-stakes academic environments with clarity, structure, and calm.
              </p>
              
              <div className="h-0.5 w-24 bg-primary-inverse/50 mb-6" />
              
            </div>
          </div>
        </section>

        {/* Right Side - Login Form - Full Height */}
        <section className="flex items-center justify-center bg-background min-h-screen py-12 px-6 sm:px-8 lg:px-12">
          <div className="w-full max-w-lg">
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary lg:hidden">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-label-caps text-primary lg:hidden">SWEARS</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-3">
                Welcome back
              </h2>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-8 rounded-lg border border-error-container bg-error-container/10 p-4">
                <p className="text-body-sm text-error font-medium">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-label-caps text-onSurface-variant">
                  Email
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-14 w-full rounded-lg border-border bg-surface-container-low pl-12 pr-4 text-body-md text-foreground placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-label-caps text-onSurface-variant">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="h-14 w-full rounded-lg border-border bg-surface-container-low pl-12 pr-12 text-body-md text-foreground placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-onSurface-variant transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(value) => setRememberMe(Boolean(value))}
                    disabled={isLoading}
                    className="w-5 h-5 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <span className="text-body-sm text-onSurface-variant">Remember me</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-body-sm font-semibold text-primary hover:text-primary-container transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary-container transition-all duration-200"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Login
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-border text-center">
              <div className="mt-4">
                <Link 
                  href="/contact-us" 
                  className="text-body-sm font-semibold text-primary hover:text-primary-container transition-colors inline-flex items-center gap-1"
                >
                  Contact Support
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}