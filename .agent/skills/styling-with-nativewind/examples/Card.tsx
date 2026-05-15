import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export function Card({ title, content, onPress }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.9}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 my-2 mx-4"
    >
      <View className="mb-3">
        <Text className="text-xl font-bold text-slate-800 tracking-tight">
          {title}
        </Text>
      </View>
      <Text className="text-base text-slate-600 leading-relaxed">
        {content}
      </Text>
    </TouchableOpacity>
  );
}
