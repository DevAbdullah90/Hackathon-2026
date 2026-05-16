"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var api_1 = require("../lib/api");
var LiveLogStream = function (_a) {
    var incidentId = _a.incidentId;
    var _b = (0, react_1.useState)([]), logs = _b[0], setLogs = _b[1];
    var flatListRef = (0, react_1.useRef)(null);
    var ws = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // Connect to WebSocket
        var url = (0, api_1.getWebSocketUrl)(incidentId);
        console.log("Connecting to WebSocket:", url);
        ws.current = new WebSocket(url);
        ws.current.onmessage = function (event) {
            try {
                var data_1 = JSON.parse(event.data);
                // Backend might send different types of messages, we care about reasoning logs
                if (data_1.type === "reasoning_log" || data_1.agent_name) {
                    setLogs(function (prev) { return __spreadArray(__spreadArray([], prev, true), [data_1], false); });
                }
            }
            catch (err) {
                console.error("WS Parse Error:", err);
            }
        };
        ws.current.onerror = function (err) { return console.error("WS Error:", err); };
        ws.current.onclose = function () { return console.log("WS Closed"); };
        return function () {
            var _a;
            (_a = ws.current) === null || _a === void 0 ? void 0 : _a.close();
        };
    }, [incidentId]);
    (0, react_1.useEffect)(function () {
        // Auto-scroll to bottom when new logs arrive
        if (logs.length > 0) {
            setTimeout(function () {
                var _a;
                (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [logs]);
    var renderLogItem = function (_a) {
        var item = _a.item, index = _a.index;
        var isLast = index === logs.length - 1;
        return (<react_native_1.View style={[styles.logItem, isLast && styles.latestLog]}>
        <react_native_1.View style={styles.logHeader}>
          <react_native_1.Text style={styles.agentName}>🤖 {item.agent_name.replace("_", " ").toUpperCase()}</react_native_1.Text>
          <react_native_1.Text style={styles.logTime}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</react_native_1.Text>
        </react_native_1.View>
        <react_native_1.Text style={styles.logText}>{item.log_text}</react_native_1.Text>
        <react_native_1.View style={styles.divider}/>
      </react_native_1.View>);
    };
    if (logs.length === 0) {
        return (<react_native_1.View style={styles.emptyContainer}>
        <react_native_1.Text style={styles.emptyText}>Waiting for AI reasoning logs...</react_native_1.Text>
      </react_native_1.View>);
    }
    return (<react_native_1.FlatList ref={flatListRef} data={logs} renderItem={renderLogItem} keyExtractor={function (item, index) { return item.id || index.toString(); }} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}/>);
};
var styles = react_native_1.StyleSheet.create({
    listContent: {
        padding: 15,
        paddingBottom: 40,
    },
    logItem: {
        marginBottom: 15,
        backgroundColor: "rgba(31, 41, 55, 0.5)",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(55, 65, 81, 0.5)",
    },
    latestLog: {
        borderColor: "#3B82F6",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
    },
    logHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    agentName: {
        color: "#3B82F6",
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    logTime: {
        color: "#6B7280",
        fontSize: 10,
    },
    logText: {
        color: "#E5E7EB",
        fontSize: 14,
        lineHeight: 20,
        fontFamily: "System",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(55, 65, 81, 0.3)",
        marginTop: 10,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        color: "#6B7280",
        fontSize: 14,
        textAlign: "center",
        fontStyle: "italic",
    },
});
exports.default = LiveLogStream;
