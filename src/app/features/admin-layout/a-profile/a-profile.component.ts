import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-a-profile',
  templateUrl: './a-profile.component.html',
  styleUrls: ['./a-profile.component.css'],
  standalone: true,
  imports: []
})
export class AProfileComponent implements OnInit {
  userName: string = 'Loading...';
  userRole: string = '';
  userEmail: string = '';
  userProfileImage: string = '';
  isProfileMenuOpen: boolean = false;
  
  constructor(
      private supabase: SupabaseService
    ) {}

  async ngOnInit() {
    await this.loadProfileData();
    document.addEventListener('click', (event) => {
      if (!(event.target as HTMLElement).closest('.profile-dropdown')) {
        this.isProfileMenuOpen = false;
      }
    });
    console.log('initialized');
  }

  async loadProfileData() {
    try {
      const user = await this.supabase.getCurrentUser();
      if (user) {
        this.userName = user.name;
        this.userEmail = user.email;
        this.userRole = this.formatRole(user.role);
        this.userProfileImage = await this.supabase.getPublicImageUrl(user.profile_image) || '';
        console.log(this.userEmail);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  private formatRole(role: string): string {
    return role?.charAt(0).toUpperCase() + role?.slice(1) || '';
  }
}