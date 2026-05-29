import { BloodType } from './blood-inventory.model';

export interface BloodRequest {
  id: number;
  requesterId: number;
  requesterName: string;
  requesterType: string;
  bloodType: BloodType;
  units: number;
  urgency: UrgencyLevel;
  status: RequestStatus;
  reason: string;
  patientName?: string;
  contactPhone?: string;
  requestDate: string;
  requiredByDate: string;
  approvedDate?: string;
  approvedById?: number;
  notes?: string;
}

export enum UrgencyLevel {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
}

export interface CreateBloodRequest {
  bloodType: BloodType;
  units: number;
  urgency: UrgencyLevel;
  reason: string;
  patientName?: string;
  contactPhone?: string;
  requiredByDate: string;
  notes?: string;
}
