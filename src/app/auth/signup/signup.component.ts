import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true, 
  imports: [FormsModule, RouterModule], 
  providers: [AuthService],
  templateUrl: './signup.component.html',
  styleUrl:'./signup.component.scss'
})
export class SignupComponent {
  username = '';
  password = '';

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'theme' && event.newValue) {
      this.currentTheme = event.newValue;
    }
  };
  currentTheme: string | undefined;

  ngOnInit() {
    // Load initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    this.currentTheme = savedTheme;

    // Add listener for theme changes
    window.addEventListener('storage', this.handleStorageEvent);
  }

  constructor(private authService: AuthService, private router: Router) {}

  onSignup() {
    this.authService.signup(this.username, this.password).subscribe(
      () => {
        alert('Signup successful! Please log in.');
        this.router.navigate(['/login']); // Navigate back to login page after signup
      },
      (error) => {
        alert('Signup failed. Please try again.');
      }
    );
  }
}
