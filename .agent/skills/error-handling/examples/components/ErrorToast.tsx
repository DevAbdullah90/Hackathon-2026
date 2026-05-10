import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import type { AppError } from '../errors/AppError'

type Props = {
  error: AppError | null
  onDismiss: () => void
  duration?: number
}

export const ErrorToast: React.FC<Props> = ({ error, onDismiss, duration = 3000 }) => {
  const opacity = React.useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!error) return
    // Fade in
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
    const timer = setTimeout(() => {
      // Fade out then dismiss
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        onDismiss()
      })
    }, duration)
    return () => clearTimeout(timer)
  }, [error])

  if (!error) return null

  const backgroundColor =
    error.severity === 'low'
      ? '#FCD34D' // yellow
      : error.severity === 'medium'
      ? '#F97316' // orange
      : '#DC2626' // red for high/critical

  return (
    <Animated.View style={[styles.toast, { opacity, backgroundColor }]}>
      <Text style={styles.message}>{error.userMessage}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 4,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
})
