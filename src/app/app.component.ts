import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true, // Mark this component as standalone
  imports: [RouterModule], // Import RouterModule for routing support
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'KCETPrepApp';

  constructor(private router: Router) {}

  onLogout() {
    // Clear any authentication tokens or user data
    localStorage.removeItem('userToken');
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }

}
