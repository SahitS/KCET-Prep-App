import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

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
    const token = localStorage.getItem('userToken') || '';
    return this.http.post(`${this.baseUrl}/submit-answers`, payload, {
      headers: {
        Authorization : token,
        //'Content-Type': 'application/json',
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

  getTopics(subject: string): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this.http.get(`${this.apiUrl}/get_topics?subject=${subject}`, {
      headers: { Authorization: token || '' },
    });
  }

  submitCustomPractice(data: any): Observable<any> {
    const token = localStorage.getItem('userToken');
    return this.http.post(`${this.apiUrl}/generate_custom_practice`, data, {
      headers: { Authorization: token || '' },
    });
  }

  getCustomPracticeTest() {
    return this.http.get(`${this.baseUrl}/get-custom-practice`, {
      headers: { Authorization: localStorage.getItem('userToken') || '' },
    });
  }

  // Submit user answer and verify correctness
  verifyAnswer(questionIndex: number, selectedOption: string): Observable<{ isCorrect: boolean }> {
    return this.http.post<{ isCorrect: boolean }>(
      `${this.baseUrl}/verify-answer`,
      { questionIndex, selectedOption },
      { headers: { Authorization: localStorage.getItem('userToken') || '' } }
    );
  }
  //Saving custom practice session history
  saveSessionHistory(performanceData: any) {
    const token = localStorage.getItem('userToken');
    console.log('Saving session history with payload:', { token, performanceData });
    console.log(token);
    return this.http.post(`${this.baseUrl}/save-session-history`, { token, performanceData });
  }
  //Fetching custom practice session history for displaying 
  getHistory() {
    const token = localStorage.getItem('userToken');
    return this.http.get<{
      subject: string;
      accuracy: number;
      topics: {
        topic: string;
        accuracy: number;
        subtopics: {
          subtopic: string;
          accuracy: number;
        }[];
      }[];
    }[]>(`${this.baseUrl}/get-history`, {
      headers: { Authorization: token || '' },
    });
  }

  generateStudyPlan(payload: {
    examDate: Date;
    weekdayHours: number;
    weekendHours: number;
    stressMode: boolean;
  }): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    console.log('Token for study plan generation:', token); // Log token
    console.log('Payload for study plan generation:', payload); // Log payload
  
    return this.http.post(`${this.apiUrl}/generate-study-plan`, payload, {
      headers: { Authorization: token }
    });
  }

  fetchQuiz(): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.get(`${this.baseUrl}/fetch-quiz`, {
      headers: { Authorization: token },
    });
  }
  
  submitMockTest(payload: any): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.post(`${this.baseUrl}/submit-mock-test`, payload, {
      headers: { Authorization: token },
    });
  }  

  predictRank(payload: {
    totalMarks: number;
    physicsPU: number;
    chemistryPU: number;
    mathPU: number;
  }): Observable<{ predictedRank: number }> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.post<{ predictedRank: number }>(`${this.apiUrl}/predict_rank`, payload, {
      headers: { Authorization: token },
    });
  }

  saveStudyPlan(payload: { studyPlan: any[] }): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.post(`${this.apiUrl}/save-study-plan`, payload, {
      headers: { Authorization: token },
    });
  }  

  getStudyPlan(): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.get(`${this.apiUrl}/get-study-plan`, {
      headers: { Authorization: token },
    });
  }

  updatePersonalInfo(personalInfo: { name: string; dob: string; country: string }): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.post(`${this.baseUrl}/update-personal-info`, { token, personalInfo }, {
      headers: { Authorization: token },
    });
  }

  updateContactInfo(contactInfo: { email: string; gender: string }): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.post(`${this.baseUrl}/update-contact-info`, { token, contactInfo }, {
      headers: { Authorization: token },
    });
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.post(`${this.baseUrl}/change-password`, { token, oldPassword, newPassword }, {
      headers: { Authorization: token },
    });
  }

  getUserDetails(): Observable<any> {
    const token = localStorage.getItem('userToken') || '';
    return this.http.get(`${this.baseUrl}/get-user-details`, {
      headers: { Authorization: token },
    });
  }
  

}
