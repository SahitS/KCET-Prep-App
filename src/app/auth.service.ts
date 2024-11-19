import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';

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
    return !!localStorage.getItem('token'); // Check if token exists
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }  
}
