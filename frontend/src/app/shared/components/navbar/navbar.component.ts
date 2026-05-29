import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  @Input() currentUser: User | null = null;
  @Input() unreadCount = 0;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logoutEvent = new EventEmitter<void>();

  constructor(private router: Router) {}

  goToNotifications(): void {
    this.router.navigate(['/app/notifications']);
  }

  logout(): void {
    this.logoutEvent.emit();
  }
}
