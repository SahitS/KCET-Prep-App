import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface AnswerValidationResponse {
  isCorrect: boolean;
}

@Component({
  selector: 'app-custom-practice',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './custom-practice.component.html',
  styleUrls: ['./custom-practice.component.scss']
})
export class CustomPracticeComponent implements OnInit {
  subjects: string[] = ['Mathematics', 'Physics', 'Chemistry'];
  topics: string[] = [];
  subtopics: { [key: string]: string[] } = {};
  selectedSubject: string = '';
  selectedTopics: string[] = [];
  selectedSubtopics: { [key: string]: string[] } = {};
  difficultyLevels: string[] = ['Easy', 'Medium', 'Hard', 'Very Hard'];
  selectedDifficulty: string = 'Easy';
  isLoading: boolean = false;

  // State for practice session
  isSessionStarted: boolean = false;
  customPractice: any[] = [];
  currentQuestion: any = null;
  currentQuestionIndex: number = 0;
  selectedOption: string | null = null;
  isAnswered: boolean = false;
  isAnswerCorrect: boolean | null = null;
  // Track performance during session
  sessionPerformance: {
    topic: string;
    subtopic: string;
    totalQuestions: number;
    correctAnswers: number;
  }[] = [];
  history: { topic: string; subtopic: string; accuracy: number }[] = [];

  constructor(private authService: AuthService) {}
  

  ngOnInit(): void {
    console.log('Custom Practice Component Initialized');
    this.authService.getHistory().subscribe({
      next: (response) => {
        console.log('Fetched performance history:', response);
        this.history = response;
      },
      error: (err) => {
        console.error('Error fetching history:', err);
      }
    });
  }

  fetchTopics(subject: string): void {
    console.log(`Fetching topics for subject: ${subject}`);
    this.isLoading = true;
    this.selectedSubject = subject;

    this.authService.getTopics(subject).subscribe({
      next: (response) => {
        this.topics = response.topics;
        this.subtopics = response.subtopics;
        this.isLoading = false;
        console.log('Topics and subtopics fetched:', response);
      },
      error: (err) => {
        console.error('Error fetching topics:', err);
        this.isLoading = false;
      }
    });
  }

  toggleTopic(topic: string): void {
    const index = this.selectedTopics.indexOf(topic);
    if (index > -1) {
      this.selectedTopics.splice(index, 1);
      delete this.selectedSubtopics[topic];
    } else {
      this.selectedTopics.push(topic);
      this.selectedSubtopics[topic] = [];
    }
    console.log('Selected topics:', this.selectedTopics);
    console.log('Selected subtopics:', this.selectedSubtopics);
  }

  toggleSubtopic(topic: string, subtopic: string): void {
    const subtopics = this.selectedSubtopics[topic] || [];
    const index = subtopics.indexOf(subtopic);
    if (index > -1) {
      subtopics.splice(index, 1);
    } else {
      subtopics.push(subtopic);
    }
    console.log('Updated subtopics for topic:', topic, subtopics);
  }

  startSession(): void {
    this.sessionPerformance = [];
    console.log('Starting session with payload:', {
      subject: this.selectedSubject,
      topics: this.selectedTopics,
      subtopics: this.selectedSubtopics,
      difficulty: this.selectedDifficulty,
    });

    // Reset session state
    this.resetSessionState();

    // Generate custom practice questions
    this.authService.submitCustomPractice({
      subject: this.selectedSubject,
      topics: this.selectedTopics,
      subtopics: this.selectedSubtopics,
      difficulty: this.selectedDifficulty,
    }).subscribe({
      next: (generateResponse) => {
        console.log('Custom practice generation response:', generateResponse);

        // Fetch the generated custom practice questions
        this.authService.getCustomPracticeTest().subscribe({
          next: (fetchResponse: any) => {
            console.log('Fetched custom practice questions:', fetchResponse);

            if (fetchResponse.questions && fetchResponse.questions.length > 0) {
              this.customPractice = fetchResponse.questions;
              this.currentQuestion = this.customPractice[this.currentQuestionIndex];
              this.isSessionStarted = true;
              console.log('Session started. First question:', this.currentQuestion);
            } else {
              alert('No questions found for the selected filters. Please adjust your selection.');
              this.isSessionStarted = false;
            }
          },
          error: (fetchError) => {
            console.error('Error fetching custom practice questions:', fetchError);
            alert('An error occurred while fetching custom practice questions. Please try again.');
          },
        });
      },
      error: (generateError) => {
        console.error('Error generating custom practice:', generateError);
        alert('An error occurred while generating the custom practice. Please try again.');
      },
    });
  }

