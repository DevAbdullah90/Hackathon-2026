import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

export interface ComponentNameProps extends ViewProps {
  // Define custom props here
  customProp?: string;
}

export const ComponentName: React.FC<ComponentNameProps> = ({ 
  customProp, 
  style, 
  ...rest 
}) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      {/* Component Content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Default styles
  },
});
