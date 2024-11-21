import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-result.component.html',
  styleUrls: ['./show-result.component.scss']
})
export class ShowResultComponent implements OnInit {
  scores = { physics: 0, chemistry: 0, math: 0 };
  totalScore = 0;
  selectedSubject: string | null = null;
  detailedResults: { question: string; correctAnswer: string; userAnswer: string; status: string }[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchResults();
  }

  fetchResults(): void {
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

  showDetailedResults(subject: string): void {
    this.authService.getDetailedResults(subject).subscribe({
      next: (data) => {
        this.detailedResults = data; 
        this.selectedSubject = subject; 
      },
      error: (err) => {
        console.error('Error fetching detailed results:', err);
      },
    });
  }  

  resetSelection(): void {
    this.selectedSubject = null;
  }

  goToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
