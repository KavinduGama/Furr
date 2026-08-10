export type AppRole = 'owner' | 'professional' | 'clinic_operator' | 'admin';

export type Pet = {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed?: string;
  birthDate?: string;
  avatarLabel: string;
};

export type HealthRecord = {
  id: string;
  petId: string;
  category: 'vaccination' | 'medication' | 'observation' | 'weight' | 'document';
  title: string;
  occurredAt: string;
  status: 'owner_recorded' | 'professional_verified';
};

export const roles: Record<AppRole, string> = {
  owner: 'Pet owner',
  professional: 'Veterinary professional',
  clinic_operator: 'Clinic operator',
  admin: 'Furr administrator',
};

export const demoPets: Pet[] = [
  { id: 'max', name: 'Max', species: 'dog', breed: 'Golden Retriever', birthDate: '2024-02-10', avatarLabel: 'M' },
  { id: 'luna', name: 'Luna', species: 'cat', breed: 'Domestic Shorthair', birthDate: '2023-06-04', avatarLabel: 'L' },
];

export const demoRecords: HealthRecord[] = [
  { id: 'record-1', petId: 'max', category: 'vaccination', title: 'Rabies vaccination', occurredAt: '2026-08-03', status: 'professional_verified' },
  { id: 'record-2', petId: 'max', category: 'medication', title: 'Omega-3 supplement', occurredAt: '2026-08-10', status: 'owner_recorded' },
  { id: 'record-3', petId: 'luna', category: 'weight', title: 'Weight logged: 4.8 kg', occurredAt: '2026-08-07', status: 'owner_recorded' },
];
