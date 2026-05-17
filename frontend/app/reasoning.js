"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var LiveLogStream_1 = require("../components/LiveLogStream");
var ReasoningCenter = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var _b = route.params || { incidentId: "INC-DEMO", location: "Active Crisis" }, incidentId = _b.incidentId, location = _b.location;
    return (<react_native_1.SafeAreaView style={styles.container}>
      <react_native_1.StatusBar barStyle="light-content"/>
      
      {/* Header */}
      <react_native_1.View style={styles.header}>
        <react_native_1.TouchableOpacity onPress={function () { return navigation.goBack(); }} style={styles.backButton}>
          <react_native_1.Text style={styles.backEmoji}>⬅️</react_native_1.Text>
        </react_native_1.TouchableOpacity>
        <react_native_1.View style={styles.headerTitleContainer}>
          <react_native_1.Text style={styles.headerTitle}>AI Reasoning Center</react_native_1.Text>
          <react_native_1.Text style={styles.headerSubtitle}>{location}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={styles.idBadge}>
          <react_native_1.Text style={styles.idText}>{incidentId}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>

      {/* Main Content */}
      <react_native_1.View style={styles.content}>
        <react_native_1.View style={styles.infoBox}>
          <react_native_1.Text style={styles.infoText}>
            🤖 This console shows the real-time "Chain of Thought" as multiple AI agents collaborate to resolve the crisis.
          </react_native_1.Text>
        </react_native_1.View>
        
        <LiveLogStream_1.default incidentId={incidentId}/>
      </react_native_1.View>

      {/* Bottom Action */}
      <react_native_1.View style={styles.footer}>
        <react_native_1.TouchableOpacity style={styles.actionButton} onPress={function () { return navigation.navigate("Simulation", { incidentId: incidentId, location: location }); }}>
          <react_native_1.Text style={styles.actionButtonText}>View Execution Plan ⚡</react_native_1.Text>
        </react_native_1.TouchableOpacity>
      </react_native_1.View>
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
    idBadge: {
        backgroundColor: "#374151",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    idText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "bold",
    },
    content: {
        flex: 1,
    },
    infoBox: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        margin: 15,
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(59, 130, 246, 0.3)",
    },
    infoText: {
        color: "#93C5FD",
        fontSize: 12,
        lineHeight: 18,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#1F2937",
    },
    actionButton: {
        backgroundColor: "#2563EB",
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    actionButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
exports.default = ReasoningCenter;
