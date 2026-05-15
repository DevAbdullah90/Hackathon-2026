export interface AppErrorProps {
  code: string
  message: string
  userMessage: string
  urduMessage: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
}

export class AppError extends Error implements AppErrorProps {
  code: string
  userMessage: string
  urduMessage: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date

  constructor(
    code: string,
    message: string,
    userMessage: string,
    urduMessage: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
    timestamp: Date = new Date()
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.userMessage = userMessage
    this.urduMessage = urduMessage
    this.severity = severity
    this.timestamp = timestamp
    // Preserve proper stack trace (only works on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  /** Convert the error to a plain JSON object for logging */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      urduMessage: this.urduMessage,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    }
  }

  /** Human‑readable representation */
  toString() {
    return `${this.name} [${this.code}]: ${this.message}`
  }
}

// Export the type for external use
export type { AppErrorProps }
