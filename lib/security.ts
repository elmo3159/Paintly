import { headers } from 'next/headers'
import { createHash } from 'crypto'

// Content Security Policy
export const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https:;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://api.stripe.com https://generativelanguage.googleapis.com;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
  media-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, ' ').trim()

// Security headers
export const securityHeaders = {
  'Content-Security-Policy': CSP_HEADER,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}

// Rate limiting
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts = 10, windowMs = 60000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return true
    }

    if (record.count >= this.maxAttempts) {
      return false
    }

    record.count++
    return true
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier)
  }

  cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.attempts.entries()) {
      if (now > value.resetTime) {
        this.attempts.delete(key)
      }
    }
  }
}

// CSRF Token generation and validation
export function generateCSRFToken(sessionId: string): string {
  const secret = process.env.CSRF_SECRET || 'default-csrf-secret'
  return createHash('sha256')
    .update(`${sessionId}:${secret}`)
    .digest('hex')
}

export function validateCSRFToken(token: string, sessionId: string): boolean {
  const expectedToken = generateCSRFToken(sessionId)
  return token === expectedToken
}

// Input sanitization
export function sanitizeInput(input: string): string {
  // Remove any HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '')
  
  // Remove any script tags specifically
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
  
  return sanitized
}

// File upload validation
export function validateFileUpload(file: {
  name: string
  type: string
  size: number
}): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 10MB limit' }
  }

  // Check MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' }
  }

  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]*$/)?.[0]
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: 'Invalid file extension' }
  }

  // Check for suspicious patterns in filename
  if (file.name.includes('../') || file.name.includes('..\\')) {
    return { valid: false, error: 'Invalid file name' }
  }

  return { valid: true }
}

// API key validation
export function validateAPIKey(key: string): boolean {
  // Check if key exists and has proper format
  if (!key || typeof key !== 'string') {
    return false
  }

  // Check minimum length
  if (key.length < 20) {
    return false
  }

  // Check for valid characters (alphanumeric, dash, underscore)
  if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
    return false
  }

  return true
}

// IP address extraction
export async function getClientIP(): Promise<string> {
  const hdrs = await headers()
  const forwardedFor = hdrs.get('x-forwarded-for')
  const realIP = hdrs.get('x-real-ip')
  const cfConnectingIP = hdrs.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  if (realIP) return realIP
  
  return 'unknown'
}

// Session validation
export function isValidSession(session: any): boolean {
  if (!session) return false
  if (!session.user) return false
  if (!session.user.id) return false
  if (!session.access_token) return false
  
  // Check if session has expired
  if (session.expires_at && new Date(session.expires_at) < new Date()) {
    return false
  }
  
  return true
}

// Secure random token generation
export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    token += chars[randomIndex]
  }
  
  return token
}