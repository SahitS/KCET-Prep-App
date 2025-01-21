import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-study-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
  ],
  templateUrl: './study-plan.component.html',
  styleUrls: ['./study-plan.component.scss'],
})
export class StudyPlanComponent implements OnInit {
  examDate: Date | null = null;
  preferences = {
    weekdayHours: 4,
    weekendHours: 6,
    stressHandling: false,
  };
  studyPlan: any[] = [];
  daysLeft = 0;
  isLoading = false;

  selectedDay: any = null;
  selectedSubject: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  generateStudyPlan(): void {
    if (!this.examDate) {
      alert('Please select a KCET exam date.');
      return;
    }
  
    this.isLoading = true;
  
    const requestData = {
      examDate: this.examDate,
      weekdayHours: this.preferences.weekdayHours,
      weekendHours: this.preferences.weekendHours,
      stressMode: this.preferences.stressHandling,
    };
  
    this.authService.generateStudyPlan(requestData).subscribe({
      next: (data) => {
        if (data.error) {
          // Prompt user to adjust study hours
          alert(
            `${data.error}\nRequired Hours: ${data.requiredTotalHours}, Available Hours: ${data.availableTotalHours}\n${data.suggestion}`
          );
          this.isLoading = false;
          return;
        }
  
        this.studyPlan = data.studyPlan;
        this.daysLeft = data.daysLeft;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error generating study plan:', err);
        this.isLoading = false;
      },
    });
  }
  

  selectDay(day: any): void {
    this.selectedDay = day;
    this.selectedSubject = null;
  }

  selectSubject(subject: any): void {
    this.selectedSubject = subject;
  }

  resetView(): void {
    this.selectedDay = null;
    this.selectedSubject = null;
  }

  getTotalHours(subjects: any[]): number {
    if (!subjects || !Array.isArray(subjects)) return 0;
    return subjects.reduce((sum, subj) => {
      const subtopicSum = subj.subtopics.reduce((tSum: number, sub: any) => tSum + sub.hours, 0);
      return sum + subtopicSum;
    }, 0);
  }

  getSubjectHours(day: any): number {
    return day.subjects.reduce((sum: number, subj: any) => {
      return sum + subj.subtopics.reduce((subSum: number, subtopic: any) => subSum + subtopic.hours, 0);
    }, 0);
  }

  saveStudyPlan(): void {
    const token = localStorage.getItem('userToken') || '';
    if (!token) {
      alert('User not authenticated. Please log in.');
      return;
    }
  
    const payload = { studyPlan: this.studyPlan };
  
    this.authService.saveStudyPlan(payload).subscribe({
      next: (data) => {
        alert(data.message || 'Study plan saved successfully.');
      },
      error: (err) => {
        console.error('Error saving study plan:', err);
        alert('Failed to save the study plan. Please try again.');
      },
    });
  }

  navigateToAnalysis(): void {
    // Replace with your route to the analysis page
    this.router.navigate(['/show-result']);
  }
  
  
}