  selectOption(option: string): void {
    this.selectedOption = option;
    console.log('Selected option:', this.selectedOption);
  }

  submitAnswer(): void {
    if (!this.selectedOption) {
      alert('Please select an option before submitting.');
      return;
    }
  
    this.authService.verifyAnswer(this.currentQuestion.questionIndex, this.selectedOption).subscribe({
      next: (response: { isCorrect: boolean }) => {
        this.isAnswered = true;
        this.isAnswerCorrect = response.isCorrect;
  
        // Update session performance
        const topic = this.currentQuestion.Topic;
        const subtopic = this.currentQuestion.Subtopic;
  
        // Find the performance entry for this topic/subtopic
        let performanceEntry = this.sessionPerformance.find(
          (entry) => entry.topic === topic && entry.subtopic === subtopic
        );
  
        if (!performanceEntry) {
          // Add new entry if not already present
          performanceEntry = {
            topic,
            subtopic,
            totalQuestions: 0,
            correctAnswers: 0,
          };
          this.sessionPerformance.push(performanceEntry);
        }
  
        // Update stats
        performanceEntry.totalQuestions += 1;
        if (response.isCorrect) {
          performanceEntry.correctAnswers += 1;
        }
  
        console.log('Updated session performance:', this.sessionPerformance);
      },
      error: (err) => {
        console.error('Error verifying answer:', err);
        alert('An error occurred while verifying your answer.');
      }
    });
  }  

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.customPractice.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.customPractice[this.currentQuestionIndex];
      console.log('Moving to next question:', this.currentQuestion);
      this.resetQuestionState();
    } else {
      alert('You have completed all questions.');
    }
  }

  finishPractice(): void {
    console.log('Finishing practice session. Saving performance data:', this.sessionPerformance);
  
    const performanceData = this.sessionPerformance.map((entry) => ({
      ...entry,
      accuracy: ((entry.correctAnswers / entry.totalQuestions) * 100).toFixed(2), // Calculate accuracy
    }));
    console.log('Performance data to be saved:', performanceData);
  
    this.authService.saveSessionHistory(performanceData).subscribe({
      next: (response) => {
        console.log('Session performance saved successfully:', response);
        alert('Session completed and performance saved.');
      },
      error: (err) => {
        console.error('Error saving session performance:', err);
        alert('An error occurred while saving session performance.');
      }
    });
  
    // Reset session state
    this.isSessionStarted = false;
    this.resetSessionState();
    this.resetTopicsAndSubtopics();
    this.customPractice = [];
    this.currentQuestion = null;
    this.currentQuestionIndex = 0;
    this.resetQuestionState();
  }
  

  private resetQuestionState(): void {
    this.selectedOption = null; // Reset selected option
    this.isAnswered = false;
    this.isAnswerCorrect = null;
    console.log('Resetting question state:', {
      selectedOption: this.selectedOption,
      isAnswered: this.isAnswered,
      isAnswerCorrect: this.isAnswerCorrect,
    });
  }
  

  private resetSessionState(): void {
    this.customPractice = [];
    this.currentQuestion = null;
    this.currentQuestionIndex = 0;
    this.resetQuestionState();
  }

  private resetTopicsAndSubtopics(): void {
    this.selectedTopics = [];
    this.selectedSubtopics = {};
    console.log('Resetting topics and subtopics.');
  }
}
