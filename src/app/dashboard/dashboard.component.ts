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
  studyPlan: any[] = []; // Holds the study plan fetched from the backend
  markedDates: { [key: string]: any } = {}; // Stores marked dates and their respective events
  calendarDays: Date[] = []; // Array to hold all days for the calendar view
  selectedDate: Date | null = null; // Currently selected date
  selectedAgenda: any = null; // Agenda for the selected date

  currentMonth: number = new Date().getMonth(); // Current month for the calendar
  currentYear: number = new Date().getFullYear(); // Current year for the calendar

  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // Weekday labels
  months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]; // Month labels

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchStudyPlan(); // Fetch study plan when component initializes
    this.generateCalendar(this.currentMonth, this.currentYear); // Generate the calendar for the current month and year
  }

  fetchStudyPlan(): void {
    this.authService.getStudyPlan().subscribe({
      next: (data) => {
        this.studyPlan = data.studyPlan || [];
        const currentDay = data.currentDay || 1;
  
        // Mark calendar dates based on the current day
        this.markDates(currentDay);
      },
      error: (err) => console.error('Error fetching study plan:', err),
    });
  }
  

  // Mark study plan days on the calendar
  markDates(currentDay: number): void {
    const today = new Date();
    this.markedDates = {}; // Reset marked dates
  
    this.studyPlan.forEach((day: any, index: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index - (currentDay - 1)); // Align with current day
      const key = date.toDateString();
      this.markedDates[key] = day;
    });
  }
  

  // Generate calendar days for a given month and year
  generateCalendar(month: number, year: number): void {
    this.calendarDays = []; // Clear previous calendar days
    const firstDay = new Date(year, month, 1).getDay(); // Day of the week for the 1st of the month
    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Total days in the current month

    // Add days from the previous month to fill the first week
    for (let i = 0; i < firstDay; i++) {
      this.calendarDays.push(new Date(year, month, i - firstDay + 1));
    }

    // Add all days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      this.calendarDays.push(new Date(year, month, i));
    }
  }

  // Navigate to the next month
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0; // Move to January
      this.currentYear++; // Increment the year
    } else {
      this.currentMonth++; // Move to the next month
    }
    this.generateCalendar(this.currentMonth, this.currentYear); // Generate the calendar for the new month
  }

  // Navigate to the previous month
  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11; // Move to December
      this.currentYear--; // Decrement the year
    } else {
      this.currentMonth--; // Move to the previous month
    }
    this.generateCalendar(this.currentMonth, this.currentYear); // Generate the calendar for the new month
  }

  // Handle date selection and display the overlay
  openOverlay(date: Date): void {
    const key = date.toDateString();
    if (this.markedDates[key]) {
      this.selectedDate = date;
      this.selectedAgenda = this.markedDates[key]; // Show agenda for the selected date
      console.log('Selected date:', this.selectedDate);
      console.log('Selected agenda:', this.selectedAgenda);
    } else {
      console.log('No events for the selected date.');
      this.selectedAgenda = null;
    }
  }
  

  // Close the overlay
  closeOverlay(): void {
    this.selectedAgenda = null; // Clear the selected agenda
  }

  // Navigate to the mock test page
  startMockTest(): void {
    this.router.navigate(['/mock-test']); // Redirect to the mock test page
  }

  // Check if a date has an event
  isEventDay(date: Date): boolean {
    return this.markedDates[date.toDateString()] !== undefined; // Return true if the date has an event
  }

  // Check if a date is today
  isToday(date: Date): boolean {
    const today = new Date();
    return today.toDateString() === date.toDateString(); // Return true if the date matches today's date
  }

  updateProgress(){
    
  }
}
