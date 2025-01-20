import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mock-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mock-test.component.html',
  styleUrls: ['./mock-test.component.scss'],
})
export class MockTestComponent implements OnInit {
  quiz: any = null;
  currentSection: string = 'physics';
  currentQuestionIndex: number = 0;
  physicsAnswers: any[] = [];
  chemistryAnswers: any[] = [];
  mathAnswers: any[] = [];
  markedForReview: Set<number> = new Set();
  timer: number = 3 * 60 * 60 * 1000; // 3 hours
  timerInterval: any;
  showOverlay: boolean = false;
  predictedRank: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('MockTestComponent initialized.');
    this.fetchQuiz();
    this.startTimer();
  }

  fetchQuiz(): void {
    console.log('Fetching quiz...');
    this.authService.fetchQuiz().subscribe({
      next: (data) => {
        console.log('Fetched Quiz Data:', data);
        this.quiz = data;
      },
      error: (err) => {
        console.error('Error fetching quiz:', err);
      },
    });
  }

  startTimer(): void {
    clearInterval(this.timerInterval);
    this.timer = 3 * 60 * 60 * 1000;
    this.timerInterval = setInterval(() => {
      if (this.timer > 0) {
        this.timer -= 1000;
      } else {
        clearInterval(this.timerInterval);
        alert('Time is up! Submitting the quiz automatically.');
        this.submitQuiz();
      }
    }, 1000);
  }

  selectAnswer(questionIndex: number, selectedOption: string): void {
    const answer = { questionIndex, selectedOption };

    if (this.currentSection === 'physics') {
      this.updateAnswer(this.physicsAnswers, answer);
    } else if (this.currentSection === 'chemistry') {
      this.updateAnswer(this.chemistryAnswers, answer);
    } else if (this.currentSection === 'mathematics') {
      this.updateAnswer(this.mathAnswers, answer);
    }

    console.log(
      `Answer selected for ${this.currentSection} Question ${questionIndex}: ${selectedOption}`
    );
  }

  updateAnswer(answersArray: any[], answer: any): void {
    const index = answersArray.findIndex(
      (a) => a.questionIndex === answer.questionIndex
    );
    if (index > -1) {
      answersArray[index] = answer;
    } else {
      answersArray.push(answer);
    }
  }

  markForReview(): void {
    const questionIndex =
      this.quiz[this.currentSection][this.currentQuestionIndex]?.questionIndex;
    if (this.markedForReview.has(questionIndex)) {
      this.markedForReview.delete(questionIndex);
      console.log(`Question ${questionIndex} removed from review.`);
    } else {
      this.markedForReview.add(questionIndex);
      console.log(`Question ${questionIndex} marked for review.`);
    }
  }

  getQuestionClass(index: number): string {
    const questionIndex = this.quiz[this.currentSection][index]?.questionIndex;

    if (this.markedForReview.has(questionIndex)) {
      return 'review'; // Yellow for review
    }

    const isAnswered =
      (this.currentSection === 'physics' &&
        this.physicsAnswers.some((ans) => ans.questionIndex === questionIndex)) ||
      (this.currentSection === 'chemistry' &&
        this.chemistryAnswers.some((ans) => ans.questionIndex === questionIndex)) ||
      (this.currentSection === 'mathematics' &&
        this.mathAnswers.some((ans) => ans.questionIndex === questionIndex));

    return isAnswered ? 'answered' : ''; // Green for answered
  }

  getAnswerForCurrentQuestion(): any {
    const questionIndex =
      this.quiz[this.currentSection][this.currentQuestionIndex]?.questionIndex;

    if (this.currentSection === 'physics') {
      return this.physicsAnswers.find(
        (answer) => answer.questionIndex === questionIndex
      );
    } else if (this.currentSection === 'chemistry') {
      return this.chemistryAnswers.find(
        (answer) => answer.questionIndex === questionIndex
      );
    } else if (this.currentSection === 'mathematics') {
      return this.mathAnswers.find(
        (answer) => answer.questionIndex === questionIndex
      );
    }
    return null;
  }

  submitQuiz(): void {
    clearInterval(this.timerInterval);

    const payload = {
      token: localStorage.getItem('userToken'),
      physicsAnswers: this.physicsAnswers,
      chemistryAnswers: this.chemistryAnswers,
      mathAnswers: this.mathAnswers,
    };

    console.log('Submitting quiz with payload:', payload);

    this.authService.submitMockTest(payload).subscribe({
      next: (response) => {
        console.log('Quiz submitted successfully:', response);
        this.showOverlay = true;
      },
      error: (err) => {
        console.error('Error submitting quiz:', err);
      },
    });
  }

  predictRank(data: { physics: number; chemistry: number; math: number }): void {
    const payload = {
      totalMarks:
        this.physicsAnswers.length +
        this.chemistryAnswers.length +
        this.mathAnswers.length,
      physicsPU: data.physics,
      chemistryPU: data.chemistry,
      mathPU: data.math,
    };

    console.log('Predicting rank with payload:', payload);

    this.authService.predictRank(payload).subscribe({
      next: (response) => {
        console.log('Rank prediction response:', response);
        this.predictedRank = response.predictedRank.toString();
        this.showOverlay = false;
      },
      error: (err) => {
        console.error('Error predicting rank:', err);
      },
    });
  }

  closeOverlay(): void {
    this.showOverlay = false;
  }

  closeRankDisplay(): void {
    this.predictedRank = null;
  }

  navigateSection(section: string): void {
    this.currentSection = section;
    this.currentQuestionIndex = 0;
    console.log(`Navigated to ${section} section.`);
  }

  nextQuestion(): void {
    const sectionQuestions = this.quiz[this.currentSection];
    if (this.currentQuestionIndex < sectionQuestions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      alert('You are at the last question of this section.');
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    } else {
      alert('You are at the first question of this section.');
    }
  }

  getFormattedTime(): string {
    const hours = Math.floor(this.timer / (1000 * 60 * 60));
    const minutes = Math.floor((this.timer % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((this.timer % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
