"use strict";
// ─────────────────────────────────────────────────────────────
//  @furr/core — Payment Gateway & Subscription Billing Domain
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.calculatePlatformCommission = calculatePlatformCommission;
function formatCurrency(amount, currency = 'LKR') {
    if (currency === 'USD') {
        return `$${amount.toFixed(2)}`;
    }
    return `LKR ${amount.toLocaleString()}`;
}
function calculatePlatformCommission(amount, takeRatePercent = 10) {
    const platformFee = Math.round((amount * takeRatePercent) / 100);
    const providerPayout = amount - platformFee;
    return { platformFee, providerPayout };
}
//# sourceMappingURL=payments.js.map