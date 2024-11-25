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
  styleUrls: ['./show-result.component.scss'],
})
export class ShowResultComponent implements OnInit {
  scores: Record<'physics' | 'chemistry' | 'math', number> = {
    physics: 0,
    chemistry: 0,
    math: 0,
  };  
  totalScore = 0;
  pieChartData: { name: string; value: number }[] = [];
  selectedSubject: string | null = null;
  detailedResults: { question: string; correctAnswer: string; userAnswer: string; status: string }[] = [];
  analysisData: Record<string, any> = {};
  graphData: { subject: string; data: { name: string; series: { name: string; value: number }[] }[] }[] = [];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchResults();
    this.fetchAnalysis();
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
      { name: 'Mathematics', value: this.scores.math },
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

  fetchAnalysis(): void {
    this.authService.getAnalysis().subscribe({
      next: (data) => {
        this.analysisData = data;
        this.prepareGraphs();
      },
      error: (err) => {
        console.error('Error fetching analysis:', err);
      },
    });
  }

  prepareGraphs(): void {
    const subjects = ['physics', 'chemistry', 'math'];
    this.graphData = subjects.map((subject) => {
      const subjectData = this.analysisData[subject] || {};
      const graphData = [];

      for (const topic in subjectData) {
        const topicDetails = subjectData[topic] || {};
        const series = Object.keys(topicDetails.subtopics || {}).map((subtopic) => ({
          name: subtopic,
          value: ((topicDetails.subtopics[subtopic]?.correct || 0) / (topicDetails.subtopics[subtopic]?.total || 1)) * 100,
        }));

        graphData.push({
          name: topic,
          series: Array.isArray(series) ? series : [],
        });
      }

      return { subject, data: graphData };
    });
  }

  resetSelection(): void {
    this.selectedSubject = null;
  }

  goToHome(): void {
    this.router.navigate(['/dashboard']);
  }
}
