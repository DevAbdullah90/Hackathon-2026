import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSubmit }: { onSubmit: (data: LoginFormValues) => Promise<void> }) {
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  });

  const handleLogin = async (data: LoginFormValues) => {
    setApiError(null);
    try {
      await onSubmit(data);
    } catch (error: any) {
      setApiError(error.message || 'Login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {apiError && <Text style={styles.globalError}>{apiError}</Text>}

      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="john@example.com"
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      <Text style={styles.label}>Password</Text>
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            secureTextEntry
            placeholder="••••••••"
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      <TouchableOpacity 
        style={[styles.button, isSubmitting && styles.buttonDisabled]} 
        onPress={handleSubmit(handleLogin)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, width: '100%' },
  label: { marginBottom: 6, fontWeight: '600', color: '#333' },
  input: { borderWidth: 1, borderColor: '#E5E5EA', padding: 14, borderRadius: 10, marginBottom: 8, fontSize: 16, backgroundColor: '#FAFAFA' },
  inputError: { borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontSize: 13, marginBottom: 16 },
  globalError: { color: '#FF3B30', backgroundColor: '#FFEBEB', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  button: { backgroundColor: '#007AFF', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  buttonDisabled: { backgroundColor: '#99C7FF' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
