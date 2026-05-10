import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ErrorScreen } from './ErrorScreen'
import { handleUnknownError } from '../handlers/globalErrorHandler'
import type { AppError } from '../errors/AppError'

type Props = {
  children: React.ReactNode
  fallback?: React.ReactNode
}

type State = {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: unknown): Partial<State> {
    const appError = handleUnknownError(error)
    return { hasError: true, error: appError }
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // You could also log component stack here
    console.error('ErrorBoundary caught an error', { error, info })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props
    if (hasError && error) {
      if (fallback) return <>{fallback}</>
      return <ErrorScreen error={error} />
    }
    return <>{children}</>
  }
}
