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
var api_1 = require("../lib/api");
var OutcomeScreen = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var _b = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" }, incidentId = _b.incidentId, location = _b.location;
    var _c = (0, react_1.useState)(null), incident = _c[0], setIncident = _c[1];
    var fadeAnim = react_1.default.useRef(new react_native_1.Animated.Value(0)).current;
    (0, react_1.useEffect)(function () {
        var fetchIncident = function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api_1.api.getIncident(incidentId)];
                    case 1:
                        data = _a.sent();
                        setIncident(data);
                        react_native_1.Animated.timing(fadeAnim, {
                            toValue: 1,
                            duration: 1000,
                            useNativeDriver: true,
                        }).start();
                        return [2 /*return*/];
                }
            });
        }); };
        fetchIncident();
    }, [incidentId]);
    return (<react_native_1.SafeAreaView style={styles.container}>
      <react_native_1.StatusBar barStyle="light-content"/>
      
      {/* Header */}
      <react_native_1.View style={styles.header}>
        <react_native_1.TouchableOpacity onPress={function () { return navigation.popToTop(); }} style={styles.closeButton}>
          <react_native_1.Text style={styles.closeEmoji}>🏠</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.Text style={styles.headerTitle}>Mission Outcome</react_native_1.Text>
        <react_native_1.View style={{ width: 40 }}/> {/* Spacer */}
      </react_native_1.View>

      <react_native_1.ScrollView contentContainerStyle={styles.content}>
        <react_native_1.Animated.View style={[styles.successHeader, { opacity: fadeAnim }]}>
          <react_native_1.View style={styles.successIconContainer}>
            <react_native_1.Text style={styles.successIcon}>🛡️</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.Text style={styles.successTitle}>Situation Resolved</react_native_1.Text>
          <react_native_1.Text style={styles.successSubtitle}>CIRO Agentic Response Completed Successfully</react_native_1.Text>
        </react_native_1.Animated.View>

        {/* Impact Cards */}
        <react_native_1.View style={styles.statsGrid}>
          <react_native_1.View style={styles.statCard}>
            <react_native_1.Text style={styles.statEmoji}>🚗</react_native_1.Text>
            <react_native_1.Text style={styles.statValue}>50+</react_native_1.Text>
            <react_native_1.Text style={styles.statLabel}>Vehicles Saved</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.statCard}>
            <react_native_1.Text style={styles.statEmoji}>⏱️</react_native_1.Text>
            <react_native_1.Text style={styles.statValue}>-60%</react_native_1.Text>
            <react_native_1.Text style={styles.statLabel}>Congestion</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.statCard}>
            <react_native_1.Text style={styles.statEmoji}>👥</react_native_1.Text>
            <react_native_1.Text style={styles.statValue}>{(incident === null || incident === void 0 ? void 0 : incident.estimated_population) || "4.5K"}</react_native_1.Text>
            <react_native_1.Text style={styles.statLabel}>Residents Safe</react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.statCard}>
            <react_native_1.Text style={styles.statEmoji}>⚡</react_native_1.Text>
            <react_native_1.Text style={styles.statValue}>45s</react_native_1.Text>
            <react_native_1.Text style={styles.statLabel}>Detection Time</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>

        {/* Detailed Breakdown */}
        <react_native_1.View style={styles.breakdownCard}>
          <react_native_1.Text style={styles.breakdownTitle}>Resolution Summary</react_native_1.Text>
          
          <react_native_1.View style={styles.breakdownItem}>
            <react_native_1.Text style={styles.itemEmoji}>📍</react_native_1.Text>
            <react_native_1.View style={styles.itemContent}>
              <react_native_1.Text style={styles.itemTitle}>Location Secured</react_native_1.Text>
              <react_native_1.Text style={styles.itemDescription}>{location || "G-10 Sector, Islamabad"}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>

          <react_native_1.View style={styles.breakdownItem}>
            <react_native_1.Text style={styles.itemEmoji}>🏗️</react_native_1.Text>
            <react_native_1.View style={styles.itemContent}>
              <react_native_1.Text style={styles.itemTitle}>Infrastructure Status</react_native_1.Text>
              <react_native_1.Text style={styles.itemDescription}>Nearby Hospital and Schools protected from water ingress.</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>

          <react_native_1.View style={styles.breakdownItem}>
            <react_native_1.Text style={styles.itemEmoji}>🚨</react_native_1.Text>
            <react_native_1.View style={styles.itemContent}>
              <react_native_1.Text style={styles.itemTitle}>Emergency Recall</react_native_1.Text>
              <react_native_1.Text style={styles.itemDescription}>All 1122 units returned to base. Alternate routes opened.</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.View>

        <react_native_1.TouchableOpacity style={styles.doneButton} onPress={function () { return navigation.popToTop(); }}>
          <react_native_1.Text style={styles.doneButtonText}>Return to Dashboard</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.ScrollView>
    </react_native_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
    },
    closeButton: {
        padding: 8,
    },
    closeEmoji: {
        fontSize: 24,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "bold",
    },
    content: {
        padding: 20,
        alignItems: "center",
    },
    successHeader: {
        alignItems: "center",
        marginBottom: 40,
        marginTop: 20,
    },
    successIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        borderWidth: 2,
        borderColor: "rgba(16, 185, 129, 0.3)",
    },
    successIcon: {
        fontSize: 50,
    },
    successTitle: {
        color: "#FFFFFF",
        fontSize: 28,
        fontWeight: "900",
        marginBottom: 10,
    },
    successSubtitle: {
        color: "#10B981",
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 30,
    },
    statCard: {
        backgroundColor: "#1F2937",
        width: "48%",
        padding: 20,
        borderRadius: 20,
        alignItems: "center",
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#374151",
    },
    statEmoji: {
        fontSize: 24,
        marginBottom: 10,
    },
    statValue: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "800",
    },
    statLabel: {
        color: "#9CA3AF",
        fontSize: 12,
        marginTop: 4,
    },
    breakdownCard: {
        backgroundColor: "#1F2937",
        width: "100%",
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: "#374151",
    },
    breakdownTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    breakdownItem: {
        flexDirection: "row",
        marginBottom: 20,
    },
    itemEmoji: {
        fontSize: 20,
        marginRight: 15,
        marginTop: 2,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    itemDescription: {
        color: "#9CA3AF",
        fontSize: 13,
        lineHeight: 18,
    },
    doneButton: {
        backgroundColor: "#3B82F6",
        width: "100%",
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 40,
    },
    doneButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
exports.default = OutcomeScreen;
