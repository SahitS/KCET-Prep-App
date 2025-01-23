import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  username: string = '';
  personalInfo = { name: '', dob: '', country: 'India/Karnataka', language: 'English' };
  contactInfoPayload = { email: '',gender:'' };
  accountSettings = { username: '', email: '', gender: 'male' };
  password = { old: '', new: '', confirm: '' };
  isPersonalInfoEditable = false;
  isAccountSettingsEditable = false;
  isPasswordOverlayOpen = false;

  ngOnInit() {
    this.contactInfoPayload.gender = this.contactInfoPayload.gender.toLowerCase(); // Normalize to lowercase
  }
  

  constructor(private authService: AuthService) {
    this.loadUserDetails();
  }

  editPersonalInfo() {
    this.isPersonalInfoEditable = true;
    console.log('Editing personal information.');
  }

  savePersonalInfo() {
    console.log('Saving personal information:', this.personalInfo);
    this.authService.updatePersonalInfo(this.personalInfo).subscribe(
      () => {
        alert('Personal information updated successfully!');
        this.isPersonalInfoEditable = false;
      },
      (error) => {
        console.error('Error updating personal info:', error);
      }
    );
  }

  editAccountSettings() {
    this.isAccountSettingsEditable = true;
    console.log('Editing account settings.');
  }

  saveAccountSettings() {
    this.contactInfoPayload.gender = this.contactInfoPayload.gender.charAt(0).toUpperCase() + 
    this.contactInfoPayload.gender.slice(1).toLowerCase();

    console.log('Saving account settings:', this.contactInfoPayload);
  
    this.authService.updateContactInfo(this.contactInfoPayload).subscribe(
      () => {
        alert('Account settings updated successfully!');
        this.isAccountSettingsEditable = false;
      },
      (error) => {
        console.error('Error updating account settings:', error);
      }
    );
  }
  

  openChangePasswordOverlay() {
    this.isPasswordOverlayOpen = true;
    console.log('Opening change password overlay.');
  }

  closeChangePasswordOverlay() {
    this.isPasswordOverlayOpen = false;
    console.log('Closing change password overlay.');
  }

  changePassword() {
    if (this.password.new !== this.password.confirm) {
      alert('New password and confirm password do not match!');
      return;
    }
    console.log('Changing password...');
    this.authService.changePassword(this.password.old, this.password.new).subscribe(
      () => {
        alert('Password changed successfully!');
        this.closeChangePasswordOverlay();
      },
      (error) => {
        console.error('Error changing password:', error);
        alert('Failed to change password. Please try again.');
      }
    );
  }

  loadUserDetails() {
    this.authService.getUserDetails().subscribe(
      (data) => {
        this.username = data.username || '';
        this.personalInfo.name = data.name || '';
        this.personalInfo.dob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : ''; // Format date
        this.personalInfo.country = data.country || 'India/Karnataka';
        this.personalInfo.language = data.language || 'English';
        this.contactInfoPayload.email = data.email || '';
        this.contactInfoPayload.gender = data.gender || '';
        console.log('User details loaded successfully:', data);
      },
      (error) => {
        console.error('Error loading user details:', error);
      }
    );
  }
}
