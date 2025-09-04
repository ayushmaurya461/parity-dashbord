import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  imports: [NgClass],
})
export class Navbar {
  private router = inject(Router);
  currentRoute = signal<string>('');
  isMobileMenuOpen = signal<boolean>(false);
  isDarkMode = signal<boolean>(false);

  navigationItems = [
    { title: 'Commit Table', route: '/commits', icon: 'fas fa-table' },
    { title: 'Detailed Overview', route: '/dashboard', icon: 'fas fa-chart-line' }
  ];

  constructor() {
    // Set current route based on URL
    this.currentRoute.set(this.router.url);
    
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('parity-dashboard-theme');
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Default to system preference
      this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    this.applyTheme();
  }
  
  navigateTo(route: string) {
    this.router.navigate([route]);
    this.currentRoute.set(route);
    this.closeMobileMenu();
  }

  toggleTheme() {
    this.isDarkMode.set(!this.isDarkMode());
    this.applyTheme();
    localStorage.setItem('parity-dashboard-theme', this.isDarkMode() ? 'dark' : 'light');
  }

  private applyTheme() {
    const root = document.documentElement;
    if (this.isDarkMode()) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
