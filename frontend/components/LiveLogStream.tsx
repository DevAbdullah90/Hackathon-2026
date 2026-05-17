import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { THEME } from "../lib/theme";
import { api } from "../lib/api";
import { CONFIG } from "../constants/config";

interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "success" | "critical";
  agent: string;
}

const getAgentAbbreviation = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes("triage")) return "TRG";
  if (normalized.includes("detection")) return "DET";
  if (normalized.includes("notification")) return "NTF";
  if (normalized.includes("simulation")) return "SIM";
  if (normalized.includes("sys")) return "SYS";
  return name.slice(0, 3).toUpperCase();
};

const getAgentColor = (abbr: string): string => {
  switch (abbr) {
    case "TRG": return "#F59E0B"; // Gold/Warning
    case "DET": return "#60A5FA"; // Blue/Info
    case "NTF": return "#10B981"; // Emerald Green
    case "SIM": return "#A78BFA"; // Lavender
    case "SYS": return "#EC4899"; // System Pink
    default: return THEME.colors.text.secondary;
  }
};

const getLogLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case "critical":
    case "error":
      return "#EF4444"; // Red
    case "warning":
      return "#F59E0B"; // Yellow/Orange
    case "success":
      return "#10B981"; // Green
    default:
      return THEME.colors.text.primary;
  }
};

const LiveLogStream: React.FC<{ incidentId: string }> = ({ incidentId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let active = true;

    // 1. Initial REST fetch for history
    const loadHistory = async () => {
      console.log(`🔌 [LiveLogStream] Fetching log history for: ${incidentId}`);
      try {
        const history = await api.getReasoningLogs(incidentId);
        if (active) {
          const mapped: LogEntry[] = history.map(log => ({
            id: log.id,
            message: log.log_text,
            timestamp: log.created_at,
            level: log.log_level.toLowerCase() as any,
            agent: getAgentAbbreviation(log.agent_name),
          }));
          
          if (mapped.length > 0) {
            setLogs(mapped);
          } else {
            // Safe beautiful placeholder log for starting session
            setLogs([
              {
                id: "sys-init",
                message: `CIRO Session initiated for sector cluster. Listening to live telemetry...`,
                timestamp: new Date().toISOString(),
                level: "info",
                agent: "SYS",
              }
            ]);
          }
        }
      } catch (err) {
        console.error("❌ Failed loading reasoning log history", err);
      }
    };

    loadHistory();

    // 2. Setup real-time WebSocket connection
    const connectWebSocket = () => {
      const targetId = incidentId ? incidentId : "triage";
      const wsUrl = `${CONFIG.WS_BASE_URL}/api/v1/ws/${targetId}`;
      console.log(`📡 [LiveLogStream] Connecting live telemetry WebSocket to: ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log(`✅ [LiveLogStream] WebSocket telemetry channel established for: ${targetId}`);
      };

      socket.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          console.log("⚡ [LiveLogStream] Inbound specialist reasoning log received:", raw);
          
          if (active) {
            const newEntry: LogEntry = {
              id: raw.id || Math.random().toString(),
              message: raw.log_text,
              timestamp: raw.created_at || new Date().toISOString(),
              level: (raw.log_level || "info").toLowerCase() as any,
              agent: getAgentAbbreviation(raw.agent_name || "sys"),
            };
            setLogs(prev => {
              // Deduplicate logs in state
              if (prev.some(x => x.id === newEntry.id)) return prev;
              return [...prev, newEntry];
            });
          }
        } catch (err) {
          console.warn("⚠️ [LiveLogStream] Failed to parse websocket frame:", err);
        }
      };

      socket.onerror = (e) => {
        console.warn("⚠️ [LiveLogStream] WebSocket error observed:", e);
      };

      socket.onclose = (e) => {
        console.log(`🔌 [LiveLogStream] WebSocket connection closed: Code ${e.code}, Reason: ${e.reason || "None"}`);
        // Attempt a graceful reconnect after 5 seconds if still active
        if (active) {
          setTimeout(() => {
            if (active) connectWebSocket();
          }, 5000);
        }
      };
    };

    connectWebSocket();

    return () => {
      active = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [incidentId]);

  const renderLog = ({ item }: { item: LogEntry }) => {
    const agentAbbr = item.agent;
    const agentColor = getAgentColor(agentAbbr);
    const messageColor = getLogLevelColor(item.level);

    return (
      <Animated.View entering={FadeInUp.springify().mass(0.4)} style={styles.logRow}>
        <View style={styles.timeContainer}>
          <Text style={styles.logTime}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>
        </View>
        <Text style={[styles.logAgent, { color: agentColor }]}>
          [{agentAbbr}]
        </Text>
        <Text style={[styles.logMessage, { color: messageColor }]}>
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
