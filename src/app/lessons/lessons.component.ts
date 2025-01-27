
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  imports: [RouterModule],
  selector: 'app-lessons',
  standalone: true, 
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss']
})
export class LessonsComponent {
  private handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'theme' && event.newValue) {
      this.currentTheme = event.newValue;
    }
  };
  currentTheme: string | undefined;

  ngOnInit() {
    // Load initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark-theme';
    this.currentTheme = savedTheme;

    // Add listener for theme changes
    window.addEventListener('storage', this.handleStorageEvent);
  }

}
