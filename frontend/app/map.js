"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.default = FloodMap;
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_maps_1 = require("react-native-maps");
var Location = require("expo-location");
var config_1 = require("./constants/config");
var api_1 = require("../lib/api");
var SeverityBadge_1 = require("../components/SeverityBadge");
var MapOverlay_1 = require("../components/MapOverlay");
var _a = react_native_1.Dimensions.get("window"), width = _a.width, height = _a.height;
function FloodMap(_a) {
    var _this = this;
    var _b;
    var route = _a.route, navigation = _a.navigation;
    var mapRef = (0, react_1.useRef)(null);
    var _c = (0, react_1.useState)([]), incidents = _c[0], setIncidents = _c[1];
    var _d = (0, react_1.useState)(null), selectedIncident = _d[0], setSelectedIncident = _d[1];
    var _e = (0, react_1.useState)(false), isModalVisible = _e[0], setIsModalVisible = _e[1];
    var _f = (0, react_1.useState)(true), loading = _f[0], setLoading = _f[1];
    var _g = (0, react_1.useState)(false), reporting = _g[0], setReporting = _g[1];
    var selectedIncidentId = (_b = route.params) === null || _b === void 0 ? void 0 : _b.selectedIncidentId;
    var fetchIncidents = function () { return __awaiter(_this, void 0, void 0, function () {
        var data, incident_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, api_1.api.getActiveIncidents()];
                case 1:
                    data = _a.sent();
                    setIncidents(data);
                    setLoading(false);
                    // If an incident was passed via navigation, focus on it
                    if (selectedIncidentId && data.length > 0) {
                        incident_1 = data.find(function (i) { return i.id === selectedIncidentId; });
                        if (incident_1) {
                            setTimeout(function () { return handleIncidentPress(incident_1); }, 500);
                        }
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    (0, react_1.useEffect)(function () {
        fetchIncidents();
        var interval = setInterval(fetchIncidents, 10000); // Poll every 10s
        return function () { return clearInterval(interval); };
    }, [selectedIncidentId]);
    var handleIncidentPress = function (incident) {
        var _a;
        setSelectedIncident(incident);
        (_a = mapRef.current) === null || _a === void 0 ? void 0 : _a.animateToRegion({
            latitude: incident.lat,
            longitude: incident.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        }, 1000);
    };
    var handleReportPress = function () { return __awaiter(_this, void 0, void 0, function () {
        var status_1, location_1, success, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setReporting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, Location.requestForegroundPermissionsAsync()];
                case 2:
                    status_1 = (_a.sent()).status;
                    if (status_1 !== "granted") {
                        react_native_1.Alert.alert("Permission Denied", "Location permission is required to report a flood.");
                        setReporting(false);
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Location.getCurrentPositionAsync({})];
                case 3:
                    location_1 = _a.sent();
                    return [4 /*yield*/, api_1.api.reportFlood(location_1.coords.latitude, location_1.coords.longitude)];
                case 4:
                    success = _a.sent();
                    if (success) {
                        react_native_1.Alert.alert("Flood Reported", "Your GPS coordinates have been sent to CIRO. AI agents are now analyzing the signal.", [{ text: "OK", onPress: function () { return fetchIncidents(); } }]);
                    }
                    else {
                        react_native_1.Alert.alert("Error", "Failed to submit report. Please check your connection.");
                    }
                    return [3 /*break*/, 7];
                case 5:
                    error_1 = _a.sent();
                    console.error(error_1);
                    react_native_1.Alert.alert("Error", "An unexpected error occurred.");
                    return [3 /*break*/, 7];
                case 6:
                    setReporting(false);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var getSeverityColor = function (severity, type) {
        if (severity >= 7.5) {
            return type === "fill" ? "rgba(220, 38, 38, 0.4)" : "rgba(220, 38, 38, 1)";
        }
        else if (severity >= 4.5) {
            return type === "fill" ? "rgba(245, 158, 11, 0.35)" : "rgba(245, 158, 11, 1)";
        }
        return type === "fill" ? "rgba(16, 185, 129, 0.3)" : "rgba(16, 185, 129, 1)";
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.StatusBar barStyle="light-content"/>

      <react_native_maps_1.default ref={mapRef} style={styles.map} initialRegion={config_1.CONFIG.ISLAMABAD_CENTER} showsUserLocation={true} mapType="mutedStandard" userInterfaceStyle="dark">
        <MapOverlay_1.default incidents={incidents}/>

        {incidents.map(function (incident) { return (<react_native_maps_1.Marker key={"marker-".concat(incident.id)} coordinate={{ latitude: incident.lat, longitude: incident.lng }} onPress={function () { return handleIncidentPress(incident); }}>

              <react_native_1.View style={[styles.customMarker, { backgroundColor: getSeverityColor(incident.severity_score, "stroke") }]}>
                <react_native_1.Text style={styles.markerEmoji}>🌊</react_native_1.Text>
              </react_native_1.View>
              <react_native_maps_1.Callout onPress={function () {
                setSelectedIncident(incident);
                setIsModalVisible(true);
            }}>
                <react_native_1.View style={styles.callout}>
                  <react_native_1.Text style={styles.calloutTitle}>{incident.location}</react_native_1.Text>
                  <react_native_1.Text style={styles.calloutSub}>Severity: {incident.severity_score.toFixed(1)}</react_native_1.Text>
                  <react_native_1.Text style={styles.calloutStatus}>{incident.status.toUpperCase()}</react_native_1.Text>
                  <react_native_1.Text style={styles.tapDetail}>Tap for AI Reasoning \u2192</react_native_1.Text>
                </react_native_1.View>
              </react_native_maps_1.Callout>
            </react_native_maps_1.Marker>); })}

      </react_native_maps_1.default>

      <react_native_1.SafeAreaView style={styles.overlay}>
        {/* Header */}
        <react_native_1.View style={styles.header}>
          <react_native_1.TouchableOpacity style={styles.backButton} onPress={function () { return navigation.goBack(); }}>
            <react_native_1.Text style={styles.backText}>⬅️</react_native_1.Text>
          </react_native_1.TouchableOpacity>
          <react_native_1.View style={styles.headerInfo}>
            <react_native_1.Text style={styles.headerTitle}>Live Crisis Map</react_native_1.Text>
            <react_native_1.Text style={styles.headerSubtitle}>{incidents.length} Active Incidents</react_native_1.Text>
          </react_native_1.View>
          {loading && <react_native_1.ActivityIndicator color="#FFFFFF" size="small"/>}
        </react_native_1.View>

        {/* Report Button */}
        <react_native_1.View style={styles.reportContainer}>
          <react_native_1.TouchableOpacity style={[styles.reportButton, reporting && styles.disabledButton]} onPress={handleReportPress} disabled={reporting}>
            {reporting ? (<react_native_1.ActivityIndicator color="#FFFFFF"/>) : (<>
                <react_native_1.Text style={styles.reportIcon}>🚨</react_native_1.Text>
                <react_native_1.Text style={styles.reportText}>Report Flood at GPS</react_native_1.Text>
              </>)}
          </react_native_1.TouchableOpacity>
        </react_native_1.View>

        {/* Bottom Cards */}
        {incidents.length > 0 && (<react_native_1.View style={styles.bottomContainer}>
            <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardList}>
              {incidents.map(function (incident) { return (<react_native_1.TouchableOpacity key={"card-".concat(incident.id)} style={[styles.miniCard, (selectedIncident === null || selectedIncident === void 0 ? void 0 : selectedIncident.id) === incident.id && styles.activeCard]} onPress={function () { return handleIncidentPress(incident); }}>
                  <react_native_1.View style={styles.miniCardHeader}>
                    <react_native_1.Text style={styles.miniCardTitle} numberOfLines={1}>{incident.location}</react_native_1.Text>
                    <SeverityBadge_1.default score={incident.severity_score}/>
                  </react_native_1.View>
                  <react_native_1.View style={styles.miniCardFooter}>
                    <react_native_1.Text style={styles.miniCardInfo}>👥 {incident.estimated_population}</react_native_1.Text>
                    <react_native_1.TouchableOpacity onPress={function () { return navigation.navigate("Reasoning", { incidentId: incident.id, location: incident.location }); }} style={styles.reasoningBtn}>
                      <react_native_1.Text style={styles.reasoningBtnText}>AI Reasoning 🤖</react_native_1.Text>
                    </react_native_1.TouchableOpacity>
                  </react_native_1.View>
                </react_native_1.TouchableOpacity>); })}
            </react_native_1.ScrollView>
          </react_native_1.View>)}
      </react_native_1.SafeAreaView>

      {/* Detail Modal */}
      <react_native_1.Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={function () { return setIsModalVisible(false); }}>
        <react_native_1.View style={styles.modalOverlay}>
          <react_native_1.View style={styles.modalContent}>
            <react_native_1.View style={styles.modalHeader}>
              <react_native_1.Text style={styles.modalTitle}>Crisis Intelligence</react_native_1.Text>
              <react_native_1.TouchableOpacity onPress={function () { return setIsModalVisible(false); }}>
                <react_native_1.Text style={styles.closeEmoji}>❌</react_native_1.Text>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
            
            {selectedIncident && (<react_native_1.View style={styles.modalBody}>
                <react_native_1.Text style={styles.modalLocation}>{selectedIncident.location}</react_native_1.Text>
                <react_native_1.View style={styles.modalStatsRow}>
                  <react_native_1.View style={styles.modalStat}>
                    <react_native_1.Text style={styles.modalStatLabel}>Severity</react_native_1.Text>
                    <react_native_1.Text style={styles.modalStatValue}>{selectedIncident.severity_score.toFixed(1)}/10</react_native_1.Text>
                  </react_native_1.View>
                  <react_native_1.View style={styles.modalStat}>
                    <react_native_1.Text style={styles.modalStatLabel}>Confidence</react_native_1.Text>
                    <react_native_1.Text style={styles.modalStatValue}>{(selectedIncident.confidence * 100).toFixed(0)}%</react_native_1.Text>
                  </react_native_1.View>
                  <react_native_1.View style={styles.modalStat}>
                    <react_native_1.Text style={styles.modalStatLabel}>Impact ETA</react_native_1.Text>
                    <react_native_1.Text style={styles.modalStatValue}>{selectedIncident.peak_impact_eta || "Immediate"}</react_native_1.Text>
                  </react_native_1.View>
                </react_native_1.View>

                <react_native_1.TouchableOpacity style={styles.modalActionBtn} onPress={function () {
                setIsModalVisible(false);
                navigation.navigate("Reasoning", { incidentId: selectedIncident.id, location: selectedIncident.location });
            }}>
                  <react_native_1.Text style={styles.modalActionText}>Open AI Reasoning Console</react_native_1.Text>
                </react_native_1.TouchableOpacity>
              </react_native_1.View>)}
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.Modal>
    </react_native_1.View>);
}
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0F172A",
    },
    map: __assign({}, react_native_1.StyleSheet.absoluteFillObject),
    overlay: {
        flex: 1,
        justifyContent: "space-between",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(15, 23, 42, 0.9)",
        margin: 15,
        padding: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    backButton: {
        padding: 5,
        marginRight: 15,
    },
    backText: {
        fontSize: 20,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "#94A3B8",
        fontSize: 12,
    },
    reportContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    reportButton: {
        backgroundColor: "#EF4444",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    disabledButton: {
        opacity: 0.7,
    },
    reportIcon: {
        fontSize: 18,
        marginRight: 10,
    },
    reportText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    bottomContainer: {
        paddingBottom: 30,
    },
    cardList: {
        paddingHorizontal: 15,
    },
    miniCard: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        width: width * 0.75,
        borderRadius: 20,
        padding: 15,
        marginHorizontal: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    activeCard: {
        borderColor: "#3B82F6",
        borderWidth: 2,
    },
    miniCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    miniCardTitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
        marginRight: 10,
    },
    miniCardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    miniCardInfo: {
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "600",
    },
    reasoningBtn: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.2)",
    },
    reasoningBtnText: {
        color: "#3B82F6",
        fontSize: 11,
        fontWeight: "bold",
    },
    customMarker: {
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#FFFFFF",
    },
    markerEmoji: {
        fontSize: 16,
    },
    callout: {
        width: 200,
        padding: 10,
        backgroundColor: "#FFFFFF",
    },
    calloutTitle: {
        fontWeight: "bold",
        fontSize: 14,
        color: "#0F172A",
    },
    calloutSub: {
        fontSize: 12,
        color: "#64748B",
        marginTop: 2,
    },
    calloutStatus: {
        fontSize: 10,
        fontWeight: "900",
        color: "#EF4444",
        marginTop: 4,
    },
    tapDetail: {
        fontSize: 10,
        color: "#3B82F6",
        marginTop: 8,
        fontStyle: "italic",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#1E293B",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        paddingBottom: 50,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        color: "#94A3B8",
        fontSize: 14,
        fontWeight: "bold",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    closeEmoji: {
        fontSize: 20,
    },
    modalBody: {
        alignItems: "center",
    },
    modalLocation: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 25,
    },
    modalStatsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "100%",
        marginBottom: 30,
    },
    modalStat: {
        alignItems: "center",
    },
    modalStatLabel: {
        color: "#64748B",
        fontSize: 11,
        marginBottom: 5,
        fontWeight: "600",
    },
    modalStatValue: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalActionBtn: {
        backgroundColor: "#3B82F6",
        width: "100%",
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: "center",
    },
    modalActionText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
