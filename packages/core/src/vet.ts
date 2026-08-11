export type ProfessionalStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';

export type ProfessionalProfile = {
  uid: string;
  fullName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  district: string;
  clinicId?: string;
  status: ProfessionalStatus;
  createdAt: string;
  updatedAt: string;
};
