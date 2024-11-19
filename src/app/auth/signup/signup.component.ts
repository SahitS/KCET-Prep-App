import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true, 
  imports: [FormsModule], 
  providers: [AuthService],
  templateUrl: './signup.component.html'
})
export class SignupComponent {
  username = '';
  password = '';

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
