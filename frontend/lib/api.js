"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.api = exports.NetworkError = exports.ApiError = void 0;
var config_1 = require("../constants/config");
// ─────────────────────────────────────────────────────────────────────────────
// 2. ERROR STRUCTURES & HANDLERS
// ─────────────────────────────────────────────────────────────────────────────
var ApiError = /** @class */ (function (_super) {
    __extends(ApiError, _super);
    function ApiError(status, statusText, body) {
        var _this = _super.call(this, "[API HTTP ".concat(status, "] ").concat(statusText)) || this;
        _this.name = "ApiError";
        _this.status = status;
        _this.statusText = statusText;
        _this.body = body;
        return _this;
    }
    return ApiError;
}(Error));
exports.ApiError = ApiError;
var NetworkError = /** @class */ (function (_super) {
    __extends(NetworkError, _super);
    function NetworkError(message) {
        var _this = _super.call(this, "[API NETWORK FAILURE] ".concat(message)) || this;
        _this.name = "NetworkError";
        return _this;
    }
    return NetworkError;
}(Error));
exports.NetworkError = NetworkError;
// ─────────────────────────────────────────────────────────────────────────────
// 3. CURATED DEMO FALLBACK DATA (Demo Resilience)
// ─────────────────────────────────────────────────────────────────────────────
var now = function () { return new Date().toISOString(); };
var MOCK_INCIDENTS = [
    {
        id: "inc-g10",
        location: "G-10, Islamabad",
        lat: 33.6675,
        lng: 73.0303,
        severity_score: 8.9,
        confidence: 0.96,
        affected_radius_km: 1.8,
        estimated_population: 6400,
        peak_impact_eta: "12 min",
        status: "ACTIVE",
        risk_factors: ["heavy_rain", "drainage_blockage", "road_ponding"],
        created_at: "2026-05-17T09:20:00.000Z",
    },
    {
        id: "inc-g13",
        location: "G-13, Islamabad",
        lat: 33.6872,
        lng: 73.0156,
        severity_score: 6.2,
        confidence: 0.89,
        affected_radius_km: 1.1,
        estimated_population: 3100,
        peak_impact_eta: "25 min",
        status: "ACTIVE",
        risk_factors: ["moderate_flooding", "traffic_delay"],
        created_at: "2026-05-17T09:28:00.000Z",
    },
];
var MOCK_REASONING_LOGS = {
    "inc-g10": [
        {
            id: "log-1",
            incident_id: "inc-g10",
            agent_name: "detection_agent",
            log_text: "Received user GPS signal and confirmed water accumulation near G-10 service road.",
            log_level: "INFO",
            created_at: now(),
        },
        {
            id: "log-2",
            incident_id: "inc-g10",
            agent_name: "notification_agent",
            log_text: "Prepared stakeholder alerts for public, hospital, utility, traffic, 1122, and command center.",
            log_level: "INFO",
            created_at: now(),
        },
        {
            id: "log-3",
            incident_id: "inc-g10",
            agent_name: "simulation_engine",
            log_text: "Rescue dispatch and drainage response marked active in the execution timeline.",
            log_level: "INFO",
            created_at: now(),
        },
    ],
    "inc-g13": [
        {
            id: "log-1b",
            incident_id: "inc-g13",
            agent_name: "detection_agent",
            log_text: "Secondary rainfall pattern detected. Traffic matrix indicates congestion near G-13.",
            log_level: "INFO",
            created_at: now(),
        },
        {
            id: "log-2b",
            incident_id: "inc-g13",
            agent_name: "notification_agent",
            log_text: "Utility and traffic authority notifications queued with reduced severity priority.",
            log_level: "INFO",
            created_at: now(),
        },
    ],
};
var MOCK_COT_LOGS = {
    "inc-g10": [
        {
            id: "cot-1",
            incident_id: "inc-g10",
            agent_name: "signal_agent",
            cot_steps: "1. Scan incoming user GPS coords: lat=33.6675, lng=73.0303.\n2. Match with historical flooding points in sector G-10.\n3. Trigger high confidence (96%) alert.",
            created_at: now(),
        },
        {
            id: "cot-2",
            incident_id: "inc-g10",
            agent_name: "severity_agent",
            cot_steps: "1. Pull affected radius: 1.8km.\n2. Calculate population density mapping -> estimated 6,400 people.\n3. Check critical assets in radius -> 1 Hospital (nearby), 2 schools.\n4. Synthesize final severity score: 8.9 (Critical Crisis Level).",
            created_at: now(),
        },
    ],
    "inc-g13": [
        {
            id: "cot-1b",
            incident_id: "inc-g13",
            agent_name: "signal_agent",
            cot_steps: "1. Scan incoming user GPS coords: lat=33.6872, lng=73.0156.\n2. Minor ponding reported near G-13 market area.\n3. Trigger medium confidence (89%) alert.",
            created_at: now(),
        },
        {
            id: "cot-2b",
            incident_id: "inc-g13",
            agent_name: "severity_agent",
            cot_steps: "1. Pull affected radius: 1.1km.\n2. Calculate population density mapping -> estimated 3,100 people.\n3. Check critical assets in radius -> 1 local clinic, 1 highway link.\n4. Synthesize final severity score: 6.2 (Moderate Level).",
            created_at: now(),
        },
    ],
};
var MOCK_ACTIONS = {
    "inc-g10": [
        {
            id: "action-1",
            incident_id: "inc-g10",
            type: "DISPATCH_RESCUE",
            status: "COMPLETED",
            predicted_side_effects: "Reduced congestion on main access road.",
            updated_at: now(),
        },
        {
            id: "action-2",
            incident_id: "inc-g10",
            type: "DEPLOY_DRAINAGE_CREW",
            status: "COMPLETED",
            predicted_side_effects: "Water level stabilizes within 20 minutes.",
            updated_at: now(),
        },
        {
            id: "action-3",
            incident_id: "inc-g10",
            type: "NOTIFY_TRAFFIC_AUTHORITY",
            status: "COMPLETED",
            predicted_side_effects: "Alternate routes opened around affected sector.",
            updated_at: now(),
        },
    ],
    "inc-g13": [
        {
            id: "action-4",
            incident_id: "inc-g13",
            type: "MONITOR_RAINFALL",
            status: "COMPLETED",
            predicted_side_effects: "Early warning issued to nearby residents.",
            updated_at: now(),
        },
        {
            id: "action-5",
            incident_id: "inc-g13",
            type: "PREPARE_RESPONSE_TEAM",
            status: "COMPLETED",
            predicted_side_effects: "Standby resources assigned for rapid escalation.",
            updated_at: now(),
        },
    ],
};
// ─────────────────────────────────────────────────────────────────────────────
// 4. PREMIUM REQUEST ORCHESTRATION ENGINE (Vibe Coder Grade)
// ─────────────────────────────────────────────────────────────────────────────
var DEFAULT_TIMEOUT = 10000; // 10 seconds timeout protection
var MAX_RETRIES = 3;
var RETRY_DELAY_BASE = 500; // milliseconds
var sleep = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
/**
 * High-End Central Request Orchestrator
 * Supports Abort Timeouts, Silent Retries with Exponential Backoff,
 * Structured Logging, and Auto-Fallback to mock data on server death.
 */
