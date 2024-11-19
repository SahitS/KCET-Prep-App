import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule],
  providers: [AuthService],
  templateUrl: './practice.component.html',
  styleUrl: './practice.component.scss'
})
export class PracticeComponent {
  quiz: any; 

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    
    this.authService.generateQuiz().subscribe({
      next: () => {
        
        this.authService.getQuiz().subscribe({
          next: (data) => {
            this.quiz = data;
            console.log('Quiz fetched:', this.quiz);
          },
          error: (err) => {
            console.error('Error fetching quiz:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error generating quiz:', err);
      }
    });
  }

  getUserToken(): string | null {
    return localStorage.getItem('userToken');
  }
}
