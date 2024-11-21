import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-show-result',
  standalone: true,
  imports: [],
  templateUrl: './show-result.component.html',
  styleUrl: './show-result.component.scss'
})
export class ShowResultComponent implements OnInit {
  scores = { physics: 0, chemistry: 0, math: 0 };
  totalScore = 0;

  constructor(private authService: AuthService, private router: Router) {}
  

  ngOnInit(): void {
    this.authService.getResults().subscribe({
      next: (data) => {
        this.scores = data;
        this.totalScore = data.physics + data.chemistry + data.math;
      },
      error: (err) => {
        console.error('Error fetching results:', err);
      },
    });
  }
  goToHome(){
    this.router.navigate(['/dashboard']);

  }
}
