import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';

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
    weekdayHours: 4, // Default weekday hours
    weekendHours: 6, // Default weekend hours
    stressHandling: false, // Default stress handling off
  };
  studyPlan: any[] = [];
  dailyHours = 0;
  daysLeft = 0;
  isLoading = false;

  selectedDay: any = null;
  selectedSubject: any = null;

  constructor(private authService: AuthService) {}

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
        this.studyPlan = data.studyPlan;
        this.dailyHours = data.dailyHours;
        this.daysLeft = data.daysLeft;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error generating study plan:', err);
        this.isLoading = false;
      },
    });
  }

  selectDay(day: any) {
    this.selectedDay = day;
    this.selectedSubject = null;
  }

  selectSubject(subject: any) {
    this.selectedSubject = subject;
  }

  resetView() {
    this.selectedDay = null;
    this.selectedSubject = null;
  }

  getTotalHours(subjects: any[]): number {
    if (!subjects || !Array.isArray(subjects)) return 0;
    return subjects.reduce((sum, subj) => {
      const topicSum = subj.topics.reduce((tSum: number, topic: any) => {
        return tSum + topic.subtopics.reduce((sSum: number, sub: any) => sSum + sub.hours, 0);
      }, 0);
      return sum + topicSum;
    }, 0);
  }

  getTopicTotalHours(topics: any[]): number {
    return topics.reduce((sum, topic) => {
      return sum + topic.subtopics.reduce((tSum: number, sub: any) => tSum + sub.hours, 0);
    }, 0);
  }
}
