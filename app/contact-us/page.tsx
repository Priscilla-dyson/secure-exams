'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Get in touch with our support team for any questions or assistance.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Email Contact */}
          <div className="bg-card p-8 rounded-xl border border-border text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Email Support</h3>
            <p className="text-muted-foreground mb-4">Send us an email and we'll respond within 24 hours.</p>
            <a
              href="mailto:support@swears.edu"
              className="text-primary hover:text-primary/80 font-semibold text-lg"
            >
              support@swears.edu
            </a>
          </div>

          {/* Phone Contact */}
          <div className="bg-card p-8 rounded-xl border border-border text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Phone Support</h3>
            <p className="text-muted-foreground mb-4">Call us during business hours for immediate assistance.</p>
            <a
              href="tel:+1234567890"
              className="text-green-600 hover:text-green-700 font-semibold text-lg"
            >
              +1 (234) 567-8900
            </a>
            <p className="text-sm text-muted-foreground mt-2">Mon-Fri: 9AM-6PM EST</p>
          </div>

          {/* Office Address */}
          <div className="bg-card p-8 rounded-xl border border-border text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Office Address</h3>
            <p className="text-muted-foreground">
              123 Education Lane<br />
              Academic Tower, Suite 400<br />
              University City, ST 12345<br />
              United States
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
