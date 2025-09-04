import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { CommonModule, DatePipe, JsonPipe, NgClass } from '@angular/common';
import { StateService } from '../../shared/services/state';
import { FrontendResponse } from '../../shared/models/frontend';

@Component({
  selector: 'app-frontend',
  standalone: true,
  imports: [CommonModule, DatePipe, JsonPipe, NgClass],
  templateUrl: './frontend.html',
  styleUrl: './frontend.scss',
})
export class Frontend {
  private stateService = inject(StateService);

  url = signal<string>('https://dev.mgrant.in');
  showJson = signal(false);

  dataResource = httpResource<FrontendResponse>(
    () => `${this.url()}/assets/git-info.json`
  );

  data = computed(() => this.dataResource.value());
  status = computed(() => this.data() ? 'HEALTHY' : 'UNKNOWN');
  
  // Get the current environment's frontend URL
  getFrontendUrl = computed(() => {
    const env = this.stateService.selectedEnvironment();
    if (!env) return 'https://dev.mgrant.in';
    
    const frontendUrls: Record<string, string> = {
      'Staging': 'https://dev.mgrant.in',
      'Production': 'https://portal.mgrant.in', 
      'UAT': 'https://uat.mgrant.in',
      'QA': 'https://qa.mgrant.in',
      'ICICI UAT': 'https://uaticici.mgrant.in',
      'Sattva UAT': 'https://uatsattva.mgrant.in',
      'ICICI PROD': 'https://icici.mgrant.in',
      'Sattva PROD': 'https://sattva.mgrant.in',
      'TRIF PROD': 'https://trifmgrant.dhwaniris.com'
    };
    
    return frontendUrls[env.title] || 'https://dev.mgrant.in';
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
      this.url.set(this.getFrontendUrl());
    });
  }

  short = (hash: string | undefined) => hash?.slice(0, 12) || '';
}