"use strict";
// ─────────────────────────────────────────────────────────────
//  @furr/core — Vaccination, Medication, Weight domain types
// ─────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOC_TYPE_LABELS = exports.DOC_TYPES = exports.VACCINE_TYPES = void 0;
exports.buildTimeline = buildTimeline;
// ── Vaccination ───────────────────────────────────────────────
/** Standard reference vaccine types shown in the picker. */
exports.VACCINE_TYPES = [
    'Rabies',
    'Canine Distemper (DA2PP)',
    'Bordetella (Kennel Cough)',
    'Canine Influenza',
    'Leptospirosis',
    'Feline Panleukopenia (FVRCP)',
    'Feline Leukemia (FeLV)',
    'Feline Herpesvirus',
    'Feline Calicivirus',
    'Other',
];
// ── Documents ─────────────────────────────────────────────────
exports.DOC_TYPES = [
    'vaccination_card',
    'prescription',
    'lab_report',
    'visit_summary',
    'other',
];
exports.DOC_TYPE_LABELS = {
    vaccination_card: 'Vaccination card',
    prescription: 'Prescription',
    lab_report: 'Lab report',
    visit_summary: 'Visit summary',
    other: 'Other document',
};
/** Merge and sort all health record types into a single timeline array. */
function buildTimeline(vaccinations, medications, weights, observations, documents = []) {
    const safeSlice = (s) => {
        if (!s || s.length < 10)
            return s || '1970-01-01';
        return s.slice(0, 10);
    };
    const items = [
        ...vaccinations.map((r) => ({ kind: 'vaccination', date: r.administeredOn, record: r })),
        ...medications.map((m) => ({ kind: 'medication', date: safeSlice(m.startAt), plan: m })),
        ...weights.map((w) => ({ kind: 'weight', date: w.measuredOn, entry: w })),
        ...observations.map((o) => ({ kind: 'observation', date: o.observedOn, observation: o })),
        ...documents.map((d) => ({ kind: 'document', date: safeSlice(d.createdAt), document: d })),
    ];
    return items.sort((a, b) => b.date.localeCompare(a.date));
}
//# sourceMappingURL=health.js.map