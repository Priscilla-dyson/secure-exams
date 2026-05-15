'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Get in touch with our support team for any questions or assistance.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Email Contact */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Support</h3>
            <p className="text-gray-600 mb-4">Send us an email and we'll respond within 24 hours.</p>
            <a
              href="mailto:support@swears.edu"
              className="text-blue-600 hover:text-blue-700 font-semibold text-lg"
            >
              support@swears.edu
            </a>
          </div>

          {/* Phone Contact */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Phone Support</h3>
            <p className="text-gray-600 mb-4">Call us during business hours for immediate assistance.</p>
            <a
              href="tel:+1234567890"
              className="text-green-600 hover:text-green-700 font-semibold text-lg"
            >
              +1 (234) 567-8900
            </a>
            <p className="text-sm text-gray-500 mt-2">Mon-Fri: 9AM-6PM EST</p>
          </div>

          {/* Office Address */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Office Address</h3>
            <p className="text-gray-600">
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
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
