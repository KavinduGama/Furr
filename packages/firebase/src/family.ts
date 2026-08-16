// ─────────────────────────────────────────────────────────────
//  @furr/firebase — Family Sharing, Insurance & Budget helpers
// ─────────────────────────────────────────────────────────────

import type { FamilyMember, InsurancePolicy, InsuranceClaim } from '@furr/core';

export const INITIAL_FAMILY_MEMBERS: FamilyMember[] = [
  {
    id: 'fam-1',
    petId: 'max',
    ownerUid: 'demo-uid',
    memberName: 'Kavindu Deshappriya',
    memberEmail: 'kavindu@kayaintel.com',
    memberPhone: '+94 77 123 4567',
    role: 'owner',
    permissions: {
      canEditHealth: true,
      canLogCare: true,
      canBookServices: true,
      canViewExpenses: true,
      canManageMembers: true,
    },
    joinedAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: 'fam-2',
    petId: 'max',
    ownerUid: 'demo-uid',
    memberName: 'Nadeesha Senanayake',
    memberEmail: 'nadeesha@example.com',
    memberPhone: '+94 77 987 6543',
    role: 'coparent',
    permissions: {
      canEditHealth: true,
      canLogCare: true,
      canBookServices: true,
      canViewExpenses: true,
      canManageMembers: false,
    },
    joinedAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
  },
];

export const INITIAL_INSURANCE_POLICIES: InsurancePolicy[] = [
  {
    id: 'policy-1',
    petId: 'max',
    providerName: 'Ceylinco PetCare Protect',
    policyNumber: 'CP-PET-2026-8941',
    coverageType: 'comprehensive',
    annualLimitLkr: 250000,
    deductibleLkr: 5000,
    monthlyPremiumLkr: 3200,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    emergencyHelpline: '+94 11 249 0900',
    coveredCategories: ['Accidents', 'Illnesses', 'Surgeries', 'Hospitalization', 'Prescription Meds'],
  },
];

export const INITIAL_CLAIMS: InsuranceClaim[] = [
  {
    id: 'claim-1',
    policyId: 'policy-1',
    petId: 'max',
    claimDate: new Date(Date.now() - 3600000 * 24 * 5).toISOString().slice(0, 10),
    incidentDescription: 'Front paw sprain consultation and anti-inflammatory medication.',
    claimAmountLkr: 8500,
    receiptUrls: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'],
    status: 'submitted',
    submittedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
  },
];

export function subscribeToFamilyMembers(
  petId: string,
  onUpdate: (members: FamilyMember[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'family_members'),
        where('petId', '==', petId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_FAMILY_MEMBERS);
            return;
          }
          const list: FamilyMember[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as FamilyMember);
          });
          onUpdate(list);
        },
        () => onUpdate(INITIAL_FAMILY_MEMBERS)
      );
      if (!active && unsubscribe) unsubscribe();
    } catch {
      onUpdate(INITIAL_FAMILY_MEMBERS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export function subscribeToInsurance(
  petId: string,
  onUpdate: (policies: InsurancePolicy[], claims: InsuranceClaim[]) => void
) {
  let unsubscribe: (() => void) | undefined;
  let active = true;

  void (async () => {
    try {
      const { getFirestore, collection, query, where, onSnapshot } = await import('firebase/firestore');
      const db = getFirestore();
      const q = query(
        collection(db, 'insurance_policies'),
        where('petId', '==', petId)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            onUpdate(INITIAL_INSURANCE_POLICIES, INITIAL_CLAIMS);
            return;
          }
          const list: InsurancePolicy[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as InsurancePolicy);
          });
          onUpdate(list, INITIAL_CLAIMS);
        },
        () => onUpdate(INITIAL_INSURANCE_POLICIES, INITIAL_CLAIMS)
      );
      if (!active && unsubscribe) unsubscribe();
    } catch {
      onUpdate(INITIAL_INSURANCE_POLICIES, INITIAL_CLAIMS);
    }
  })();

  return () => {
    active = false;
    if (unsubscribe) unsubscribe();
  };
}

export async function inviteFamilyMember(
  data: Omit<FamilyMember, 'id' | 'joinedAt'>
): Promise<FamilyMember> {
  const member: FamilyMember = {
    ...data,
    id: 'fam-' + Date.now(),
    joinedAt: new Date().toISOString(),
  };
  return member;
}

export async function submitInsuranceClaim(
  data: Omit<InsuranceClaim, 'id' | 'status' | 'submittedAt'>
): Promise<InsuranceClaim> {
  const claim: InsuranceClaim = {
    ...data,
    id: 'claim-' + Date.now(),
    status: 'submitted',
    submittedAt: new Date().toISOString(),
  };
  return claim;
}
