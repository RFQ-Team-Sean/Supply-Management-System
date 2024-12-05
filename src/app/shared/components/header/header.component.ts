import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HeaderComponent implements OnInit {
  pageTitle: string = 'Supply Management';
  userName: string = 'John Doe';
  userRole: string = 'Administrator';
  userProfileImage: string = '';
  isProfileMenuOpen: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Get user info from localStorage or service
    const role = localStorage.getItem('userRole');
    if (role) {
      this.userRole = this.formatRole(role);
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  signOut() {
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  private formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
}
