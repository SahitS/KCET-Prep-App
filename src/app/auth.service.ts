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
    console.log(localStorage.getItem('userToken'));
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
  
}
