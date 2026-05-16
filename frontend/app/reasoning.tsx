import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ReasoningCenter from '../components/ReasoningCenter';

/**
 * CIRO Hackathon — Professional AI Reasoning Console
 * Built by: Antigravity AI Agent
 */

// --- Types ---

interface MockLog {
  id: string;
  agent: string;
  time: string;
  phase: string;
  message: string;
}


// --- Data ---

const MOCK_LOGS: MockLog[] = [
  { id: "1", agent: "Triage Agent", time: "10:32:01", phase: "OBSERVE", message: "Signal received from Gulshan-e-Iqbal, Karachi" },
  { id: "2", agent: "Signal Agent", time: "10:32:03", phase: "REASON", message: "GPS normalized. Credibility score: 0.92" },
  { id: "3", agent: "Detection Agent", time: "10:32:08", phase: "DECIDE", message: "3 GPS signals clustered within 500m. CONFIRMED!" },
  { id: "4", agent: "Severity Agent", time: "10:32:12", phase: "ACT", message: "Hospital 200m away. Rain 2hrs. Score: 9.0/10" },
  { id: "5", agent: "Planning Agent", time: "10:32:15", phase: "EVALUATE", message: "3 actions queued: ALERT, REROUTE, DISPATCH" }
];

export default function ReasoningScreen() {
  // TODO: Replace MOCK_LOGS with WebSocket
  // WS /api/v1/ws/{incident_id}

  // Animation for the LIVE indicator
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [pulseScale, pulseOpacity]);

  return (
    <SafeAreaView className="flex-1 bg-[#111827]">
      <StatusBar barStyle="light-content" />
      
      {/* Professional Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#111827]">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-4 p-2 rounded-full bg-slate-800/50 active:bg-slate-700"
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-lg font-bold tracking-tight">🤖 AI Reasoning Console</Text>
            <Text className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mt-0.5">
              Multi-Agent Trace Stream
            </Text>
          </View>
        </View>

        {/* LIVE Indicator with Animation */}
        <View className="flex-row items-center bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
          <View className="relative mr-2">
            <Animated.View 
              style={[
                { transform: [{ scale: pulseScale }] },
                { opacity: pulseOpacity }
              ]}
              className="w-2 h-2 rounded-full bg-red-500 absolute"
            />
            <View className="w-2 h-2 rounded-full bg-red-500" />
          </View>
          <Text className="text-red-500 text-[10px] font-black tracking-[1.5px]">LIVE</Text>
        </View>
      </View>

      {/* Main Reasoning View */}
      <View className="flex-1">
        {/* 
          @ts-ignore - ReasoningCenter currently maintains internal mock data 
          but is passed logs for future backend integration.
        */}
        <ReasoningCenter logs={MOCK_LOGS} showHeader={false} />
      </View>

      {/* Background Decorator (Professional Touch) */}
      <View className="absolute bottom-[-50] right-[-50] w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -z-10" />
      <View className="absolute top-[20%] left-[-30] w-48 h-48 bg-purple-600/5 rounded-full blur-3xl -z-10" />
    </SafeAreaView>
  );
}