function makeRequest(path_1) {
    return __awaiter(this, arguments, void 0, function (path, options, retriesLeft, delay) {
        var url, controller, timeoutId, requestOptions, startTime, response, duration, body, _a, error_1, isTimeout, isNetworkError;
        var _b;
        if (options === void 0) { options = {}; }
        if (retriesLeft === void 0) { retriesLeft = MAX_RETRIES; }
        if (delay === void 0) { delay = RETRY_DELAY_BASE; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    url = "".concat(config_1.CONFIG.API_BASE_URL).concat(path);
                    controller = new AbortController();
                    timeoutId = setTimeout(function () { return controller.abort(); }, DEFAULT_TIMEOUT);
                    requestOptions = __assign(__assign({}, options), { signal: controller.signal, headers: __assign({ "Content-Type": "application/json", Accept: "application/json" }, (options.headers || {})) });
                    startTime = Date.now();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 10, , 13]);
                    console.log("\uD83D\uDCE1 [API CALL] ".concat(requestOptions.method || "GET", " ").concat(path, " (Attempt: ").concat(MAX_RETRIES - retriesLeft + 1, "/").concat(MAX_RETRIES, ")"));
                    return [4 /*yield*/, fetch(url, requestOptions)];
                case 2:
                    response = _c.sent();
                    clearTimeout(timeoutId);
                    duration = Date.now() - startTime;
                    console.log("\u2728 [API RESPONSE] ".concat(requestOptions.method || "GET", " ").concat(path, " -> HTTP ").concat(response.status, " (").concat(duration, "ms)"));
                    if (!!response.ok) return [3 /*break*/, 8];
                    body = null;
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 7]);
                    return [4 /*yield*/, response.json()];
                case 4:
                    body = _c.sent();
                    return [3 /*break*/, 7];
                case 5:
                    _a = _c.sent();
                    return [4 /*yield*/, response.text()];
                case 6:
                    body = _c.sent();
                    return [3 /*break*/, 7];
                case 7: throw new ApiError(response.status, response.statusText, body);
                case 8: return [4 /*yield*/, response.json()];
                case 9: 
                // Success response parsing
                return [2 /*return*/, (_c.sent())];
                case 10:
                    error_1 = _c.sent();
                    clearTimeout(timeoutId);
                    isTimeout = error_1.name === "AbortError";
                    isNetworkError = error_1 instanceof TypeError || ((_b = error_1.message) === null || _b === void 0 ? void 0 : _b.includes("Network request failed"));
                    console.warn("\u26A0\uFE0F [API FAILURE] ".concat(requestOptions.method || "GET", " ").concat(path, ": ").concat(error_1.message));
                    if (!((isTimeout || isNetworkError) && retriesLeft > 0)) return [3 /*break*/, 12];
                    console.log("\uD83D\uDD04 [API RETRY] Retrying in ".concat(delay, "ms... (").concat(retriesLeft, " retries remaining)"));
                    return [4 /*yield*/, sleep(delay)];
                case 11:
                    _c.sent();
                    return [2 /*return*/, makeRequest(path, options, retriesLeft - 1, delay * 2)];
                case 12:
                    // Rethrow standard HTTP ApiErrors (like 404, 400) to let caller handle them
                    if (error_1 instanceof ApiError) {
                        throw error_1;
                    }
                    // Wrap remaining generic exceptions
                    throw new NetworkError(error_1.message || "Unknown communication failure");
                case 13: return [2 /*return*/];
            }
        });
    });
}
// ─────────────────────────────────────────────────────────────────────────────
// 5. UNIFIED HIGH-END API LAYER (With Fallback Resilience)
// ─────────────────────────────────────────────────────────────────────────────
exports.api = {
    /**
     * Fetch all active flood incidents.
     * If remote backend is unreachable, gracefully falls back to mock Islamabad list.
     */
    getActiveIncidents: function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, makeRequest("/api/v1/incidents/active")];
                    case 1:
                        data = _a.sent();
                        // Map database types to frontend keys
                        return [2 /*return*/, data.map(function (item) { return ({
                                id: String(item.id),
                                location: item.location,
                                lat: item.lat,
                                lng: item.lng,
                                severity_score: item.severity_score || 0,
                                confidence: item.confidence || 1.0,
                                affected_radius_km: item.affected_radius_km || 0.5,
                                estimated_population: item.estimated_population || 0,
                                peak_impact_eta: item.peak_impact_eta || "NOW",
                                status: item.status.toUpperCase(),
                                risk_factors: item.risk_factors,
                                created_at: item.created_at,
                            }); })];
                    case 2:
                        err_1 = _a.sent();
                        console.log("🛡️ [API FALLBACK] getActiveIncidents() -> Serving cached mock Islamabad cluster.");
                        return [2 /*return*/, MOCK_INCIDENTS];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetch single incident details.
     */
    getIncident: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var item, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, makeRequest("/api/v1/incidents/".concat(id))];
                    case 1:
                        item = _a.sent();
                        return [2 /*return*/, {
                                id: String(item.id),
                                location: item.location,
                                lat: item.lat,
                                lng: item.lng,
                                severity_score: item.severity_score || 0,
                                confidence: item.confidence || 1.0,
                                affected_radius_km: item.affected_radius_km || 0.5,
                                estimated_population: item.estimated_population || 0,
                                peak_impact_eta: item.peak_impact_eta || "NOW",
                                status: item.status.toUpperCase(),
                                risk_factors: item.risk_factors,
                                created_at: item.created_at,
                            }];
                    case 2:
                        err_2 = _a.sent();
                        console.log("\uD83D\uDEE1\uFE0F [API FALLBACK] getIncident(".concat(id, ") -> Serving from cache."));
                        return [2 /*return*/, MOCK_INCIDENTS.find(function (inc) { return inc.id === id; }) || MOCK_INCIDENTS[0]];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    reportFlood: function (lat_1, lng_1) {
        return __awaiter(this, arguments, void 0, function (lat, lng, source) {
            var response, err_3;
            if (source === void 0) { source = "user_gps"; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, makeRequest("/api/v1/signals/", {
                                method: "POST",
                                body: JSON.stringify({
                                    source: source,
                                    lat: lat,
                                    lng: lng,
                                    type: "flood",
                                    raw_payload: {
                                        lat: lat,
                                        lng: lng,
                                        type: "flood",
                                        source: source,
                                    },
                                }),
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, !!response];
                    case 2:
                        err_3 = _a.sent();
                        console.log("\uD83D\uDEE1\uFE0F [API FALLBACK] reportFlood() -> Simulated successfully offline with source: ".concat(source, "."));
                        return [2 /*return*/, true];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Start actions lifecycle simulation loop.
     */
    triggerSimulation: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var response, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, makeRequest("/api/v1/simulation/trigger/".concat(id), {
                                method: "POST",
                            })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response && response.status === "success"];
                    case 2:
                        err_4 = _a.sent();
                        console.log("\uD83D\uDEE1\uFE0F [API FALLBACK] triggerSimulation(".concat(id, ") -> Offline execution simulation."));
                        return [2 /*return*/, true];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetch current simulation state / actions for an incident.
     */
    getSimulationState: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var data, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, makeRequest("/api/v1/simulation/state/".concat(id))];
                    case 1:
                        data = _a.sent();
                        if (data && data.length > 0) {
                            return [2 /*return*/, data.map(function (item) { return ({
                                    id: String(item.id),
                                    incident_id: id,
                                    type: item.type,
                                    status: item.status.toUpperCase(),
                                    predicted_side_effects: item.predicted_side_effects,
                                    metadata: item.metadata,
                                    updated_at: item.updated_at,
                                }); })];
                        }
                        console.log("\uD83D\uDEE1\uFE0F [API FALLBACK] 0 actions returned from DB for incident ".concat(id, " -> Serving fallback execution list."));
                        return [2 /*return*/, MOCK_ACTIONS[id] || this.getMockSimulationState(id)];
                    case 2:
                        err_5 = _a.sent();
                        console.log("\uD83D\uDEE1\uFE0F [API FALLBACK] getSimulationState(".concat(id, ") failed -> Serving offline execution list."));
                        return [2 /*return*/, MOCK_ACTIONS[id] || this.getMockSimulationState(id)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get basic fallback timeline states.
     */
    getMockSimulationState: function (incidentId) {
        var timestamp = now();
        return [
            { id: "a1", incident_id: incidentId, type: "DISPATCH_RESCUE", status: "PENDING", predicted_side_effects: "Mobilises local relief teams.", updated_at: timestamp },
            { id: "a2", incident_id: incidentId, type: "DEPLOY_DRAINAGE_CREW", status: "PENDING", predicted_side_effects: "Starts structural dewatering.", updated_at: timestamp },
            { id: "a3", incident_id: incidentId, type: "ALERT_CITIZENS", status: "PENDING", predicted_side_effects: "Disseminates emergency guidance.", updated_at: timestamp },
        ];
    },
    /**
     * Fetch reasoning traces for an incident.
     * Leverages the newly deployed DB endpoint before subscribing to websocket.
     */
    getReasoningLogs: function (incidentId) {
        return __awaiter(this, void 0, void 0, function () {
            var data, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, makeRequest("/api/v1/incidents/".concat(incidentId, "/logs"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (item) { return ({
                                id: String(item.id),
                                incident_id: String(item.incident_id),
                                agent_name: item.agent_name,
                                log_text: item.log_text,
                                log_level: item.log_level || "INFO",
                                created_at: item.created_at,
                            }); })];
                    case 2:
                        err_6 = _a.sent();
                        console.log("\uD83D\uDEE1\uFE0F [API FALLBACK] getReasoningLogs(".concat(incidentId, ") -> Serving mock narrative logs."));
                        return [2 /*return*/, MOCK_REASONING_LOGS[incidentId] || []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Fetch detailed step-by-step Chain of Thought (CoT) logs for an incident.
     */
    getChainOfThought: function (incidentId) {
        return __awaiter(this, void 0, void 0, function () {
            var data, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, makeRequest("/api/v1/incidents/".concat(incidentId, "/cot"))];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, data.map(function (item) { return ({
                                id: String(item.id),
                                incident_id: String(item.incident_id),
                                agent_name: item.agent_name,
                                cot_steps: item.cot_steps,
                                created_at: item.created_at,
                            }); })];
                    case 2:
                        err_7 = _a.sent();
                        console.log("\uD83D\uDEE1\uFE0F [API FALLBACK] getChainOfThought(".concat(incidentId, ") -> Serving mock CoT traces."));
                        return [2 /*return*/, MOCK_COT_LOGS[incidentId] || []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
};
