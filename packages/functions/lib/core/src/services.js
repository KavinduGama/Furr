"use strict";
// ─────────────────────────────────────────────────────────────
//  @furr/core — Services & Booking domain models
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.SRI_LANKA_LOCATIONS = exports.SERVICE_CATEGORIES = void 0;
exports.calculateDistanceKm = calculateDistanceKm;
exports.isProviderAvailable = isProviderAvailable;
exports.SERVICE_CATEGORIES = [
    { id: 'grooming', title: 'Pet Grooming', subtitle: 'Spa, bath, haircut & nails', icon: 'cut' },
    { id: 'boarding', title: 'Pet Boarding', subtitle: 'Overnight hotel & resort', icon: 'home' },
    { id: 'sitting', title: 'Pet Sitting', subtitle: 'In-home visits & care', icon: 'heart' },
    { id: 'walking', title: 'Dog Walking', subtitle: 'Daily walks & exercise', icon: 'walk' },
    { id: 'training', title: 'Training & Behavior', subtitle: 'Obedience & puppy social', icon: 'school' },
    { id: 'transport', title: 'Pet Transport', subtitle: 'Vet visits & pet taxi', icon: 'car' },
];
exports.SRI_LANKA_LOCATIONS = [
    { id: 'colombo', name: 'Colombo', province: 'Western', latitude: 6.9271, longitude: 79.8612 },
    { id: 'gampaha', name: 'Gampaha / Negombo', province: 'Western', latitude: 7.0840, longitude: 79.9943 },
    { id: 'kalutara', name: 'Kalutara / Panadura', province: 'Western', latitude: 6.5854, longitude: 79.9607 },
    { id: 'kandy', name: 'Kandy', province: 'Central', latitude: 7.2906, longitude: 80.6337 },
    { id: 'galle', name: 'Galle', province: 'Southern', latitude: 6.0535, longitude: 80.2210 },
    { id: 'matara', name: 'Matara', province: 'Southern', latitude: 5.9549, longitude: 80.5550 },
    { id: 'kurunegala', name: 'Kurunegala', province: 'North Western', latitude: 7.4863, longitude: 80.3623 },
    { id: 'jaffna', name: 'Jaffna', province: 'Northern', latitude: 9.6615, longitude: 80.0255 },
    { id: 'batticaloa', name: 'Batticaloa', province: 'Eastern', latitude: 7.7310, longitude: 81.6747 },
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
function isProviderAvailable(provider, dateString, _timeSlotString) {
    if (!provider.availableDays || provider.availableDays.length === 0)
        return true;
    const date = new Date(dateString);
    if (isNaN(date.getTime()))
        return true;
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = days[date.getDay()];
    return provider.availableDays.includes(dayName);
}
//# sourceMappingURL=services.js.map