import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true, // Mark this component as standalone
  imports: [FormsModule, RouterModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
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

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (response: { token: string }) => {
        // Store the received token in localStorage
        localStorage.setItem('userToken', response.token);
        console.log(localStorage.getItem('userToken'));

        // Clear error messages
        this.errorMessages = [];

        // Navigate to the home page
        this.router.navigate(['/dashboard']);
      },
      (error: HttpErrorResponse) => {
        console.error('Login error:', error);
        if (error.error?.errors) {
          this.errorMessages = error.error.errors.map((err: any) => ({
            field: err.field || 'general',
            message: err.message || 'An error occurred.',
          }));
        } else {
          this.errorMessages = [{ field: 'general', message: 'Login failed. Please check your credentials.' }];
        }
      }
    );
  }

  closeErrorOverlay() {
    this.errorMessages = [];
  }
}
