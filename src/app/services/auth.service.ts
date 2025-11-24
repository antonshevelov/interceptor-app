import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, of, tap } from 'rxjs';

/**
 * Mock auth service that simulates fetching a token from a backend with a delay.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  private acceptedToken: string | null = null;

  readonly token$: Observable<string | null> = this.tokenSubject.asObservable();

  get tokenSnapshot(): string | null {
    return this.tokenSubject.getValue();
  }

  get acceptedTokenSnapshot(): string | null {
    return this.acceptedToken;
  }

  fetchToken(): Observable<string> {
    const generatedToken = this.createRandomToken();
    if (!this.acceptedToken) {
      this.acceptedToken = generatedToken;
    }

    const latency = 400 + Math.random() * 600; // 400-1000ms jitter
    return of(generatedToken).pipe(delay(latency), tap((token) => this.tokenSubject.next(token)));
  }

  setToken(token: string | null): void {
    this.tokenSubject.next(token);
  }

  resetAuthState(): void {
    this.acceptedToken = null;
    this.tokenSubject.next(null);
  }

  private createRandomToken(): string {
    return Math.random().toString(36).slice(2, 10);
  }
}
