"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var SeverityBadge = function (_a) {
    var score = _a.score;
    var backgroundColor = "#10B981"; // Green (LOW)
    var label = "LOW";
    if (score >= 7.5) {
        backgroundColor = "#EF4444"; // Red (CRITICAL)
        label = "CRITICAL";
    }
    else if (score >= 4.5) {
        backgroundColor = "#F59E0B"; // Orange (MODERATE)
        label = "MODERATE";
    }
    return (<react_native_1.View style={[styles.badge, { backgroundColor: backgroundColor }]}>
      <react_native_1.Text style={styles.text}>{label}</react_native_1.Text>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },
    text: {
        color: "#FFFFFF",
        fontSize: 9,
        fontWeight: "900",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});
exports.default = SeverityBadge;
