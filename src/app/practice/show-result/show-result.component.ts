import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-show-result',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './show-result.component.html',
  styleUrls: ['./show-result.component.scss']
})
export class ShowResultComponent implements OnInit {
  scores = { physics: 0, chemistry: 0, math: 0 };
  totalScore = 0;
  pieChartData: { name: string; value: number }[] = [];
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
        this.preparePieChartData();
      },
      error: (err) => {
        console.error('Error fetching results:', err);
      },
    });
  }

  preparePieChartData(): void {
    this.pieChartData = [
      { name: 'Physics', value: this.scores.physics },
      { name: 'Chemistry', value: this.scores.chemistry },
      { name: 'Mathematics', value: this.scores.math }
    ];
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
