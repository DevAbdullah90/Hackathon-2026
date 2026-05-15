import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

export function SimpleForm() {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = () => {
    console.log('Submitted:', inputValue);
    setInputValue('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter text..."
        value={inputValue}
        onChangeText={setInputValue}
      />
      <TouchableOpacity 
        style={[styles.button, !inputValue && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={!inputValue}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: { borderWidth: 1, borderColor: '#DDD', padding: 14, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
