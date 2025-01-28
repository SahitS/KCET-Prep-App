import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true, 
  imports: [FormsModule, RouterModule, CommonModule], 
  providers: [AuthService],
  templateUrl: './signup.component.html',
  styleUrl:'./signup.component.scss'
})
export class SignupComponent {
  username = '';
  password = '';
  errorMessages: { field: string; message: string }[] = [];

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
        this.errorMessages = [];
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Signup error:', error);
  
        if (error.error?.errors && Array.isArray(error.error.errors)) {
          this.errorMessages = error.error.errors.map((err: any) => ({
            field: err.field || 'general',
            message: err.message || 'An unknown error occurred.',
          }));
        } else if (typeof error.error === 'string') {
          // Handle string errors from backend
          this.errorMessages = [{ field: 'general', message: error.error }];
        } else {
          // Fallback for unknown error formats
          this.errorMessages = [{ field: 'general', message: 'An unexpected error occurred.' }];
        }
      }
    );
  }
  
  

  closeErrorOverlay() {
    this.errorMessages = [];
  }
}
