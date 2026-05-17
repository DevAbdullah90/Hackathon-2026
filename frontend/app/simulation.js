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
var ExecutionTimeline_1 = require("../components/ExecutionTimeline");
var api_1 = require("../lib/api");
var SimView = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var _b = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" }, incidentId = _b.incidentId, location = _b.location;
    var _c = (0, react_1.useState)([]), actions = _c[0], setActions = _c[1];
    var _d = (0, react_1.useState)(true), loading = _d[0], setLoading = _d[1];
    var _e = (0, react_1.useState)(false), triggering = _e[0], setTriggering = _e[1];
    var fetchSimulationState = function () { return __awaiter(void 0, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.api.getSimulationState(incidentId)];
                case 1:
                    data = _a.sent();
                    setActions(data);
                    setLoading(false);
                    return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        fetchSimulationState();
        // Poll for updates every 3 seconds during simulation
        var interval = setInterval(fetchSimulationState, 3000);
        return function () { return clearInterval(interval); };
    }, [incidentId]);
    var handleTriggerSim = function () { return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setTriggering(true);
                    return [4 /*yield*/, api_1.api.triggerSimulation(incidentId)];
                case 1:
                    success = _a.sent();
                    setTriggering(false);
                    if (success) {
                        react_native_1.Alert.alert("Success", "Simulation loop started. Actions will update in real-time.");
                    }
                    else {
                        react_native_1.Alert.alert("Error", "Failed to start simulation. The incident might not be confirmed yet.");
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var allCompleted = actions.length > 0 && actions.every(function (a) { return a.status.toUpperCase() === "COMPLETED"; });
    return (<react_native_1.SafeAreaView style={styles.container}>
      <react_native_1.StatusBar barStyle="light-content"/>
      
      {/* Header */}
      <react_native_1.View style={styles.header}>
        <react_native_1.TouchableOpacity onPress={function () { return navigation.goBack(); }} style={styles.backButton}>
          <react_native_1.Text style={styles.backEmoji}>⬅️</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.View style={styles.headerTitleContainer}>
          <react_native_1.Text style={styles.headerTitle}>Simulation Console</react_native_1.Text>
          <react_native_1.Text style={styles.headerSubtitle}>{location}</react_native_1.Text>
        </react_native_1.View>
        {actions.length > 0 && (<react_native_1.View style={styles.statusBadge}>
            <react_native_1.Text style={styles.statusBadgeText}>
              {actions.filter(function (a) { return a.status.toUpperCase() === "COMPLETED"; }).length}/{actions.length} Done
            </react_native_1.Text>
          </react_native_1.View>)}
      </react_native_1.View>

      <react_native_1.ScrollView style={styles.content}>
        {/* Simulation Summary */}
        <react_native_1.View style={styles.summaryCard}>
          <react_native_1.Text style={styles.summaryTitle}>Response Strategy</react_native_1.Text>
          <react_native_1.Text style={styles.summaryText}>
            The AI has generated a multi-step response plan to mitigate impact and ensure public safety. 
            Each action is simulated step-by-step to visualize the outcome.
          </react_native_1.Text>
          
          {actions.length === 0 && !loading && (<react_native_1.TouchableOpacity style={[styles.triggerButton, triggering && styles.disabledButton]} onPress={handleTriggerSim} disabled={triggering}>
              {triggering ? (<react_native_1.ActivityIndicator color="#FFFFFF" size="small"/>) : (<react_native_1.Text style={styles.triggerButtonText}>🚀 Activate Simulation Plan</react_native_1.Text>)}
            </react_native_1.TouchableOpacity>)}
        </react_native_1.View>

        {/* Timeline */}
        <react_native_1.View style={styles.timelineSection}>
          <react_native_1.Text style={styles.sectionTitle}>Execution Timeline</react_native_1.Text>
          {loading ? (<react_native_1.ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }}/>) : actions.length > 0 ? (<ExecutionTimeline_1.default actions={actions}/>) : (<react_native_1.View style={styles.emptyState}>
              <react_native_1.Text style={styles.emptyText}>No actions generated yet. Ensure the incident is confirmed and the plan is activated.</react_native_1.Text>
            </react_native_1.View>)}
        </react_native_1.View>
      </react_native_1.ScrollView>

      {/* Final Outcome Button */}
      {allCompleted && (<react_native_1.View style={styles.footer}>
          <react_native_1.TouchableOpacity style={styles.outcomeButton} onPress={function () { return navigation.navigate("Outcome", { incidentId: incidentId, location: location }); }}>
            <react_native_1.Text style={styles.outcomeButtonText}>View Final Outcome 📊</react_native_1.Text>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>)}
    </react_native_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#1F2937",
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    backEmoji: {
        fontSize: 20,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "#9CA3AF",
        fontSize: 12,
    },
    statusBadge: {
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(16, 185, 129, 0.3)",
    },
    statusBadgeText: {
        color: "#10B981",
        fontSize: 10,
        fontWeight: "bold",
    },
    content: {
        flex: 1,
    },
    summaryCard: {
        backgroundColor: "#1F2937",
        margin: 20,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#374151",
    },
    summaryTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
    },
    summaryText: {
        color: "#9CA3AF",
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 20,
    },
    triggerButton: {
        backgroundColor: "#3B82F6",
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    triggerButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    timelineSection: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    emptyState: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyText: {
        color: "#6B7280",
        fontSize: 14,
        textAlign: "center",
        fontStyle: "italic",
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#1F2937",
        backgroundColor: "#111827",
    },
    outcomeButton: {
        backgroundColor: "#10B981",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    outcomeButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
exports.default = SimView;
