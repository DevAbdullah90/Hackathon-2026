import React from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
import type { AppError } from '../errors/AppError'

type Props = {
  error: AppError
  onRetry?: () => void
  showRetry?: boolean
}

export const ErrorScreen: React.FC<Props> = ({ error, onRetry, showRetry }) => {
  return (
    <View style={styles.container}>
      {/* Placeholder for BloodLink logo */}
      <Image source={require('../../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Oops! Something went wrong.</Text>
      <Text style={styles.message}>{error.userMessage}</Text>
      <Text style={styles.messageUrdu}>{error.urduMessage}</Text>
      {showRetry && onRetry && (
        <Pressable style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      )}
      <Pressable style={styles.homeButton} onPress={() => {
        // Assume navigation helper exists
        // @ts-ignore
        NavigationService.navigate('Home')
      }}>
        <Text style={styles.homeButtonText}>Go to Home</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#DC2626',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  messageUrdu: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
    writingDirection: 'rtl',
  },
  button: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    marginTop: 12,
  },
  homeButtonText: {
    color: '#DC2626',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})
