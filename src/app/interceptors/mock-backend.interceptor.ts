import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, mergeMap, of, throwError, timer } from 'rxjs';

import { AuthService } from '../services/auth.service';

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
  constructor(private readonly auth: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.url.startsWith('/api/mock')) {
      return next.handle(request);
    }

    const authHeader = request.headers.get('Authorization');
    const validToken = this.auth.acceptedTokenSnapshot;

    return timer(250 + Math.random() * 200).pipe(
      mergeMap(() => {
        if (!validToken || authHeader !== `Bearer ${validToken}`) {
          return throwError(
            () =>
              new HttpErrorResponse({
                status: 401,
                statusText: 'Unauthorized',
                url: request.url,
                error: { message: 'Missing or invalid auth token' }
              })
          );
        }

        const resourceId = Number(request.url.split('resource-')[1]) || Date.now();
        const body = {
          id: resourceId,
          message: 'Mock backend payload',
          url: request.url,
          issuedAt: Date.now()
        };

        return of(new HttpResponse({ status: 200, body }));
      })
    );
  }
}
