import { Service, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import type { Resume } from '../models/resume-content';

@Service()
export class ContentService {
  private readonly http = inject(HttpClient);

  readonly content = rxResource({
    loader: () => this.http.get<Resume>('assets/resume-content.json'),
  });
}
