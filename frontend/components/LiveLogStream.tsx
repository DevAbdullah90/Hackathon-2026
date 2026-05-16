import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList, Animated } from "react-native";
import { THEME } from "../lib/theme";

interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success";
  agent?: string;
}

const LiveLogStream: React.FC<{ incidentId: string }> = ({ incidentId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Demo Mock Logs
    const initialLogs: LogEntry[] = [
      { id: "1", message: "CIRO-ORCHESTRATOR: Session established.", timestamp: new Date().toISOString(), level: "success", agent: "SYS" },
      { id: "2", message: "GEOSPATIAL-AGENT: Analyzing topological risk...", timestamp: new Date().toISOString(), level: "info", agent: "GEO" },
      { id: "3", message: "LOGISTICS-AGENT: Scanning available rescue units.", timestamp: new Date().toISOString(), level: "info", agent: "LOG" },
    ];
    setLogs(initialLogs);

    const interval = setInterval(() => {
      const messages = [
        "Calculating runoff vectors...",
        "Signal strength within nominal range.",
        "Cross-referencing historical flood data.",
        "Agentic reasoning loop iteration #42.",
        "Proposed strategy: Reroute Sector G-10 traffic.",
        "Evacuation probability updated to 84%.",
        "Validating telemetry from drone unit Alpha.",
      ];
      
      const newLog: LogEntry = {
        id: Math.random().toString(),
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date().toISOString(),
        level: "info",
        agent: ["SYS", "GEO", "LOG"][Math.floor(Math.random() * 3)]
      };
      
      setLogs(prev => [...prev.slice(-49), newLog]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const renderLog = ({ item }: { item: LogEntry }) => {
    return (
      <Animated.View style={styles.logRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.logTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.logAgent, { color: item.agent === "SYS" ? THEME.colors.text.primary : THEME.colors.text.secondary }]}>
          [{item.agent}]
        </Text>
        <Text style={[styles.logMessage, { color: item.level === "success" ? THEME.colors.primary : THEME.colors.text.muted }]}>
          {item.message}
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={logs}
        renderItem={renderLog}
        keyExtractor={item => item.id}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: THEME.spacing.sm,
  },
  logRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  timeContainer: {
    width: 65,
  },
  logTime: {
    color: THEME.colors.text.muted,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
  },
  logAgent: {
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    fontWeight: "bold",
    width: 50,
    marginHorizontal: 4,
  },
  logMessage: {
    flex: 1,
    fontSize: 10,
    fontFamily: THEME.fonts.mono,
    lineHeight: 14,
  },
});

export default LiveLogStream;
