import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, // Mark this component as standalone
  imports: [FormsModule, RouterModule], 
  templateUrl: './login.component.html',
  styleUrl:'./login.component.scss'
})
export class LoginComponent {
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

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (response: { token: string }) => {
        // Store the received token (MongoDB `_id`) in localStorage
        localStorage.setItem('userToken', response.token);
        console.log(localStorage.getItem('userToken'));
  
        // Navigate to the home page
        this.router.navigate(['/dashboard']);
      },
      (error: HttpErrorResponse) => {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
      }
    );
  } 
}
