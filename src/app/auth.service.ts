import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';
  private apiUrl = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient, private router: Router) {}
  login(username: string, password: string) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/login`, { username, password });
  }  

  signup(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/signup`, { username, password });
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('userToken');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }  

  generateQuiz() {
    const token = localStorage.getItem('userToken') || ''; // Retrieve the token from localStorage
    //console.log('Token from localStorage:', token); // Debug log
  
    if (!token) {
      //console.error('Authorization token is missing!');
      //return;
    }
  
    return this.http.post(`${this.apiUrl}/generate_quiz`, {}, {
      headers: {
        Authorization: token // Add the token to the header
      }
    });
  }

  getQuiz() {
    const token = localStorage.getItem('userToken') || '';
    //console.log('Quiz being fetched for', token);
    return this.http.get(`${this.apiUrl}/get_quiz`, {
      headers: {
        Authorization: token
      }
    });
  }

  submitAnswers(payload: { token: string | null; answers: any }) {
    return this.http.post(`${this.baseUrl}/submit-answers`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  getResults() {
    const token = localStorage.getItem('userToken') || '';
    return this.http.get<{ physics: number; chemistry: number; math: number }>(
      `${this.baseUrl}/get-results`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  getDetailedResults(subject: string) {
    const token = localStorage.getItem('userToken') || '';
    return this.http.get<any[]>(`${this.baseUrl}/get-detailed-results/${subject}`, {
      headers: { Authorization: token },
    });
  }

  getAnalysis() {
    const token = localStorage.getItem('userToken') || '';
    return this.http.get(`${this.baseUrl}/get-analysis`, {
      headers: { Authorization: token },
    });
  }
  
  
  
}
