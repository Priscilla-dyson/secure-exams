import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

// Create reusable transporter
function createTransporter() {
  const host = process.env.SMTP_HOST
  // If no SMTP host is configured, return null (emails will be logged instead)
  if (!host) return null

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  })
}

const fromAddress = process.env.SMTP_FROM || 'noreply@university.edu'
const appUrl = process.env.APP_URL || 'http://localhost:3000'

export async function sendEmail(to: string | string[], subject: string, html: string, text?: string): Promise<boolean> {
  const transporter = createTransporter()

  if (!transporter) {
    // SMTP not configured - log instead
    console.log('📧 [EMAIL LOG]', {
      to,
      subject,
      html: html.substring(0, 200) + '...',
      text: text?.substring(0, 200)
    })
    return true
  }

  try {
    await transporter.sendMail({
      from: `"ExamSecure" <${fromAddress}>`,
      replyTo: `${fromAddress}`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// ─── EMAIL TEMPLATES ────────────────────────────────────────────────────────────

/**
 * Email template for exam scheduled notification
 */
export function examScheduledEmail(studentName: string, examTitle: string, moduleName: string, date: string, time: string) {
  return {
    subject: `📝 Exam Scheduled: ${examTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: #1a73e8; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Exam Scheduled</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>An examination has been scheduled. Please find the details below:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 120px;">Exam</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${examTitle}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Module</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${moduleName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Date</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Time</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${time}</td>
            </tr>
          </table>
          <p>Please log in to the system to view more details and prepare for the exam.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/login" style="background: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to ExamSecure</a>
          </p>
          <p>Best regards,<br/>ExamSecure Team</p>
        </div>
      </div>
    `
  }
}

/**
 * Email template for exam reminder (3 hours before)
 */
export function examReminderEmail(studentName: string, examTitle: string, moduleName: string, startTime: string) {
  return {
    subject: `⏰ Reminder: ${examTitle} starts in 3 hours`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: #f59e0b; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Exam Reminder</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>This is a reminder that your examination is starting in <strong>3 hours</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 120px;">Exam</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${examTitle}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Module</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${moduleName}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Start Time</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${startTime}</td>
            </tr>
          </table>
          <p>Please ensure you are ready and have a stable internet connection.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/login" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to ExamSecure</a>
          </p>
          <p>Best regards,<br/>ExamSecure Team</p>
        </div>
      </div>
    `
  }
}

/**
 * Email template for results published notification
 */
export function resultsPublishedEmail(studentName: string, examTitle: string, moduleName: string) {
  return {
    subject: `📊 Results Published: ${examTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: #059669; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Results Published</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Your results have been published. You can now log in to view them.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 120px;">Exam</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${examTitle}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Module</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${moduleName}</td>
            </tr>
          </table>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/login" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Results</a>
          </p>
          <p>Best regards,<br/>ExamSecure Team</p>
        </div>
      </div>
    `
  }
}

/**
 * Email template for password reset
 */
export function passwordResetEmail(studentName: string, resetLink: string) {
  return {
    subject: '🔑 Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Password Reset</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>We received a request to reset your password for your ExamSecure account.</p>
          <p>Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
          </p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Best regards,<br/>ExamSecure Team</p>
        </div>
      </div>
    `
  }
}

/**
 * Email template for new account/password reset notification from admin
 */
export function accountCreatedEmail(name: string, userId: string, password: string, role: string) {
  return {
    subject: `Welcome to ExamSecure - Your ${role} Account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="background: #1a73e8; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Account Created</h1>
        </div>
        <div style="padding: 20px;">
          <p>Dear <strong>${name}</strong>,</p>
          <p>Your ExamSecure account has been created. Please use the following credentials to log in:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; width: 120px;">User ID</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${userId}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold;">Password</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${password}</td>
            </tr>
          </table>
          <p><strong>Note:</strong> You will be required to change your password on first login.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/login" style="background: #1a73e8; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login to ExamSecure</a>
          </p>
          <p>Best regards,<br/>ExamSecure Team</p>
        </div>
      </div>
    `
  }
}