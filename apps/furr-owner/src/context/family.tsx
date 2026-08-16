import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { FamilyMember, InsurancePolicy, InsuranceClaim } from '@furr/core';
import {
  subscribeToFamilyMembers,
  subscribeToInsurance,
  inviteFamilyMember as firebaseInviteMember,
  submitInsuranceClaim as firebaseSubmitClaim,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_INSURANCE_POLICIES,
  INITIAL_CLAIMS,
} from '@furr/firebase';
import { usePets } from './pets';
import { useAuth } from './auth';

interface FamilyContextType {
  familyMembers: FamilyMember[];
  insurancePolicies: InsurancePolicy[];
  insuranceClaims: InsuranceClaim[];
  inviteMember: (
    data: Omit<FamilyMember, 'id' | 'petId' | 'ownerUid' | 'joinedAt'>
  ) => Promise<FamilyMember | null>;
  fileClaim: (
    data: Omit<InsuranceClaim, 'id' | 'petId' | 'status' | 'submittedAt'>
  ) => Promise<InsuranceClaim | null>;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { selectedPet } = usePets();
  const { firebaseUser } = useAuth();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>(INITIAL_INSURANCE_POLICIES);
  const [insuranceClaims, setInsuranceClaims] = useState<InsuranceClaim[]>(INITIAL_CLAIMS);

  const petId = selectedPet?.id || '';

  useEffect(() => {
    const unsubFam = subscribeToFamilyMembers(petId, (members) => setFamilyMembers(members));
    const unsubIns = subscribeToInsurance(petId, (policies, claims) => {
      setInsurancePolicies(policies);
      setInsuranceClaims(claims);
    });
    return () => {
      unsubFam();
      unsubIns();
    };
  }, [petId]);

  const inviteMember = useCallback(
    async (
      data: Omit<FamilyMember, 'id' | 'petId' | 'ownerUid' | 'joinedAt'>
    ): Promise<FamilyMember | null> => {
      try {
        const ownerUid = firebaseUser?.uid || 'demo-uid';
        const member = await firebaseInviteMember({
          ...data,
          petId,
          ownerUid,
        });
        setFamilyMembers((prev) => [...prev, member]);
        return member;
      } catch (err) {
        console.error('[furr/family] Failed to invite member:', err);
        return null;
      }
    },
    [petId, firebaseUser]
  );

  const fileClaim = useCallback(
    async (
      data: Omit<InsuranceClaim, 'id' | 'petId' | 'status' | 'submittedAt'>
    ): Promise<InsuranceClaim | null> => {
      try {
        const claim = await firebaseSubmitClaim({
          ...data,
          petId,
        });
        setInsuranceClaims((prev) => [claim, ...prev]);
        return claim;
      } catch (err) {
        console.error('[furr/family] Failed to submit claim:', err);
        return null;
      }
    },
    [petId]
  );

  const value = useMemo(
    () => ({
      familyMembers,
      insurancePolicies,
      insuranceClaims,
      inviteMember,
      fileClaim,
    }),
    [
      familyMembers,
      insurancePolicies,
      insuranceClaims,
      inviteMember,
      fileClaim,
    ]
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
