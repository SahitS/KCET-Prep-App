import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-custom-practice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-practice.component.html',
  styleUrls: ['./custom-practice.component.scss']
})
export class CustomPracticeComponent implements OnInit {
  subjects: string[] = ['Mathematics', 'Physics', 'Chemistry'];
  topics: string[] = [];
  subtopics: { [key: string]: string[] } = {}; // Store subtopics grouped by topic
  selectedSubject: string = '';
  selectedTopics: string[] = [];
  selectedSubtopics: { [key: string]: string[] } = {}; // Store selected subtopics by topic
  difficultyLevels: string[] = ['Easy', 'Medium', 'Hard', 'Very Hard'];
  selectedDifficulty: string = 'Easy';
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    console.log('Custom Practice Component Initialized');
  }

  fetchTopics(subject: string): void {
    this.isLoading = true;
    this.selectedSubject = subject;
    console.log(`Fetching topics for subject: ${subject}`);

    this.authService.getTopics(subject).subscribe({
      next: (response) => {
        this.topics = response.topics;
        this.subtopics = response.subtopics;
        this.isLoading = false;
        console.log('Topics and Subtopics fetched successfully:', response);
      },
      error: (err) => {
        console.error('Error fetching topics:', err);
        this.isLoading = false;
      },
    });
  }

  toggleTopic(topic: string): void {
    const index = this.selectedTopics.indexOf(topic);
    if (index > -1) {
      this.selectedTopics.splice(index, 1);
      delete this.selectedSubtopics[topic]; // Clear subtopics when topic is deselected
    } else {
      this.selectedTopics.push(topic);
      this.selectedSubtopics[topic] = []; // Initialize empty array for subtopics
    }
    console.log('Selected Topics:', this.selectedTopics);
  }

  toggleSubtopic(topic: string, subtopic: string): void {
    if (!this.selectedSubtopics[topic]) {
      this.selectedSubtopics[topic] = []; // Ensure an empty array for the topic
    }
    const index = this.selectedSubtopics[topic].indexOf(subtopic);
    if (index > -1) {
      this.selectedSubtopics[topic].splice(index, 1); // Deselect subtopic
    } else {
      this.selectedSubtopics[topic].push(subtopic); // Select subtopic
    }
    console.log('Selected Subtopics:', this.selectedSubtopics);
  }

  startSession(): void {
    const payload = {
      subject: this.selectedSubject,
      topics: this.selectedTopics,
      subtopics: this.selectedSubtopics,
      difficulty: this.selectedDifficulty,
    };

    console.log('Starting session with payload:', payload);

    this.authService.submitCustomPractice(payload).subscribe({
      next: (response) => {
        console.log('Custom Practice Questions Generated Successfully:', response);
        alert('Custom Practice Session Created Successfully!');
      },
      error: (err) => {
        console.error('Error generating custom practice:', err);
      },
    });
  }
}
