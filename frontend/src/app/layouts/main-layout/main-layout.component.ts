import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isMobile = false;
  currentUser: User | null = null;
  unreadCount = 0;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
    this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadCount = count;
    });
    this.notificationService.startPolling();
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  logout(): void {
    this.authService.logout();
  }
}
