import { Component, OnInit } from '@angular/core';
import PhysicsData from '../../../assets/Physics.json';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-physics-lessons',
  standalone: true,
  templateUrl: './physics-lessons.component.html',
  styleUrls: ['./physics-lessons.component.scss'],
})
export class PhysicsLessonsComponent implements OnInit {
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

  // Gemini API Configuration
  private readonly GEMINI_API_KEY = 'AIzaSyCKMBhgSf5XaxZ9hBOsr5GM41kEZm3PmLU';
  private readonly GEMINI_ENDPOINT =
    'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText';

  ngOnInit() {
    this.years = PhysicsData.Physics.years.map((year) => year.year);
  }

  onYearSelect(year: string) {
    this.selectedYear = year;
    const yearData = PhysicsData.Physics.years.find((y) => y.year === year);
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
  
    // Constructing the context for debugging
    const context = `
      Title: ${this.currentFlashcard?.title}
      Explanation: ${this.currentFlashcard?.explanation.join(', ')}
      Formulas: ${this.currentFlashcard?.formulas.join(', ')}
    `;
  
    // Constructing the prompt for the API
    const prompt = `
      Based on the flashcard content below, answer the following question only if it is relevant to the topic:
      Flashcard Content:
      ${context}
  
      User Question: ${this.userQuestion}
  
      Your Answer:
    `;
  
    // Log the context and prompt for debugging
    console.log('Debug: Context being sent to Gemini API:', context);
    console.log('Debug: Prompt being sent to Gemini API:', prompt);
  
    try {
      // Construct the API payload
      const requestBody = {
        prompt: { text: prompt },
        maxOutputTokens: 5000, // Adjust output token limit as needed
      };
  
      // Log the API request payload
      console.log('Debug: Request body being sent to Gemini API:', requestBody);
  
      // Make the API call
      const response = await fetch(this.GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.GEMINI_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      // Log the raw API response
      console.log('Debug: Raw response from Gemini API:', response);
  
      // Parse the response
      const data = await response.json();
  
      // Log the parsed API response
      console.log('Debug: Parsed response from Gemini API:', data);
  
      // Extract the AI response or set a fallback message
      this.aiResponse = data.candidates?.[0]?.output || 'No valid response.';
    } catch (error) {
      // Log any errors that occur during the API call
      console.error('Error calling Gemini API:', error);
      this.aiResponse = 'Failed to get a response from the AI.';
    }
  }  
}
