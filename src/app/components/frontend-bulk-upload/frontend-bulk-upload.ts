import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { CommonModule, DatePipe, JsonPipe, NgClass } from '@angular/common';
import { StateService } from '../../shared/services/state';
import { ServiceHealth } from '../../shared/models/bulk-upload';

@Component({
  selector: 'app-frontend-bulk-upload',
  standalone: true,
  imports: [CommonModule, DatePipe, JsonPipe, NgClass],
  templateUrl: './frontend-bulk-upload.html',
  styleUrl: './frontend-bulk-upload.scss',
})
export class FrontendBulkUpload {
  private stateService = inject(StateService);

  url = signal<string>('https://devadminapi.mgrant.in/bulk-upload-service');
  showJson = signal(false);

  dataResource = httpResource<ServiceHealth>(
    () => `${this.url()}/assets/git-info.json`
  );

  data = computed(() => this.dataResource.value());
  status = computed(() => this.data()?.status || 'UNKNOWN');
  
  // Get the current environment's frontend bulk upload URL
  getFrontendBulkUploadUrl = computed(() => {
    const env = this.stateService.selectedEnvironment();
    if (!env) return 'https://devadminapi.mgrant.in/bulk-upload-service';
    
    const frontendBulkUploadUrls: Record<string, string> = {
      'Staging': 'https://devadminapi.mgrant.in/bulk-upload-service',
      'QA': 'https://qaadminapi.mgrant.in/bulk-upload-service',
      'UAT': 'https://uatadminapi.mgrant.in/bulk-upload-service',
      'Production': 'https://portaladminapi.mgrant.in/bulk-upload-service',
      'ICICI UAT': 'https://uaticicifadminapi.mgrant.in/bulk-upload-service',
      'Sattva UAT': 'https://uatsattvaadminapi.mgrant.in/bulk-upload-service',
      'ICICI PROD': 'https://icicifadminapi.mgrant.in/bulk-upload-service',
      'Sattva PROD': 'https://sattvaadminapi.mgrant.in/bulk-upload-service',
      'TRIF PROD': 'https://trifmgrantadminapi.dhwaniris.com/bulk-upload-service'
    };
    
    return frontendBulkUploadUrls[env.title] || 'https://devadminapi.mgrant.in/bulk-upload-service';
  });

  statusClasses = computed(() => {
    switch (this.status()) {
      case 'HEALTHY':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-700';
      default:
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  });

  dotClasses = computed(() => {
    switch (this.status()) {
      case 'HEALTHY':
        return 'bg-emerald-500';
      default:
        return 'bg-zinc-400';
    }
  });

  constructor() {
    effect(() => {
      this.url.set(this.getFrontendBulkUploadUrl());
    });
  }

  short = (hash: string | undefined) => hash?.slice(0, 12) || '';
}
