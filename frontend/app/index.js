"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var SeverityBadge_1 = require("../components/SeverityBadge");
var api_1 = require("../lib/api");
var Dashboard = function (_a) {
    var navigation = _a.navigation;
    var _b = (0, react_1.useState)([]), incidents = _b[0], setIncidents = _b[1];
    var _c = (0, react_1.useState)(true), loading = _c[0], setLoading = _c[1];
    var _d = (0, react_1.useState)(false), refreshing = _d[0], setRefreshing = _d[1];
    var pulseAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    var fetchIncidents = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.api.getActiveIncidents()];
                case 1:
                    data = _a.sent();
                    setIncidents(data);
                    setLoading(false);
                    setRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        fetchIncidents();
        var interval = setInterval(fetchIncidents, 5000); // Auto-poll every 5s
        react_native_1.Animated.loop(react_native_1.Animated.sequence([
            react_native_1.Animated.timing(pulseAnim, {
                toValue: 0.4,
                duration: 1000,
                useNativeDriver: true,
            }),
            react_native_1.Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
        ])).start();
        return function () { return clearInterval(interval); };
    }, []);
    var onRefresh = function () {
        setRefreshing(true);
        fetchIncidents();
    };
    var renderIncidentCard = function (_a) {
        var item = _a.item;
        return (<react_native_1.View style={styles.card}>
      <react_native_1.View style={styles.cardHeader}>
        <react_native_1.View style={{ flex: 1 }}>
          <react_native_1.Text style={styles.cardLocation}>{item.location}</react_native_1.Text>
          <react_native_1.Text style={styles.cardTime}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</react_native_1.Text>
        </react_native_1.View>
        <SeverityBadge_1.default score={item.severity_score}/>
      </react_native_1.View>

      <react_native_1.View style={styles.cardDivider}/>

      <react_native_1.View style={styles.cardDetails}>
        <react_native_1.View style={styles.detailRow}>
          <react_native_1.Text style={styles.detailLabel}>Confidence</react_native_1.Text>
          <react_native_1.Text style={styles.detailValue}>{(item.confidence * 100).toFixed(0)}%</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.detailRow}>
          <react_native_1.Text style={styles.detailLabel}>👥 Affected</react_native_1.Text>
          <react_native_1.Text style={styles.detailValue}>{item.estimated_population}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.detailRow}>
          <react_native_1.Text style={styles.detailLabel}>⏱️ Peak ETA</react_native_1.Text>
          <react_native_1.Text style={styles.detailValue}>{item.peak_impact_eta || "N/A"}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.View style={styles.cardActions}>
        <react_native_1.TouchableOpacity style={[styles.actionButton, styles.secondaryButton]} onPress={function () { return navigation.navigate("Map", { selectedIncidentId: item.id }); }}>
          <react_native_1.Text style={styles.secondaryButtonText}>🗺️ View on Map</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={function () { return navigation.navigate("Reasoning", { incidentId: item.id, location: item.location }); }}>
          <react_native_1.Text style={styles.primaryButtonText}>🤖 AI Reasoning</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
    </react_native_1.View>);
    };
    return (<react_native_1.SafeAreaView style={styles.container}>
      <react_native_1.StatusBar barStyle="light-content"/>
      
      {/* Header */}
      <react_native_1.View style={styles.header}>
        <react_native_1.View>
          <react_native_1.Text style={styles.headerTitle}>🌊 CIRO</react_native_1.Text>
          <react_native_1.Text style={styles.headerSubtitle}>Crisis Intelligence & Response</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.liveIndicator}>
          <react_native_1.Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]}/>
          <react_native_1.Text style={styles.liveText}>LIVE MONITOR</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      <react_native_1.ScrollView style={styles.content} refreshControl={<react_native_1.RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF"/>}>
        {/* Stats Row */}
        <react_native_1.View style={styles.statsRow}>
          <react_native_1.View style={styles.statCard}>
            <react_native_1.Text style={styles.statValue}>{incidents.length}</react_native_1.Text>
            <react_native_1.Text style={styles.statLabel}>Active{"\n"}Incidents</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.statCard}>
            <react_native_1.Text style={styles.statValue}>{incidents.length > 0 ? "100%" : "0%"}</react_native_1.Text>
            <react_native_1.Text style={styles.statLabel}>Resource{"\n"}Utilization</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.statCard}>
            <react_native_1.Text style={styles.statValue}>{(incidents.length * 2.5).toFixed(0)}k</react_native_1.Text>
            <react_native_1.Text style={styles.statLabel}>Citizens{"\n"}Protected</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>

        {/* Quick Actions */}
        <react_native_1.View style={styles.sectionHeader}>
          <react_native_1.Text style={styles.sectionTitle}>Quick Actions</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.TouchableOpacity style={styles.reportCard} onPress={function () { return navigation.navigate("Map"); }}>
          <react_native_1.View style={styles.reportCardContent}>
            <react_native_1.Text style={styles.reportCardEmoji}>🚨</react_native_1.Text>
            <react_native_1.View>
              <react_native_1.Text style={styles.reportCardTitle}>Report Local Flooding</react_native_1.Text>
              <react_native_1.Text style={styles.reportCardSubtitle}>Tap to send GPS signal to CIRO</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
          <react_native_1.Text style={styles.reportCardArrow}>→</react_native_1.Text>
        </react_native_1.TouchableOpacity>

        {/* Incidents Heading */}
        <react_native_1.View style={styles.sectionHeader}>
          <react_native_1.Text style={styles.sectionTitle}>Active Crisis Reports</react_native_1.Text>

          {incidents.length > 0 && (<react_native_1.View style={styles.countBadge}>
              <react_native_1.Text style={styles.countText}>{incidents.length}</react_native_1.Text>
            </react_native_1.View>)}
        </react_native_1.View>

        {/* Incident List */}
        {loading ? (<react_native_1.ActivityIndicator color="#3B82F6" size="large" style={{ marginTop: 40 }}/>) : incidents.length > 0 ? (<react_native_1.FlatList data={incidents} renderItem={renderIncidentCard} keyExtractor={function (item) { return item.id; }} scrollEnabled={false} contentContainerStyle={styles.listContent}/>) : (<react_native_1.View style={styles.emptyContainer}>
            <react_native_1.Text style={styles.emptyEmoji}>✅</react_native_1.Text>
            <react_native_1.Text style={styles.emptyTitle}>City is Secure</react_native_1.Text>
            <react_native_1.Text style={styles.emptySubtitle}>No active flood incidents detected at this time.</react_native_1.Text>
            <react_native_1.TouchableOpacity style={styles.reportPlaceholder} onPress={function () { return navigation.navigate("Map"); }}>
              <react_native_1.Text style={styles.reportPlaceholderText}>Switch to Live Map 🗺️</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>)}
      </react_native_1.ScrollView>

      {/* Bottom Tab Bar (Simplified for Demo) */}
      <react_native_1.View style={styles.tabBar}>
        <react_native_1.TouchableOpacity style={styles.tabItem}>
          <react_native_1.Text style={[styles.tabIcon, styles.activeTabIcon]}>🏠</react_native_1.Text>
          <react_native_1.Text style={[styles.tabLabel, styles.activeTabLabel]}>Dashboard</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.TouchableOpacity style={styles.tabItem} onPress={function () { return navigation.navigate("Map"); }}>
          <react_native_1.Text style={styles.tabIcon}>🗺️</react_native_1.Text>
          <react_native_1.Text style={styles.tabLabel}>Live Map</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.TouchableOpacity style={styles.tabItem} onPress={function () {
            if (incidents.length > 0) {
                navigation.navigate("Reasoning", { incidentId: incidents[0].id, location: incidents[0].location });
            }
        }}>
          <react_native_1.Text style={styles.tabIcon}>🤖</react_native_1.Text>
          <react_native_1.Text style={styles.tabLabel}>Reasoning</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A", // Deeper navy for premium look
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: "#0F172A",
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#94A3B8",
        marginTop: 2,
        fontWeight: "500",
    },
    liveIndicator: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(239, 68, 68, 0.2)",
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#EF4444",
        marginRight: 8,
    },
    liveText: {
        color: "#EF4444",
        fontWeight: "800",
        fontSize: 10,
        letterSpacing: 1,
    },
    content: {
        flex: 1,
    },
    statsRow: {
        flexDirection: "row",
        paddingHorizontal: 15,
        marginBottom: 25,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#1E293B",
        padding: 16,
        borderRadius: 20,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: "#334155",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    statValue: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "900",
    },
    statLabel: {
        color: "#94A3B8",
        fontSize: 11,
        marginTop: 4,
        lineHeight: 14,
        fontWeight: "600",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#FFFFFF",
        letterSpacing: -0.3,
    },
    countBadge: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginLeft: 10,
    },
    countText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    reportCard: {
        backgroundColor: "#1E293B",
        marginHorizontal: 20,
        marginBottom: 25,
        padding: 16,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#EF4444", // Red border to highlight action
        backgroundColor: "rgba(239, 68, 68, 0.05)",
    },
    reportCardContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    reportCardEmoji: {
        fontSize: 24,
        marginRight: 15,
    },
    reportCardTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    reportCardSubtitle: {
        color: "#94A3B8",
        fontSize: 12,
    },
    reportCardArrow: {
        color: "#EF4444",
        fontSize: 20,
        fontWeight: "bold",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    card: {
        backgroundColor: "#1E293B",
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#334155",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    cardLocation: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: -0.2,
    },
    cardTime: {
        color: "#64748B",
        fontSize: 12,
        marginTop: 4,
        fontWeight: "600",
    },
    cardDivider: {
        height: 1,
        backgroundColor: "#334155",
        marginVertical: 16,
    },
    cardDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    detailRow: {
        alignItems: "center",
    },
    detailLabel: {
        color: "#94A3B8",
        fontSize: 11,
        marginBottom: 6,
        fontWeight: "600",
    },
    detailValue: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    cardActions: {
        flexDirection: "row",
        gap: 12,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButton: {
        backgroundColor: "#3B82F6",
    },
    secondaryButton: {
        backgroundColor: "#334155",
        borderWidth: 1,
        borderColor: "#475569",
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 13,
    },
    secondaryButtonText: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 13,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
        marginTop: 20,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 20,
    },
    emptyTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 8,
    },
    emptySubtitle: {
        color: "#64748B",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    reportPlaceholder: {
        backgroundColor: "#334155",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    reportPlaceholderText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 14,
    },
    tabBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        backgroundColor: "#0F172A",
        paddingBottom: 34,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#1E293B",
        justifyContent: "space-around",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    tabItem: {
        alignItems: "center",
        flex: 1,
    },
    tabIcon: {
        fontSize: 22,
        color: "#64748B",
    },
    tabLabel: {
        fontSize: 11,
        color: "#64748B",
        marginTop: 6,
        fontWeight: "700",
    },
    activeTabIcon: {
        color: "#3B82F6",
    },
    activeTabLabel: {
        color: "#3B82F6",
    },
});
exports.default = Dashboard;
exports.default = Dashboard;
