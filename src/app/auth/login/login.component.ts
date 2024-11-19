import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true, // Mark this component as standalone
  imports: [FormsModule], 
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login(this.username, this.password).subscribe(
      (response: { token: string }) => {
        // Store the received token (MongoDB `_id`) in localStorage
        localStorage.setItem('userToken', response.token);
  
        // Navigate to the home page
        this.router.navigate(['/home']);
      },
      (error: HttpErrorResponse) => {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials.');
      }
    );
  } 
}
