import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Commits } from './components/commits/commits';

export const routes: Routes = [
  { path: '', redirectTo: '/commits', pathMatch: 'full' },
  { path: 'commits', component: Commits },
  { path: 'dashboard', component: Dashboard },
  { path: '**', redirectTo: '/commits' }
];
