import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatDatepickerModule, MatNativeDateModule, MatInputModule, MatFormFieldModule, CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  studyPlan: any[] = [];
  markedDates: { [key: string]: any } = {};
  selectedDate: Date | null = null;
  selectedAgenda: any = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchStudyPlan();
  }

  // Fetch study plan from backend
  fetchStudyPlan(): void {
    this.authService.getStudyPlan().subscribe({
      next: (data) => {
        this.studyPlan = data.studyPlan || [];
        this.markDates();
      },
      error: (err) => console.error('Error fetching study plan:', err),
    });
  }

  // Mark study plan days
  markDates(): void {
    const today = new Date();
    this.studyPlan.forEach((day: any, index: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const key = date.toDateString();
      this.markedDates[key] = day;
    });
  }

  // Handle date selection
  onDateSelect(date: Date): void {
    const key = date.toDateString();
    this.selectedAgenda = this.markedDates[key] || null;
  }

  // Navigate to mock test
  startMockTest(): void {
    this.router.navigate(['/mock-test']);
  }
}
