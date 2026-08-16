"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredGrants = exports.onOrderStatusUpdated = exports.onTelehealthMessageSent = exports.onLostPetAlertCreated = void 0;
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}
// ── Event Triggers ────────────────────────────────────────────
var lostPetAmberAlert_1 = require("./triggers/lostPetAmberAlert");
Object.defineProperty(exports, "onLostPetAlertCreated", { enumerable: true, get: function () { return lostPetAmberAlert_1.onLostPetAlertCreated; } });
var telehealthChatNotification_1 = require("./triggers/telehealthChatNotification");
Object.defineProperty(exports, "onTelehealthMessageSent", { enumerable: true, get: function () { return telehealthChatNotification_1.onTelehealthMessageSent; } });
var orderDispatchedNotification_1 = require("./triggers/orderDispatchedNotification");
Object.defineProperty(exports, "onOrderStatusUpdated", { enumerable: true, get: function () { return orderDispatchedNotification_1.onOrderStatusUpdated; } });
// ── Maintenance ───────────────────────────────────────────────
var grantExpiryCleaner_1 = require("./maintenance/grantExpiryCleaner");
Object.defineProperty(exports, "cleanupExpiredGrants", { enumerable: true, get: function () { return grantExpiryCleaner_1.cleanupExpiredGrants; } });
//# sourceMappingURL=index.js.map