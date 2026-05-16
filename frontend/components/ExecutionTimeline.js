"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var ExecutionTimeline = function (_a) {
    var actions = _a.actions;
    var getStatusColor = function (status) {
        switch (status.toUpperCase()) {
            case "COMPLETED":
                return "#10B981";
            case "ACTIVE":
            case "ON_SITE":
            case "SENT":
                return "#3B82F6";
            case "PENDING":
                return "#9CA3AF";
            default:
                return "#9CA3AF";
        }
    };
    var getStatusIcon = function (status) {
        switch (status.toUpperCase()) {
            case "COMPLETED":
                return "✅";
            case "ACTIVE":
            case "ON_SITE":
            case "SENT":
                return "🔵";
            case "PENDING":
                return "⚪";
            default:
                return "⚪";
        }
    };
    var renderActionItem = function (_a) {
        var item = _a.item, index = _a.index;
        var isLast = index === actions.length - 1;
        var statusColor = getStatusColor(item.status);
        var icon = getStatusIcon(item.status);
        return (<react_native_1.View style={styles.actionRow}>
        <react_native_1.View style={styles.leftColumn}>
          <react_native_1.View style={[styles.statusDot, { backgroundColor: statusColor }]}>
            <react_native_1.Text style={styles.iconText}>{icon}</react_native_1.Text>
          </react_native_1.View>
          {!isLast && <react_native_1.View style={[styles.line, { backgroundColor: statusColor }]}/>}
        </react_native_1.View>
        <react_native_1.View style={styles.rightColumn}>
          <react_native_1.View style={styles.actionHeader}>
            <react_native_1.Text style={styles.actionType}>{item.type.replace("_", " ")}</react_native_1.Text>
            <react_native_1.View style={[styles.statusBadge, { backgroundColor: statusColor + "20", borderColor: statusColor }]}>
              <react_native_1.Text style={[styles.statusText, { color: statusColor }]}>{item.status}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
          {item.predicted_side_effects && (<react_native_1.Text style={styles.sideEffects}>
              ⚠️ <react_native_1.Text style={styles.sideEffectLabel}>Side Effect:</react_native_1.Text> {item.predicted_side_effects}
            </react_native_1.Text>)}
          <react_native_1.Text style={styles.timestamp}>Updated: {new Date(item.updated_at).toLocaleTimeString()}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>);
    };
    return (<react_native_1.View style={styles.container}>
      <react_native_1.FlatList data={actions} renderItem={renderActionItem} keyExtractor={function (item) { return item.id; }} scrollEnabled={false}/>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    actionRow: {
        flexDirection: "row",
        minHeight: 80,
    },
    leftColumn: {
        width: 40,
        alignItems: "center",
    },
    statusDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.1)",
    },
    iconText: {
        fontSize: 14,
    },
    line: {
        width: 2,
        flex: 1,
        marginVertical: -2,
    },
    rightColumn: {
        flex: 1,
        paddingLeft: 10,
        paddingBottom: 20,
    },
    actionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    actionType: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 10,
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    sideEffects: {
        color: "#FCD34D",
        fontSize: 12,
        marginTop: 4,
        backgroundColor: "rgba(252, 211, 77, 0.1)",
        padding: 8,
        borderRadius: 6,
        overflow: "hidden",
    },
    sideEffectLabel: {
        fontWeight: "bold",
    },
    timestamp: {
        color: "#6B7280",
        fontSize: 10,
        marginTop: 8,
    },
});
exports.default = ExecutionTimeline;
