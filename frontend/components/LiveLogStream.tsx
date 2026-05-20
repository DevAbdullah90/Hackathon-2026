import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
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
    case "TRG": return "#D97706";
    case "DET": return "#2563EB";
    case "NTF": return "#059669";
    case "SIM": return "#7C3AED";
    case "SYS": return "#DB2777";
    default: return THEME.colors.text.secondary;
  }
};

const getLogLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case "critical":
    case "error":
      return "#EF4444";
    case "warning":
      return "#F59E0B";
    case "success":
      return "#10B981";
    default:
      return THEME.colors.text.primary;
  }
};

const LiveLogStream: React.FC<{ incidentId: string }> = ({ incidentId }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      if (incidentId.startsWith("triage_")) {
        console.log(`🔌 [LiveLogStream] Triage session active. Skipping history fetch.`);
        if (active) {
          setLogs([
            {
              id: "sys-init",
              message: `Establishing secure connection to CIRO by AQUA Specialist Network. Signal processing initiated...`,
              timestamp: new Date().toISOString(),
              level: "info",
              agent: "SYS",
            }
          ]);
        }
        return;
      }

      console.log(`🔌 [LiveLogStream] Fetching log history for: ${incidentId}`);
      try {
        const history = await api.getReasoningLogs(incidentId);
        if (!active) return;

        const mapped: LogEntry[] = history.map((log) => ({
          id: log.id,
          message: log.log_text,
          timestamp: log.created_at,
          level: log.log_level.toLowerCase() as any,
          agent: getAgentAbbreviation(log.agent_name),
        }));

        if (mapped.length > 0) {
          setLogs(mapped);
        } else {
          setLogs([
            {
              id: "sys-init",
              message: "CIRO by AQUA session started. Listening for live telemetry.",
              timestamp: new Date().toISOString(),
              level: "info",
              agent: "SYS",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed loading reasoning log history", err);
      }
    };

    const connectWebSocket = () => {
      const targetId = incidentId || "triage";
      const wsUrl = `${CONFIG.WS_BASE_URL}/api/v1/ws/${targetId}`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const raw = JSON.parse(event.data);
          if (!active) return;

          const newEntry: LogEntry = {
            id: raw.id || Math.random().toString(),
            message: raw.log_text,
            timestamp: raw.created_at || new Date().toISOString(),
            level: (raw.log_level || "info").toLowerCase() as any,
            agent: getAgentAbbreviation(raw.agent_name || "sys"),
          };

          setLogs((prev) => (prev.some((x) => x.id === newEntry.id) ? prev : [...prev, newEntry]));
        } catch (err) {
          console.warn("Failed to parse websocket frame", err);
        }
      };

      socket.onclose = () => {
        if (active) {
          setTimeout(() => {
            if (active) connectWebSocket();
          }, 5000);
        }
      };
    };

    loadHistory();
    connectWebSocket();

    return () => {
      active = false;
      wsRef.current?.close();
    };
  }, [incidentId]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        showsVerticalScrollIndicator={false}
      >
        {logs.map((item) => {
          const agentColor = getAgentColor(item.agent);
          const messageColor = getLogLevelColor(item.level);

          return (
            <View key={item.id} style={styles.logRow}>
              <View style={styles.timeContainer}>
                <Text style={styles.logTime}>
                  {new Date(item.timestamp.endsWith("Z") || item.timestamp.includes("+") ? item.timestamp : `${item.timestamp}Z`).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </Text>
              </View>
              <Text style={[styles.logAgent, { color: agentColor }]}>{`[${item.agent}]`}</Text>
              <Text style={[styles.logMessage, { color: messageColor }]}>{item.message}</Text>
            </View>
          );
        })}
      </ScrollView>
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
