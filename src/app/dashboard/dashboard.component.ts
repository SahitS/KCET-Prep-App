import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  standalone: true,
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  quizStarted = false;
  currentQuestions: any[] = [];
  userAnswers: { [key: number]: string } = {};

  constructor(private authService: AuthService) {}

  ngOnInit(): void {}

  startQuiz() {
    this.authService.fetchQuiz().subscribe(
      (data) => {
        this.currentQuestions = [
          ...data.chemistry,
          ...data.physics,
          ...data.mathematics,
        ];
        this.quizStarted = true;
      },
      (error) => {
        console.error('Error fetching quiz:', error);
      }
    );
  }

  selectAnswer(questionIndex: number, selectedOption: string) {
    this.userAnswers[questionIndex] = selectedOption;
  }

  submitQuiz() {
    const payload = {
      token: localStorage.getItem('userToken'),
      answers: this.userAnswers,
    };
    this.authService.submitAnswers(payload).subscribe(
      (response) => {
        console.log('Quiz submitted successfully:', response);
        alert('Quiz submitted! Check your rank in the results section.');
      },
      (error) => {
        console.error('Error submitting quiz:', error);
      }
    );
  }
}
