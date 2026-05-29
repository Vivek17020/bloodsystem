import { BloodType } from './blood-inventory.model';

export interface Donor {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bloodType: BloodType;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  weight: number;
  isEligible: boolean;
  lastDonationDate?: string;
  nextEligibleDate?: string;
  totalDonations: number;
  status: DonorStatus;
}

export enum DonorStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DEFERRED = 'DEFERRED',
  BANNED = 'BANNED',
}

export interface DonationHistory {
  id: number;
  donorId: number;
  donationDate: string;
  bloodType: BloodType;
  units: number;
  bloodBankId: number;
  bloodBankName: string;
  status: string;
}
