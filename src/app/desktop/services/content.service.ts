import { Service, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import type { ContentData } from '../models/resume-content.types';

@Service()
export class ContentService {
  private readonly http = inject(HttpClient);

  readonly content = rxResource({
    loader: () => this.http.get<ContentData>('assets/resume-content.json'),
  });
}
