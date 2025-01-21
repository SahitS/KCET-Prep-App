import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
})
export class AccountComponent {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      console.log('Form submitted:', this.signupForm.value);
      // TODO: Implement your signup logic here
      // You might want to call an authentication service
    }
  }
}