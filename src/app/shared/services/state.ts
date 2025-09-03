import { Injectable, signal } from '@angular/core';
import { Environment } from '../config/environments';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public selectedEnvironment = signal<Environment | null>(null);
}
