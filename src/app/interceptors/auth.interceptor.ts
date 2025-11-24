import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.tokenSnapshot;

    if (token) {
      return this.handleRequest(request, next, token);
    }

    return throwError(() => new Error('No auth token available'));
  }


  private retrieveAuthorization(): Observable<string> {
    return this.auth.fetchToken();
  }

  private handleRequest(request: HttpRequest<unknown>, next: HttpHandler, token: string) {
    const authorized = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next.handle(authorized);
  }
}
