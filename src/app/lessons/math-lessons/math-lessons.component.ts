import { Component } from '@angular/core';
import MathData from '../../../assets/Mathematics.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-math-lessons',
  standalone: true,
  templateUrl: './math-lessons.component.html',
  styleUrls: ['../physics-lessons/physics-lessons.component.scss']
})
export class MathLessonsComponent {
  years: string[] = [];
  chapters: any[] = [];
  flashcards: any[] = [];

  selectedYear: string | null = null;
  selectedChapter: any | null = null;

  showFlashcards = false;
  currentFlashcardIndex = 0;

  // Properties for Chat Modal
  showChatModal = false;
  userQuestion = '';
  aiResponse = '';
  currentFlashcard: any;

  ngOnInit() {
    this.years = MathData.Mathematics.years.map((year) => year.year);
  }

  onYearSelect(year: string) {
    this.selectedYear = year;
    const yearData = MathData.Mathematics.years.find((y) => y.year === year);
    this.chapters = yearData?.chapters || [];
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

  // Call Gemini API
  async askAI() {
    if (!this.userQuestion.trim()) {
      alert('Please enter a question.');
      return;
    }
  
    // Constructing the context
    const context = `
      Title: ${this.currentFlashcard?.title}
      Explanation: ${this.currentFlashcard?.explanation.join(', ')}
      Formulas: ${this.currentFlashcard?.formulas.join(', ')}
    `;
    console.log('Debug: Constructed context:', context);
  
    // Constructing the prompt
    const prompt = `
      Based on the flashcard content below, answer the following question only if it is relevant to the topic:
      Flashcard Content:
      ${context}
  
      User Question: ${this.userQuestion}
  
      Your Answer:
    `;
    console.log('Debug: Constructed prompt:', prompt);
  
    try {
      // Preparing the request payload
      const requestBody = {
        prompt: prompt,
        max_tokens: 500,
      };
      console.log('Debug: Request payload being sent to Flask backend:', requestBody);
  
      // Making the API call
      const response = await fetch('http://127.0.0.1:5000/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      // Checking the raw response
      console.log('Debug: Raw response from Flask backend:', response);
  
      // Parsing the response
      const data = await response.json();
      console.log('Debug: Parsed response from Flask backend:', data);
  
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
}
