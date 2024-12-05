import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

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
  userName: string = 'Loading...';
  userRole: string = '';
  userProfileImage: string = '';
  isProfileMenuOpen: boolean = false;

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    await this.loadProfileData();
    document.addEventListener('click', (event) => {
      if (!(event.target as HTMLElement).closest('.profile-dropdown')) {
        this.isProfileMenuOpen = false;
      }
    });
  }

  async loadProfileData() {
    try {
      const user = await this.supabase.getCurrentUser();
      if (user) {
        this.userName = user.name;
        this.userRole = this.formatRole(user.role);
        this.userProfileImage = user.profile_image || '';
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  toggleProfileMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  async signOut() {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) {
      return;
    }

    try {
      if (this.supabase.client) {
        await this.supabase.client.auth.signOut();
      }
      localStorage.clear();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error during sign out:', error);
      localStorage.clear();
      await this.router.navigate(['/login']);
    }
  }

  navigateToProfile() {
    const role = localStorage.getItem('userRole')?.toLowerCase();
    let route = '/login';

    switch (role) {
      case 'admin':
        route = '/admin/a-profile';
        break;
      case 'department':
        route = '/user/profile';
        break;
      case 'gso':
        route = '/gso/profile';
        break;
      case 'bac':
        route = '/bac/profile';
        break;
    }

    this.router.navigate([route]);
    this.isProfileMenuOpen = false;
  }

  encodeURIComponent(str: string): string {
    return window.encodeURIComponent(str);
  }

  private formatRole(role: string): string {
    return role?.charAt(0).toUpperCase() + role?.slice(1) || '';
  }
}
