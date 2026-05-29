import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let message = 'An unexpected error occurred.';

        if (error.status === 401) {
          this.authService.logout();
          message = 'Session expired. Please log in again.';
        } else if (error.status === 403) {
          message = 'You are not authorized to perform this action.';
          this.router.navigate([this.authService.getDashboardRoute()]);
        } else if (error.status === 404) {
          message = 'Resource not found.';
        } else if (error.status === 0) {
          message = 'Cannot connect to server. Check your connection.';
        } else if (error.error?.message) {
          message = error.error.message;
        }

        this.snackBar.open(message, 'Close', {
          duration: 5000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snack-error'],
        });

        return throwError(() => error);
      })
    );
  }
}
