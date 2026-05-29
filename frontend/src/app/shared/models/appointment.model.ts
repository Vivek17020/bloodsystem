export interface Appointment {
  id: number;
  donorId: number;
  donorName: string;
  bloodBankId: number;
  bloodBankName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface CreateAppointment {
  bloodBankId: number;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
}
