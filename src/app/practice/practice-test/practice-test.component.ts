import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';

type SectionAnswers = {
  physicsAnswers: string[];
  chemistryAnswers: string[];
  mathAnswers: string[];
};

@Component({
  selector: 'app-practice-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './practice-test.component.html',
  styleUrl: './practice-test.component.scss'
})
export class PracticeTestComponent implements OnInit,SectionAnswers {
  physicsAnswers: string[] = [];
  chemistryAnswers: string[] = [];
  mathAnswers: string[] = [];

  quiz: any = null;
  currentSection: string = 'physics';
  currentQuestionIndex: number = 0;
  currentQuestion: any = null;
  timer: number = 90 * 60 * 1000;
  timerInterval: any;

  answerStatus: any = {
    physics: [],
    chemistry: [],
    math: [],
  };

  quizStarted: boolean = false;

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
    const physicsAnswers: any[] = [];
    const chemistryAnswers: any[] = [];
    const mathAnswers: any[] = [];
  
    ['physics', 'chemistry', 'math'].forEach((section) => {
      const sectionKey = `${section}Answers` as keyof SectionAnswers;
      const answersArray = this[sectionKey] as string[];
      answersArray.forEach((answer, index) => {
        if (answer !== null) {
          const question = this.quiz[section][index];
          
          // Debug logs for selected option and correct option
          console.log(`Section: ${section}, Question Index: ${index}`);
          console.log(`Selected Option: ${answer}`);
          console.log(`Correct Option: ${question.Correct_Option}`);
          
          const isCorrect = answer === question.Correct_Option;
          console.log(`Is Correct: ${isCorrect}`);
          
          const answerObj = {
            questionIndex: index,
            selectedOption: answer,
            isCorrect: isCorrect,
          };
  
          if (section === 'physics') physicsAnswers.push(answerObj);
          if (section === 'chemistry') chemistryAnswers.push(answerObj);
          if (section === 'math') mathAnswers.push(answerObj);
        }
      });
    });
  
    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Token is missing. Please log in again.');
      return;
    }
  
    const payload = {
      token,
      answers: {
        physicsAnswers,
        chemistryAnswers,
        mathAnswers,
      },
    };
  
    console.log('Payload being sent:', payload);
  
    this.authService.submitAnswers(payload).subscribe({
      next: () => {
        alert('Quiz submitted successfully!');
        clearInterval(this.timerInterval);
      },
      error: (err) => {
        console.error('Error submitting quiz:', err);
      },
    });
  }
  
  
    // New method to switch between sections
    switchSection(section: string): void {
      this.currentSection = section;
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.quiz[this.currentSection][this.currentQuestionIndex];
    }
  
    // Navigate to a specific question
    goToQuestion(index: number): void {
      this.currentQuestionIndex = index;
      this.currentQuestion = this.quiz[this.currentSection][this.currentQuestionIndex];
    }
  
    // Trigger submit button logic
    triggerSubmit(): void {
      if (
        this.currentSection !== 'math' ||
        this.currentQuestionIndex !== this.quiz.math.length - 1
      ) {
        const confirmSubmit = confirm(
          "The quiz isn't over yet. Are you sure you want to submit?"
        );
        if (confirmSubmit) {
          this.submitQuiz();
        }
      } else {
        this.submitQuiz();
      }
    }
  
}

