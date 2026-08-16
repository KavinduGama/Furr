"use strict";
// ─────────────────────────────────────────────────────────────
//  @furr/core — domain types, validation, and provenance rules
// ─────────────────────────────────────────────────────────────
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoRecords = exports.demoPets = exports.roles = exports.SHARE_CATEGORIES = exports.DOC_TYPE_LABELS = exports.DOC_TYPES = exports.buildTimeline = exports.VACCINE_TYPES = void 0;
exports.normalisePhone = normalisePhone;
exports.isValidE164 = isValidE164;
exports.formatPhoneDisplay = formatPhoneDisplay;
var health_1 = require("./health");
Object.defineProperty(exports, "VACCINE_TYPES", { enumerable: true, get: function () { return health_1.VACCINE_TYPES; } });
Object.defineProperty(exports, "buildTimeline", { enumerable: true, get: function () { return health_1.buildTimeline; } });
Object.defineProperty(exports, "DOC_TYPES", { enumerable: true, get: function () { return health_1.DOC_TYPES; } });
Object.defineProperty(exports, "DOC_TYPE_LABELS", { enumerable: true, get: function () { return health_1.DOC_TYPE_LABELS; } });
var sharing_1 = require("./sharing");
Object.defineProperty(exports, "SHARE_CATEGORIES", { enumerable: true, get: function () { return sharing_1.SHARE_CATEGORIES; } });
exports.roles = {
    owner: 'Pet owner',
    professional: 'Veterinary professional',
    clinic_operator: 'Clinic operator',
    admin: 'Furr administrator',
};
// ── Phone normalisation ───────────────────────────────────────
/**
 * Normalise a raw phone input to E.164.
 * Handles Sri Lankan numbers: strips spaces, dashes, and parentheses.
 * If the number starts with 0 (local format), replaces with +94.
 *
 * Returns null if the result is not a plausibly valid E.164 string.
 */
function normalisePhone(raw, defaultCountryCode = '94') {
    // Strip all whitespace, dashes, dots, parentheses
    const stripped = raw.replace(/[\s\-().]/g, '');
    let e164;
    if (stripped.startsWith('+')) {
        e164 = stripped;
    }
    else if (stripped.startsWith('00')) {
        e164 = '+' + stripped.slice(2);
    }
    else if (stripped.startsWith('0')) {
        // Local format — prepend country code
        e164 = '+' + defaultCountryCode + stripped.slice(1);
    }
    else if (/^\d{7,15}$/.test(stripped)) {
        e164 = '+' + defaultCountryCode + stripped;
    }
    else {
        return null;
    }
    // Basic E.164 sanity: + followed by 7–15 digits
    if (/^\+\d{7,15}$/.test(e164))
        return e164;
    return null;
}
/**
 * Returns true if the string looks like a valid E.164 phone number.
 */
function isValidE164(phone) {
    return /^\+\d{7,15}$/.test(phone);
}
/**
 * Format E.164 for display e.g. "+94771234567" → "+94 77 123 4567"
 * Simple Sri Lankan formatting — extend for other locales later.
 */
function formatPhoneDisplay(e164) {
    // Sri Lankan mobile: +94 XX XXX XXXX
    const lk = e164.match(/^\+94(\d{2})(\d{3})(\d{4})$/);
    if (lk)
        return `+94 ${lk[1]} ${lk[2]} ${lk[3]}`;
    return e164;
}
// ── Demo data (dev/prototype only) ───────────────────────────
exports.demoPets = [
    {
        id: 'max',
        ownerUid: 'demo-uid',
        name: 'Max',
        species: 'dog',
        sex: 'male',
        breed: 'Golden Retriever',
        birthDate: '2024-02-10',
        status: 'active',
        avatarLabel: 'M',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
    },
    {
        id: 'luna',
        ownerUid: 'demo-uid',
        name: 'Luna',
        species: 'cat',
        sex: 'female',
        breed: 'Domestic Shorthair',
        birthDate: '2023-06-04',
        status: 'active',
        avatarLabel: 'L',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
    },
];
exports.demoRecords = [
    {
        id: 'record-1',
        petId: 'max',
        ownerUid: 'demo-uid',
        category: 'vaccination',
        title: 'Rabies vaccination',
        occurredAt: '2026-08-03',
        provenance: 'VET_VERIFIED',
        createdByUid: 'demo-uid',
        isArchived: false,
        createdAt: '2026-08-03T10:00:00Z',
        updatedAt: '2026-08-03T10:00:00Z',
    },
    {
        id: 'record-2',
        petId: 'max',
        ownerUid: 'demo-uid',
        category: 'medication',
        title: 'Omega-3 supplement',
        occurredAt: '2026-08-10',
        provenance: 'OWNER_ENTERED',
        createdByUid: 'demo-uid',
        isArchived: false,
        createdAt: '2026-08-10T08:00:00Z',
        updatedAt: '2026-08-10T08:00:00Z',
    },
    {
        id: 'record-3',
        petId: 'luna',
        ownerUid: 'demo-uid',
        category: 'weight',
        title: 'Weight logged: 4.8 kg',
        occurredAt: '2026-08-07',
        provenance: 'OWNER_ENTERED',
        createdByUid: 'demo-uid',
        isArchived: false,
        createdAt: '2026-08-07T09:00:00Z',
        updatedAt: '2026-08-07T09:00:00Z',
    },
];
__exportStar(require("./vet"), exports);
__exportStar(require("./marketplace"), exports);
__exportStar(require("./services"), exports);
__exportStar(require("./telemedicine"), exports);
__exportStar(require("./community"), exports);
__exportStar(require("./care"), exports);
__exportStar(require("./lostfound"), exports);
__exportStar(require("./family"), exports);
__exportStar(require("./routines"), exports);
__exportStar(require("./expenses"), exports);
//# sourceMappingURL=index.js.map