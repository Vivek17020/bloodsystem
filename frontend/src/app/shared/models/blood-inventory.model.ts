export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

export interface BloodInventory {
  id: number;
  bloodType: BloodType;
  units: number;
  collectionDate: string;
  expiryDate: string;
  status: InventoryStatus;
  bloodBankId: number;
  bloodBankName: string;
  donorId?: number;
  notes?: string;
}

export enum InventoryStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  EXPIRED = 'EXPIRED',
  USED = 'USED',
  DISCARDED = 'DISCARDED',
}

export interface InventoryFilter {
  bloodType?: BloodType;
  status?: InventoryStatus;
  bloodBankId?: number;
  fromDate?: string;
  toDate?: string;
}

export interface BloodStockSummary {
  bloodType: BloodType;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
  expiringUnits: number;
}
