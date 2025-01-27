import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'KCETPrepApp';
  currentTheme: string = 'dark-theme'; // Default theme

  constructor(private router: Router) {}

  // Logout function
  onLogout() {
    localStorage.removeItem('userToken');
    this.router.navigate(['/home']);
  }

  // Toggle Theme and Dispatch StorageEvent
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('theme', this.currentTheme);
    document.body.className = this.currentTheme;

    // Dispatch StorageEvent manually for real-time updates
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'theme',
        newValue: this.currentTheme,
      })
    );
  }
  // On Init: Load saved theme
  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    this.currentTheme = savedTheme;
    document.body.className = this.currentTheme;
  }
}
