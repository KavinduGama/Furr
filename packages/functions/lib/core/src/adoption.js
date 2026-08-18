"use strict";
// ─────────────────────────────────────────────────────────────
//  @furr/core — Adoption Platform & Rescue Network Types
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdoptionApplication = validateAdoptionApplication;
/**
 * Basic application validator to ensure applicant meets minimum contact & safety criteria.
 */
function validateAdoptionApplication(app) {
    const errors = [];
    if (!app.applicantName?.trim())
        errors.push('Applicant name is required');
    if (!app.applicantPhone?.trim())
        errors.push('Contact phone number is required');
    if (!app.applicantDistrict?.trim())
        errors.push('District is required');
    if (!app.housingType)
        errors.push('Housing type must be selected');
    if (app.dailyHoursAlone === undefined || app.dailyHoursAlone < 0 || app.dailyHoursAlone > 24) {
        errors.push('Valid daily hours alone must be specified (0-24)');
    }
    if (!app.reasonForAdopting?.trim() || app.reasonForAdopting.length < 10) {
        errors.push('Please provide a brief reason for adopting (at least 10 characters)');
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
//# sourceMappingURL=adoption.js.map