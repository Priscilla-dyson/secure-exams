'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      {/* Left Side - Illustration */}
      <div className="hidden md:flex items-center justify-center bg-primary p-12">
        <div className="text-center">
          <div className="bg-primary/50 rounded-2xl p-12 mb-8 border border-border backdrop-blur-sm">
            <Mail className="w-16 h-16 text-primary-foreground mx-auto opacity-40" />
          </div>
          <h2 className="text-primary-foreground text-3xl font-bold mb-4">Reset Your Password</h2>
          <p className="text-primary-foreground/80 text-base leading-relaxed">
            We'll send you instructions to reset your password and regain access to your account.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-sm">
          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Forgot Password?
                </h1>
                <p className="text-muted-foreground text-base">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-semibold text-sm">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="border-border h-11 rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    We'll send a password reset link to this email address
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-semibold rounded-lg transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <Link href="/login" className="flex items-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-green-500/10 rounded-full p-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-foreground mb-3">Check Your Email</h2>
              <p className="text-muted-foreground mb-2">
                We've sent a password reset link to:
              </p>
              <p className="font-semibold text-foreground mb-6">{email}</p>
              <p className="text-sm text-muted-foreground mb-8">
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </p>

              <div className="bg-accent border border-border rounded-lg p-4 mb-8 text-left">
                <p className="text-sm font-semibold text-foreground mb-2">Didn't receive the email?</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Check your spam or junk folder</li>
                  <li>• Verify the email address is correct</li>
                  <li>• Try requesting a new link</li>
                </ul>
              </div>

              <Link href="/login" className="flex items-center justify-center gap-2 text-primary hover:text-primary/80 font-semibold text-sm">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
