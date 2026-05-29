export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  SUCCESS = 'SUCCESS',
  EXPIRY_ALERT = 'EXPIRY_ALERT',
  LOW_STOCK = 'LOW_STOCK',
  REQUEST_APPROVED = 'REQUEST_APPROVED',
  REQUEST_REJECTED = 'REQUEST_REJECTED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
}
