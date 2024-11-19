import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [],
  templateUrl: './practice.component.html',
  styleUrl: './practice.component.scss'
})
export class PracticeComponent {

  getUserToken(): string | null {
    return localStorage.getItem('userToken');
  }
}
