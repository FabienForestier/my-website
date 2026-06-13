import { Service, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ContentData } from '../models/content.types';

@Service()
export class ContentService {
  private readonly http = inject(HttpClient);

  readonly data = signal<ContentData | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.http.get<ContentData>('assets/content.json').subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err));
        this.loading.set(false);
      },
    });
  }
}
