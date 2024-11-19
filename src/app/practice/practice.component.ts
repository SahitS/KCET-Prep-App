import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule],
  providers: [AuthService],
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.scss'],
})
export class PracticeComponent implements OnInit {
  quiz: any = null; // Quiz data
  currentSection: string = 'physics'; // Start with Physics section
  currentQuestionIndex: number = 0; // Current question index
  currentQuestion: any = null; // Current question data
  timer: number = 90 * 60 * 1000; // Timer set for 90 minutes (in milliseconds)
  timerInterval: any;

  physicsAnswers: string[] = [];
  chemistryAnswers: string[] = [];
  mathAnswers: string[] = [];

  answerStatus: any = {
    physics: [],
    chemistry: [],
    math: [],
  }; // Status tracker for answers and reviews

  quizStarted: boolean = false; // Overlay control

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.generateQuiz().subscribe({
      next: () => {
        this.authService.getQuiz().subscribe({
          next: (data) => {
            this.quiz = data;
            this.initializeQuiz();
          },
          error: (err) => {
            console.error('Error fetching quiz:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error generating quiz:', err);
      },
    });
  }

  initializeQuiz(): void {
    Object.keys(this.quiz).forEach((section) => {
      this.answerStatus[section] = Array(this.quiz[section].length).fill('unanswered');
    });
    this.physicsAnswers = Array(this.quiz.physics.length).fill(null);
    this.chemistryAnswers = Array(this.quiz.chemistry.length).fill(null);
    this.mathAnswers = Array(this.quiz.math.length).fill(null);

    this.currentQuestion = this.quiz[this.currentSection][this.currentQuestionIndex];
  }

  startQuiz(): void {
    this.quizStarted = true;
    this.startTimer();
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer -= 1000;
      } else {
        clearInterval(this.timerInterval);
        alert('Time is up! Submitting the quiz.');
        this.submitQuiz();
      }
    }, 1000);
  }

  selectOption(option: string): void {
    if (this.currentSection === 'physics') {
      this.physicsAnswers[this.currentQuestionIndex] = option;
    } else if (this.currentSection === 'chemistry') {
      this.chemistryAnswers[this.currentQuestionIndex] = option;
    } else if (this.currentSection === 'math') {
      this.mathAnswers[this.currentQuestionIndex] = option;
    }

    this.answerStatus[this.currentSection][this.currentQuestionIndex] = 'answered';
  }

  markForReview(): void {
    this.answerStatus[this.currentSection][this.currentQuestionIndex] = 'review';
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.quiz[this.currentSection].length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.moveToNextSection();
    }
    this.currentQuestion = this.quiz[this.currentSection][this.currentQuestionIndex];
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    } else {
      this.moveToPreviousSection();
    }
    this.currentQuestion = this.quiz[this.currentSection][this.currentQuestionIndex];
  }

  moveToNextSection(): void {
    if (this.currentSection === 'physics') {
      this.currentSection = 'chemistry';
    } else if (this.currentSection === 'chemistry') {
      this.currentSection = 'math';
    }
    this.currentQuestionIndex = 0;
  }

  moveToPreviousSection(): void {
    if (this.currentSection === 'math') {
      this.currentSection = 'chemistry';
    } else if (this.currentSection === 'chemistry') {
      this.currentSection = 'physics';
    }
    this.currentQuestionIndex = this.quiz[this.currentSection].length - 1;
  }

  getQuestionClass(index: number): string {
    return this.answerStatus[this.currentSection][index];
  }

  submitQuiz(): void {
    console.log('Quiz submitted!', {
      physics: this.physicsAnswers,
      chemistry: this.chemistryAnswers,
      math: this.mathAnswers,
    });
    alert('Quiz submitted successfully!');
    clearInterval(this.timerInterval);
  }
}
