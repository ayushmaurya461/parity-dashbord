import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from '../services/state';
import { NgClass } from '@angular/common';
import { ENVIRONMENTS } from '../config/environments';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [NgClass],
})
export class Navbar {
  private service = inject(StateService);
  private router = inject(Router);
  selectedEnvironment = signal<string | null>(null);
  environments = ENVIRONMENTS;
  currentRoute = signal<string>('');

  navigationItems = [
    { title: 'Commit Table', route: '/commits' },
    { title: 'Detailed Overview', route: '/dashboard' }
  ];

  constructor() {
    this.service.selectedEnvironment.set(this.environments[0]);
    this.selectedEnvironment.set(this.environments[0].title);
    
    // Set current route based on URL
    this.currentRoute.set(this.router.url);
  }
  
  navigateTo(route: string) {
    this.router.navigate([route]);
    this.currentRoute.set(route);
  }
}
