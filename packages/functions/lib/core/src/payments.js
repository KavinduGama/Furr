"use strict";
// ─────────────────────────────────────────────────────────────
//  @furr/core — Payment Gateway & Subscription Billing Domain
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = formatCurrency;
exports.calculatePlatformCommission = calculatePlatformCommission;
exports.calculateProviderEarnings = calculateProviderEarnings;
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
function calculateProviderEarnings(servicesGross, productsGross, tipsGross = 0, serviceCommissionRate = 10, productCommissionRate = 8) {
    const serviceFee = Math.round((servicesGross * serviceCommissionRate) / 100);
    const productFee = Math.round((productsGross * productCommissionRate) / 100);
    const totalFees = serviceFee + productFee;
    const netPayout = (servicesGross - serviceFee) + (productsGross - productFee) + tipsGross;
    return {
        serviceRevenue: servicesGross,
        productRevenue: productsGross,
        tipsReceived: tipsGross,
        platformFees: totalFees,
        netPayout,
    };
}
//# sourceMappingURL=payments.js.map