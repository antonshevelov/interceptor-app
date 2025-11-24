import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AuthService } from './services/auth.service';
import { RequestOutcome, RequestService, RequestStatus } from './services/request.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);
  private readonly requestService = inject(RequestService);

  protected readonly isRunning = signal(false);
  protected readonly requests = signal<RequestOutcome[]>([]);
  protected readonly token = toSignal(this.auth.token$, { initialValue: null });
  protected readonly hasValidToken = computed(
    () => !!this.token() && this.token() === this.auth.acceptedTokenSnapshot
  );

  constructor() {}

  protected startBurst(): void {
    this.isRunning.set(true);
    const count = 2 + Math.floor(Math.random() * 4); // 2-5 requests per burst
    this.seedPendingRequests(count);

    this.auth.resetAuthState();

    this.requestService
      .fireMockRequests(count)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (outcome) => {
          this.requests.update((current) =>
            current.map((entry) => (entry.id === outcome.id ? { ...entry, ...outcome } : entry))
          );
        },
        complete: () => this.isRunning.set(false)
      });
  }

  protected trackById(_: number, item: RequestOutcome): number {
    return item.id;
  }

  private seedPendingRequests(count: number): void {
    const placeholders: RequestOutcome[] = Array.from({ length: count }, (_, idx) => ({
      id: idx + 1,
      status: 'pending' as RequestStatus
    }));
    this.requests.set(placeholders);
  }
}
