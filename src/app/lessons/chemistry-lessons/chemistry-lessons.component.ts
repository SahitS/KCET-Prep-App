import { Component, OnInit } from '@angular/core';
import ChemistryData from '../../../assets/Chemistry.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-chemistry-lessons',
  standalone: true,
  templateUrl: './chemistry-lessons.component.html',
  styleUrls: ['../physics-lessons/physics-lessons.component.scss'], // Reusing Physics styles
})
export class ChemistryLessonsComponent implements OnInit {
  topics: string[] = [];
  chapters: any[] = [];
  flashcards: any[] = [];

  selectedTopic: string | null = null;
  selectedChapter: any | null = null;

  showFlashcards = false;
  currentFlashcardIndex = 0;

  // Properties for Chat Modal
  showChatModal = false;
  userQuestion = '';
  aiResponse = '';
  currentFlashcard: any;

  ngOnInit() {
    this.topics = ChemistryData.Chemistry.topics.map((topic) => topic.topic).filter((topic): topic is string => topic !== undefined);
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    this.currentTheme = savedTheme;

    // Add listener for theme changes
    window.addEventListener('storage', this.handleStorageEvent);
  }

  onTopicSelect(topic: string) {
    this.selectedTopic = topic;
    const topicData = ChemistryData.Chemistry.topics.find((t) => t.topic === topic);
    this.chapters = topicData?.chapters || [];
  }

  onChapterSelect(chapter: any) {
    this.selectedChapter = chapter;
    this.flashcards = chapter.flashcards || [];
    this.currentFlashcardIndex = 0;
    this.showFlashcards = true;
  }

  closeFlashcards() {
    this.showFlashcards = false;
  }

  prevFlashcard() {
    if (this.currentFlashcardIndex > 0) {
      this.currentFlashcardIndex--;
    }
  }

  nextFlashcard() {
    if (this.currentFlashcardIndex < this.flashcards.length - 1) {
      this.currentFlashcardIndex++;
    }
  }

  // Open Chat Modal
  openChatModal() {
    this.showChatModal = true;
    this.currentFlashcard = this.flashcards[this.currentFlashcardIndex];
  }

  // Close Chat Modal
  closeChatModal() {
    this.showChatModal = false;
    this.userQuestion = '';
    this.aiResponse = '';
  }

  // Call AI for response
  async askAI() {
    if (!this.userQuestion.trim()) {
      alert('Please enter a question.');
      return;
    }

    const context = `
      Title: ${this.currentFlashcard?.title}
      Explanation: ${this.currentFlashcard?.explanation.join(', ')}
      Formulas: ${this.currentFlashcard?.formulas.join(', ')}
    `;

    const prompt = `
      Based on the flashcard content below, answer the following question only if it is relevant to the topic:
      Flashcard Content:
      ${context}
  
      User Question: ${this.userQuestion}
  
      Your Answer:
    `;

    try {
      const requestBody = {
        prompt: prompt,
        max_tokens: 500,
      };

      const response = await fetch('http://127.0.0.1:5000/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error from Flask API:', data.error);
        this.aiResponse = 'Failed to get a response from the AI.';
      } else {
        this.aiResponse = data.response || 'No valid response.';
      }
    } catch (error) {
      console.error('Error calling Flask backend:', error);
      this.aiResponse = 'Failed to connect to the server.';
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'theme' && event.newValue) {
      this.currentTheme = event.newValue;
    }
  };
  currentTheme: string | undefined;
}
