import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../../shared/services/state';
import { ENVIRONMENTS } from '../../shared/config/environments';
import { Admin } from '../admin/admin';
import { Alerts } from '../alerts/alerts';
import { BulkUpload } from '../bulk-upload/bulk-upload';
import { DataVisualization } from '../data-visualization/data-visualization';
import { Frontend } from "../frontend/frontend";


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Admin, Alerts, BulkUpload, DataVisualization, Frontend],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private stateService = inject(StateService);
  environments = ENVIRONMENTS;
  selectedEnvironment = signal<string | null>(null);

  constructor() {
    // Initialize with the current selected environment from state service
    const currentEnv = this.stateService.selectedEnvironment();
    if (currentEnv) {
      this.selectedEnvironment.set(currentEnv.title);
    } else {
      this.selectedEnvironment.set(this.environments[0].title);
      this.stateService.selectedEnvironment.set(this.environments[0]);
    }
  }

  setEnvironment(environment: any) {
    this.stateService.selectedEnvironment.set(environment);
    this.selectedEnvironment.set(environment.title);
  }

  getCurrentEnvironment() {
    return this.stateService.selectedEnvironment();
  }

  onEnvironmentChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    const selectedTitle = target.value;
    const environment = this.environments.find(env => env.title === selectedTitle);
    if (environment) {
      this.setEnvironment(environment);
    }
  }
}
