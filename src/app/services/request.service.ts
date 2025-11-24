import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, merge, of, switchMap, timer } from 'rxjs';

export interface MockResponse {
  id: number;
  message: string;
  url: string;
  issuedAt: number;
}

export type RequestStatus = 'pending' | 'success' | 'error';

export interface RequestOutcome {
  id: number;
  status: RequestStatus;
  payload?: MockResponse;
  error?: HttpErrorResponse;
}

/**
 * Emits a burst of mock HTTP requests to exercise the interceptor.
 */
@Injectable({ providedIn: 'root' })
export class RequestService {
  constructor(private readonly http: HttpClient) {}

  fireMockRequests(count: number): Observable<RequestOutcome> {
    const requests: Observable<RequestOutcome>[] = Array.from({ length: count }, (_, index): Observable<RequestOutcome> =>
      timer(150 + Math.random() * 500).pipe(
        switchMap(() => this.http.get<MockResponse>(`/api/mock/resource-${index + 1}`)),
        map(
          (payload) =>
            ({
              id: index + 1,
              status: 'success',
              payload
            } satisfies RequestOutcome)
        ),
        catchError((error: HttpErrorResponse) =>
          of<RequestOutcome>({ id: index + 1, status: 'error', error })
        )
      )
    );

    return merge(...requests);
  }
}
