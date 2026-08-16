'use client';

import { useState, useEffect } from 'react';
import type { 
  ShareCategory, 
  VaccinationRecord, 
  MedicationPlan, 
  WeightEntry, 
  HealthObservation, 
  PetDocument 
} from '@furr/core';
import { buildTimeline } from '@furr/core';
import { 
  subscribeToVaccinations,
  subscribeToMedications,
  subscribeToWeightEntries,
  subscribeToObservations,
  subscribeToDocuments
} from '@furr/firebase';

interface HealthDataViewerProps {
  ownerUid: string;
  petId: string;
  categories: ShareCategory[];
}

export function HealthDataViewer({ ownerUid, petId, categories }: HealthDataViewerProps) {
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [medications, setMedications] = useState<MedicationPlan[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [observations, setObservations] = useState<HealthObservation[]>([]);
  const [documents, setDocuments] = useState<PetDocument[]>([]);

  const hasCat = (c: ShareCategory) => categories.includes(c);
  const showTimeline = hasCat('timeline');
  const showVacs = hasCat('vaccinations');
  const showMeds = hasCat('medications');
  const showWeights = hasCat('weight');
  const showDocs = hasCat('documents');

  useEffect(() => {
    const unsubs: (() => void)[] = [];

    if (showTimeline || showVacs) unsubs.push(subscribeToVaccinations(ownerUid, petId, setVaccinations));
    if (showTimeline || showMeds) unsubs.push(subscribeToMedications(ownerUid, petId, setMedications));
    if (showTimeline || showWeights) unsubs.push(subscribeToWeightEntries(ownerUid, petId, setWeights));
    if (showTimeline) unsubs.push(subscribeToObservations(ownerUid, petId, setObservations));
    if (showTimeline || showDocs) unsubs.push(subscribeToDocuments(ownerUid, petId, setDocuments));

    return () => unsubs.forEach(fn => fn());
  }, [ownerUid, petId, showTimeline, showVacs, showMeds, showWeights, showDocs]);

  const timelineItems = showTimeline ? buildTimeline(vaccinations, medications, weights, observations, documents) : [];

  return (
    <div className="space-y-6 mt-8">
      {showTimeline && (
        <section className="panel records-panel">
          <p className="eyebrow">CHRONOLOGICAL</p>
          <h2>Health Timeline</h2>
          {timelineItems.length === 0 ? (
            <div className="empty-state">
              <p>No health events recorded yet.</p>
            </div>
          ) : (
            <ul className="record-list">
              {timelineItems.map((item, idx) => (
                <li key={idx} className="record-row flex flex-col md:flex-row gap-4 py-4 border-t border-stone-200">
                  <div className="flex-shrink-0 w-32">
                    <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex-1">
                    <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      item.kind === 'vaccination' ? 'bg-blue-100 text-blue-700' :
                      item.kind === 'medication' ? 'bg-purple-100 text-purple-700' :
                      item.kind === 'weight' ? 'bg-green-100 text-green-700' :
                      item.kind === 'observation' ? 'bg-orange-100 text-orange-700' :
                      'bg-stone-200 text-stone-700'
                    }`}>
                      {item.kind}
                    </span>
                    <h3 className="font-bold text-[#02202B]">
                      {item.kind === 'vaccination' ? (item.record.vaccineType === 'Other' ? item.record.customVaccineName : item.record.vaccineType) :
                       item.kind === 'medication' ? item.plan.medicationName :
                       item.kind === 'weight' ? `Weight: ${item.entry.value}${item.entry.unit}` :
                       item.kind === 'observation' ? item.observation.description :
                       item.document.originalFileName}
                    </h3>
                    <p className="text-sm text-stone-500 mt-1">
                      {item.kind === 'vaccination' && `Next due: ${item.record.nextDueOn || 'Not set'}`}
                      {item.kind === 'medication' && `${item.plan.doseInstruction} - ${item.plan.frequency.kind}`}
                      {item.kind === 'weight' && item.entry.note}
                      {item.kind === 'observation' && `Severity: ${item.observation.severity || 'unknown'}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {showVacs && !showTimeline && (
        <section className="panel records-panel">
          <p className="eyebrow">PREVENTION</p>
          <h2>Vaccinations</h2>
          {vaccinations.length === 0 ? <p className="text-sm text-stone-500 mt-2">No vaccinations shared.</p> : (
            <ul className="record-list mt-4">
              {vaccinations.map(v => (
                <li key={v.id} className="record-row">
                  <div className="record-copy">
                    <strong className="text-[#02202B]">{v.vaccineType === 'Other' ? v.customVaccineName : v.vaccineType}</strong>
                    <span>Administered: {new Date(v.administeredOn).toLocaleDateString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {showMeds && !showTimeline && (
        <section className="panel records-panel">
          <p className="eyebrow">TREATMENT</p>
          <h2>Medications</h2>
          {medications.length === 0 ? <p className="text-sm text-stone-500 mt-2">No active medications shared.</p> : (
             <ul className="record-list mt-4">
               {medications.map(m => (
                 <li key={m.id} className="record-row">
                   <div className="record-copy">
                     <strong className="text-[#02202B]">{m.medicationName}</strong>
                     <span>{m.doseInstruction} - {m.frequency.kind}</span>
                   </div>
                 </li>
               ))}
             </ul>
          )}
        </section>
      )}

      {showWeights && !showTimeline && (
        <section className="panel records-panel">
          <p className="eyebrow">METRICS</p>
          <h2>Weight History</h2>
          {weights.length === 0 ? <p className="text-sm text-stone-500 mt-2">No weight entries shared.</p> : (
             <ul className="record-list mt-4">
               {weights.map(w => (
                 <li key={w.id} className="record-row">
                   <div className="record-copy">
                     <strong className="text-[#02202B]">{w.value} {w.unit}</strong>
                     <span>{new Date(w.measuredOn).toLocaleDateString()}</span>
                   </div>
                 </li>
               ))}
             </ul>
          )}
        </section>
      )}

      {showDocs && !showTimeline && (
        <section className="panel records-panel">
          <p className="eyebrow">FILES</p>
          <h2>Documents</h2>
          {documents.length === 0 ? <p className="text-sm text-stone-500 mt-2">No documents shared.</p> : (
             <ul className="record-list mt-4">
               {documents.map(d => (
                 <li key={d.id} className="record-row">
                   <div className="record-copy">
                     <strong className="text-[#02202B]">{d.originalFileName}</strong>
                     <span>Type: {d.docType}</span>
                   </div>
                 </li>
               ))}
             </ul>
          )}
        </section>
      )}
    </div>
  );
}
