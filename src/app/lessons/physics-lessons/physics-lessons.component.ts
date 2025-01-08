import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import PhysicsData from '../../../assets/Physics.json';


@Component({
  imports:[CommonModule],
  selector: 'app-physics-lessons',
  standalone: true,
  templateUrl: './physics-lessons.component.html',
  styleUrls: ['./physics-lessons.component.scss']
})
export class PhysicsLessonsComponent implements OnInit {
  years: string[] = [];
  chapters: any[] = [];
  flashcards: any[] = [];

  selectedYear: string | null = null;
  selectedChapter: any | null = null;

  ngOnInit() {
    this.years = PhysicsData.Physics.years.map((year) => year.year);
  }

  onYearSelect(year: string) {
    this.selectedYear = year;
    const yearData = PhysicsData.Physics.years.find((y) => y.year === year);
    this.chapters = yearData?.chapters || [];
    this.selectedChapter = null;
    this.flashcards = [];
  }

  onChapterSelect(chapter: any) {
    this.selectedChapter = chapter;
    this.flashcards = chapter.flashcards || [];
  }
}
