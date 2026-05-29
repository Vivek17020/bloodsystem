import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { Notification, NotificationType } from '../../shared/models/notification.model';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss'],
})
export class NotificationsPageComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.notificationService.getAll().subscribe({
      next: (notifications) => { this.notifications = notifications; this.isLoading = false; },
      error: () => { this.isLoading = false; },
    });
  }

  markRead(id: number): void {
    this.notificationService.markAsRead(id).subscribe(() => {
      const n = this.notifications.find((n) => n.id === id);
      if (n) n.isRead = true;
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => {
      this.notifications.forEach((n) => (n.isRead = true));
      this.notificationService.showToast('All notifications marked as read.', 'success');
    });
  }

  delete(id: number): void {
    this.notificationService.delete(id).subscribe(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    });
  }

  getTypeIcon(type: NotificationType): string {
    const m: Record<string, string> = {
      INFO: 'info', WARNING: 'warning', CRITICAL: 'error', SUCCESS: 'check_circle',
      EXPIRY_ALERT: 'hourglass_empty', LOW_STOCK: 'inventory',
      REQUEST_APPROVED: 'thumb_up', REQUEST_REJECTED: 'thumb_down',
      APPOINTMENT_REMINDER: 'event',
    };
    return m[type] || 'notifications';
  }

  getTypeColor(type: NotificationType): string {
    const m: Record<string, string> = {
      CRITICAL: '#c62828', WARNING: '#f57c00', SUCCESS: '#2e7d32',
      REQUEST_APPROVED: '#2e7d32', REQUEST_REJECTED: '#c62828',
      EXPIRY_ALERT: '#c62828', LOW_STOCK: '#f57c00', INFO: '#0277bd',
      APPOINTMENT_REMINDER: '#0277bd',
    };
    return m[type] || '#0277bd';
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.isRead).length;
  }
}
