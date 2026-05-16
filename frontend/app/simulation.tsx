import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import SimulationView from '../components/SimulationView';


const MOCK_ACTIONS = [
  { id: "A1", type: "ALERT_CITIZENS",
    label: "Public Alert Sent",
    status: "COMPLETED", time: "T+0s",
    detail: "5,200 users notified" },
  { id: "A2", type: "REROUTE_TRAFFIC",
    label: "Traffic Rerouted",
    status: "ACTIVE", time: "T+30s",
    detail: "240 vehicles redirected" },
  { id: "A3", type: "DISPATCH_DRAINAGE",
    label: "Emergency Dispatch",
    status: "PENDING", time: "T+60s",
    detail: "2 teams en route" }
];

const MOCK_BEFORE_AFTER = {
  before: {
    congestion: "100%",
    blocked_roads: 3,
    stranded_vehicles: 52
  },
  after: {
    congestion: "38%",
    blocked_roads: 0,
    stranded_vehicles: 0
  }
};

export default function SimulationScreen() {
  const [showBeforeAfter, setShowBeforeAfter] = useState(false);

  // TODO: Replace with GET /api/v1/simulation/state/{id}

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <TouchableOpacity 
          className="p-2"
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Text className="text-white text-xl font-bold">←</Text>
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-bold">⚡ Simulation Engine</Text>
        
        <View className="flex-row items-center bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
          <Text className="text-red-400 text-xs font-bold tracking-widest">🔴 RUNNING</Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        
        {/* 
          // @ts-ignore: SimulationView might not define actions in its type yet 
        */}
        <SimulationView actions={MOCK_ACTIONS} />

        {/* Before / After Toggle */}
        <View className="mt-2 mb-6 bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg">
          <TouchableOpacity 
            className="flex-row justify-between items-center bg-indigo-600 p-4 rounded-xl active:bg-indigo-700"
            activeOpacity={0.8}
            onPress={() => setShowBeforeAfter(!showBeforeAfter)}
          >
            <Text className="text-white font-bold text-base">View Impact Projection</Text>
            <Text className="text-indigo-200 text-sm font-bold">
              {showBeforeAfter ? "HIDE" : "SHOW"}
            </Text>
          </TouchableOpacity>

          {showBeforeAfter && (
            <View className="mt-4 flex-row justify-between">
              {/* Before */}
              <View className="flex-1 bg-slate-800/80 p-4 rounded-xl border border-red-500/30 mr-2">
                <Text className="text-slate-400 text-[10px] font-bold mb-2 uppercase tracking-wider text-center">Before Action</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-300 text-xs">Congestion</Text>
                  <Text className="text-red-400 font-bold text-xs">{MOCK_BEFORE_AFTER.before.congestion}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-300 text-xs">Blocked</Text>
                  <Text className="text-red-400 font-bold text-xs">{MOCK_BEFORE_AFTER.before.blocked_roads}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-300 text-xs">Stranded</Text>
                  <Text className="text-red-400 font-bold text-xs">{MOCK_BEFORE_AFTER.before.stranded_vehicles}</Text>
                </View>
              </View>

              {/* After */}
              <View className="flex-1 bg-slate-800/80 p-4 rounded-xl border border-emerald-500/30 ml-2">
                <Text className="text-slate-400 text-[10px] font-bold mb-2 uppercase tracking-wider text-center">After Action</Text>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-300 text-xs">Congestion</Text>
                  <Text className="text-emerald-400 font-bold text-xs">{MOCK_BEFORE_AFTER.after.congestion}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-slate-300 text-xs">Blocked</Text>
                  <Text className="text-emerald-400 font-bold text-xs">{MOCK_BEFORE_AFTER.after.blocked_roads}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-slate-300 text-xs">Stranded</Text>
                  <Text className="text-emerald-400 font-bold text-xs">{MOCK_BEFORE_AFTER.after.stranded_vehicles}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
        
        {/* Actions List */}
        <View className="mb-10">
            <Text className="text-slate-400 text-[11px] tracking-widest font-bold uppercase mb-4 ml-1">Simulation Actions Pipeline</Text>
            {MOCK_ACTIONS.map(action => (
                <View key={action.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-md">
                    <View>
                        <Text className="text-white font-bold text-sm mb-1">{action.label}</Text>
                        <Text className="text-slate-400 text-xs">{action.detail}</Text>
                    </View>
                    <View className="items-end">
                        <View className={`px-2 py-1 rounded mb-1 ${action.status === 'COMPLETED' ? 'bg-emerald-500/20' : action.status === 'ACTIVE' ? 'bg-indigo-500/20' : 'bg-slate-700'}`}>
                          <Text className={`text-[10px] font-bold ${action.status === 'COMPLETED' ? 'text-emerald-400' : action.status === 'ACTIVE' ? 'text-indigo-400' : 'text-slate-400'}`}>
                              {action.status}
                          </Text>
                        </View>
                        <Text className="text-slate-500 text-xs font-mono">{action.time}</Text>
                    </View>
                </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
