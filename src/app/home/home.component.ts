import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  currentTheme: string = 'dark-theme'; // Default theme

  constructor(private router: Router) {}

  // Handle StorageEvent for Real-Time Updates
  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'theme' && event.newValue) {
      this.currentTheme = event.newValue;
      console.log('Real-time theme update in HomeComponent:', this.currentTheme);
    }
  };

  ngOnInit() {
    // Load initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    this.currentTheme = savedTheme;

    // Add listener for theme changes
    window.addEventListener('storage', this.handleStorageEvent);
  }

  login() {
    this.router.navigate(['/login']);
  }

  signup() {
    this.router.navigate(['/signup']);
  }
}
