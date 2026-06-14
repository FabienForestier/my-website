import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import type { Resume } from '../models/resume-content';

@Service()
export class ContentService {
  private readonly http = inject(HttpClient);

  readonly content = rxResource({
    stream: () => this.http.get<Resume>('assets/resume-content.json'),
  });
}
