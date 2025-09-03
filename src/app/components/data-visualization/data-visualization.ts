// data-visualization.component.ts
import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { CommonModule, DatePipe, JsonPipe, NgClass } from '@angular/common';
import { StateService } from '../../shared/services/state';
import { DataVisualization as DataVisualizationResponse } from '../../shared/models/data-vizualization';

@Component({
  selector: 'app-data-visualization',
  standalone: true,
  imports: [CommonModule, DatePipe, JsonPipe, NgClass],
  templateUrl: './data-visualization.html',
  styleUrl: './data-visualization.scss',
})
export class DataVisualization {
  private stateService = inject(StateService);

  url = signal<string>('https://qaadminapi.mgrant.in');
  showJson = signal(false);

  dataResource = httpResource<DataVisualizationResponse>(
    () => `${this.url()}/data-visualization-service/monitoring-service/healthcheck?detailed=true`
  );

  data = computed(() => this.dataResource.value());
  status = computed(() => this.data()?.status ?? 'UNKNOWN');
  memoryHealth = computed(() => this.data()?.checks.memoryHealthCheck);

  statusClasses = computed(() => {
    switch (this.status()) {
      case 'HEALTHY':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-700';
      case 'DEGRADED':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-400/20 dark:text-amber-700';
      case 'UNHEALTHY':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-400/20 dark:text-rose-700';
      default:
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  });

  dotClasses = computed(() => {
    switch (this.status()) {
      case 'HEALTHY':
        return 'bg-emerald-500';
      case 'DEGRADED':
        return 'bg-amber-500';
      case 'UNHEALTHY':
        return 'bg-rose-500';
      default:
        return 'bg-zinc-400';
    }
  });

  barClasses = computed(() => {
    switch (this.memoryHealth()?.status) {
      case 'HEALTHY':
        return 'bg-emerald-500';
      case 'DEGRADED':
        return 'bg-amber-500';
      case 'UNHEALTHY':
        return 'bg-rose-500';
      default:
        return 'bg-zinc-400';
    }
  });

  constructor() {
    effect(() => {
      this.url.set(this.stateService.selectedEnvironment()?.['url'] ?? '');
    });
  }

  versionEntries = computed(() =>
    Object.entries(this.data()?.version ?? {}).map(([key, value]) => ({
      key,
      value,
    }))
  );

  short = (hash: string) => hash?.slice(0, 12);
}
