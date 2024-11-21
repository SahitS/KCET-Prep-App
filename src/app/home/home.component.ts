import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [RouterModule], 
  providers: [AuthService],
  templateUrl: './home.component.html',
  styleUrl:'./home.component.scss'
})
export class HomeComponent {
  constructor(private authService: AuthService, private router: Router) {}

  login(){
    this.router.navigate(['/login']);
  }
  
  signup(){
    this.router.navigate(['/signup']);
  }
}
