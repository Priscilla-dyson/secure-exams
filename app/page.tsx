'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { 
  Zap, BarChart3, Shield, Users, Clock, Star, ArrowRight, 
  Brain, Lock, FileText, GraduationCap, BookOpen, Award, 
  CheckCircle, TrendingUp, Eye, ChevronRight 
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Full Width */}
      <nav className="w-full border-b border-border sticky top-0 z-50 bg-surface-container-lowest">
        <div className="w-full px-7 lg:px-11 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl font-bold tracking-tight text-primary">SWEARS</span>
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <a href="#features" className="text-base font-medium text-onSurface-variant hover:text-primary transition-colors duration-200">
              Features
            </a>
            <a href="#how-it-works" className="text-base font-medium text-onSurface-variant hover:text-primary transition-colors duration-200">
              How It Works
            </a>
            <Link href="/contact-us" className="text-base font-medium text-onSurface-variant hover:text-primary transition-colors duration-200">
              Contact
            </Link>
          </div>
          <Link href="/login">
            <Button className="text-white px-8 py-3 text-base font-semibold rounded-md bg-primary hover:bg-primary-container transition-all duration-200">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Full Width with Blur Effect */}
      <section className="w-full relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/4.jpeg"
            alt="University campus"
            fill
            className="object-cover scale-105"
            priority
          />
        </div>
        
        {/* Gradient Overlay with Blur */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary-container/85 backdrop-blur-sm" />
        
        {/* Decorative Blur Elements */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-primary-inverse/10 blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-primary-onContainer/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-96 rounded-full bg-white/5 blur-3xl" />
        
        {/* Hero Content */}
        <div className="relative z-10 w-full px-8 lg:px-12 py-24 lg:py-32">
          <div className="max-w-5xl mx-auto text-center">
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight text-white">
              Secure Web Based Examinations and 
              <span className="block text-primary-inverse">Automated Results System</span>
            </h1>
            <p className="text-xl lg:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed text-white/80">
              Advanced examination management system with AI-powered monitoring and automated results management for educational institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/login">
                <Button className="bg-white text-primary px-10 py-4 text-lg font-semibold rounded-lg hover:bg-surface-container-low transition-all duration-200 shadow-none">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button className="bg-transparent border-2 border-white text-white px-10 py-4 text-lg font-semibold rounded-lg hover:bg-white/10 transition-all duration-200 shadow-none">
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Full Width */}
      <section className="w-full bg-primary-container">
        <div className="w-full px-8 lg:px-12 py-16">
          <div className="grid md:grid-cols-4 gap-8 text-center max-w-6xl mx-auto">
            <div className="p-6 rounded-lg bg-white/5">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-white">20K+</div>
              <p className="text-base text-primary-onContainer">Students Assessed</p>
            </div>
            <div className="p-6 rounded-lg bg-white/5">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-white">99.9%</div>
              <p className="text-base text-primary-onContainer">System Uptime</p>
            </div>
            <div className="p-6 rounded-lg bg-white/5">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-white">100+</div>
              <p className="text-base text-primary-onContainer">Institutions</p>
            </div>
            <div className="p-6 rounded-lg bg-white/5">
              <div className="text-4xl lg:text-5xl font-bold mb-2 text-white">24/7</div>
              <p className="text-base text-primary-onContainer">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Full Width */}
      <section id="features" className="w-full bg-background">
        <div className="w-full px-8 lg:px-12 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-label-caps text-primary mb-4 inline-block">CORE FEATURES</span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight text-foreground">
                Everything you need for <br />secure examinations
              </h2>
              <p className="text-body-md text-onSurface-variant max-w-3xl mx-auto">
                Comprehensive examination management with enterprise-grade security and AI-powered monitoring
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group p-8 rounded-xl bg-surface-container-lowest border border-border hover:border-primary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-primary-fixed">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">AI-Powered Monitoring</h3>
                <p className="text-body-sm text-onSurface-variant leading-relaxed">
                  Real-time detection of suspicious activities with comprehensive evidence documentation and instant alerts to proctors.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-xl bg-surface-container-lowest border border-border hover:border-primary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-primary-fixed">
                  <BarChart3 className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Instant Results</h3>
                <p className="text-body-sm text-onSurface-variant leading-relaxed">
                  Automated grading and result generation with comprehensive analytics and detailed performance insights delivered immediately.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-xl bg-surface-container-lowest border border-border hover:border-primary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-primary-fixed">
                  <Lock className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Enterprise Security</h3>
                <p className="text-body-sm text-onSurface-variant leading-relaxed">
                  Military-grade encryption, secure sessions, and complete audit trails for full institutional compliance and data protection.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-8 rounded-xl bg-surface-container-lowest border border-border hover:border-primary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-primary-fixed">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Multi-User Management</h3>
                <p className="text-body-sm text-onSurface-variant leading-relaxed">
                  Role-based access control for administrators, lecturers, and students with granular permissions for each user type.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-8 rounded-xl bg-surface-container-lowest border border-border hover:border-primary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-primary-fixed">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Flexible Scheduling</h3>
                <p className="text-body-sm text-onSurface-variant leading-relaxed">
                  Create and manage examination schedules with automated notifications and time zone support for global institutions.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group p-8 rounded-xl bg-surface-container-lowest border border-border hover:border-primary transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-primary-fixed">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Compliance Ready</h3>
                <p className="text-body-sm text-onSurface-variant leading-relaxed">
                  Meets international education standards with detailed reporting and certification capabilities for accreditation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Full Width */}
      <section id="how-it-works" className="w-full bg-surface-container">
        <div className="w-full px-8 lg:px-12 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-label-caps text-primary mb-4 inline-block">SIMPLE PROCESS</span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight text-foreground">
                How SWEARS Works
              </h2>
              <p className="text-body-md text-onSurface-variant max-w-3xl mx-auto">
                Simple, secure, and efficient examination management in three easy steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-xl bg-surface-container-lowest border border-border transition-all duration-300 hover:-translate-y-1">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Setup Your Exam</h3>
                <p className="text-body-md text-onSurface-variant leading-relaxed">
                  Create examinations with our intuitive interface, set parameters, questions, and configure AI monitoring settings.
                </p>
              </div>

              <div className="text-center p-8 rounded-xl bg-surface-container-lowest border border-border transition-all duration-300 hover:-translate-y-1">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Monitor in Real-Time</h3>
                <p className="text-body-md text-onSurface-variant leading-relaxed">
                  AI-powered proctoring monitors students with eye tracking, and instant suspicious activity alerts.
                </p>
              </div>

              <div className="text-center p-8 rounded-xl bg-surface-container-lowest border border-border transition-all duration-300 hover:-translate-y-1">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-primary">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">Get Instant Results</h3>
                <p className="text-body-md text-onSurface-variant leading-relaxed">
                  Automated grading and comprehensive analytics delivered immediately after exam completion with detailed feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Full Width */}
      <section className="w-full bg-surface-container-lowest">
        <div className="w-full px-8 lg:px-12 py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-label-caps text-primary mb-4 inline-block">TESTIMONIALS</span>
              <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight text-foreground">
                Trusted by Leading Institutions
              </h2>
              <p className="text-body-md text-onSurface-variant max-w-3xl mx-auto">
                See what educators say about SWEARS
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-xl bg-surface-container-low border border-border">
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(2)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-body-md mb-6 italic leading-relaxed text-onSurface-variant">
                  &quot;SWEARS has transformed our examination process. The AI monitoring is incredibly accurate, and our students appreciate the fair testing environment.&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary">
                    <span className="text-white font-semibold text-base">GD</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Godwin Dyson</p>
                    <p className="text-body-sm text-onSurface-variant">Dean of Computer Science</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-xl bg-surface-container-low border border-border">
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(2)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-body-md mb-6 italic leading-relaxed text-onSurface-variant">
                  &quot;The automated results and detailed analytics have saved us countless hours. Highly recommend for any educational institution.&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary">
                    <span className="text-white font-semibold text-base">MZ</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Mbatata Zapselela</p>
                    <p className="text-body-sm text-onSurface-variant">Head of Examinations</p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-xl bg-surface-container-low border border-border">
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(2)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-warning fill-warning" />
                  ))}
                </div>
                <p className="text-body-md mb-6 italic leading-relaxed text-onSurface-variant">
                  &quot;Security and compliance were our top priorities. SWEARS exceeded our expectations with enterprise-grade protection and peace of mind.&quot;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-tertiary">
                    <span className="text-white font-semibold text-base">PD</span>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">Priscilla Dyson</p>
                    <p className="text-body-sm text-onSurface-variant">IT Director</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Full Width */}
      <section className="w-full bg-primary">
        <div className="w-full px-8 lg:px-12 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold mb-5 tracking-tight text-white">
              Ready to Transform Your Examination Process?
            </h2>
            <p className="text-body-md mb-10 leading-relaxed text-primary-onContainer/90">
              Join hundreds of institutions already using SWEARS for secure, efficient examinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link href="/login">
                <Button className="text-primary bg-white px-10 py-4 text-lg font-semibold rounded-lg hover:bg-surface-container-low transition-all duration-200 shadow-none">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact-us">
                <Button className="bg-transparent border-2 border-white text-white px-10 py-4 text-lg font-semibold rounded-lg hover:bg-white/10 transition-all duration-200 shadow-none">
                  Contact US
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Full Width */}
      <footer className="w-full border-t border-border bg-surface-container-lowest">
        <div className="w-full px-8 lg:px-12 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-10 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold tracking-tight text-primary">SWEARS</span>
                </div>
                <p className="text-body-md mb-5 max-w-md leading-relaxed text-onSurface-variant">
                  Secure Web-Based Examination and Automated Results System. Empowering educational institutions with cutting-edge examination technology.
                </p>
              </div>

              <div>
                <h3 className="text-label-caps text-foreground mb-5">PRODUCT</h3>
                <ul className="space-y-3">
                  <li><a href="#features" className="text-body-md text-onSurface-variant hover:text-primary transition-colors duration-200">Features</a></li>
                  <li><a href="#how-it-works" className="text-body-md text-onSurface-variant hover:text-primary transition-colors duration-200">How It Works</a></li>
                  <li><Link href="/login" className="text-body-md text-onSurface-variant hover:text-primary transition-colors duration-200">Login</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-label-caps text-foreground mb-5">COMPANY</h3>
                <ul className="space-y-3">
                  <li><Link href="/contact-us" className="text-body-md text-onSurface-variant hover:text-primary transition-colors duration-200">Contact Us</Link></li>
                  <li><a href="#" className="text-body-md text-onSurface-variant hover:text-primary transition-colors duration-200">Privacy Policy</a></li>
                  <li><a href="#" className="text-body-md text-onSurface-variant hover:text-primary transition-colors duration-200">Terms of Service</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 text-center text-body-sm text-onSurface-variant border-t border-border">
              <p>&copy; 2025 SWEARS - Secure Web-Based Examination and Automated Results System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}