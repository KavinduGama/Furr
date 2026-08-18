"use strict";
// ─────────────────────────────────────────────────────────────
//  @furr/core — Services & Booking domain models
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_CATEGORIES = void 0;
exports.calculateDistanceKm = calculateDistanceKm;
exports.SERVICE_CATEGORIES = [
    { id: 'grooming', title: 'Pet Grooming', subtitle: 'Spa, bath, haircut & nails', icon: 'cut' },
    { id: 'boarding', title: 'Pet Boarding', subtitle: 'Overnight hotel & resort', icon: 'home' },
    { id: 'sitting', title: 'Pet Sitting', subtitle: 'In-home visits & care', icon: 'heart' },
    { id: 'walking', title: 'Dog Walking', subtitle: 'Daily walks & exercise', icon: 'walk' },
    { id: 'training', title: 'Training & Behavior', subtitle: 'Obedience & puppy social', icon: 'school' },
    { id: 'transport', title: 'Pet Transport', subtitle: 'Vet visits & pet taxi', icon: 'car' },
];
function calculateDistanceKm(pointA, pointB) {
    const R = 6371; // Earth radius in km
    const dLat = ((pointB.latitude - pointA.latitude) * Math.PI) / 180;
    const dLon = ((pointB.longitude - pointA.longitude) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pointA.latitude * Math.PI) / 180) *
            Math.cos((pointB.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
}
//# sourceMappingURL=services.js.map