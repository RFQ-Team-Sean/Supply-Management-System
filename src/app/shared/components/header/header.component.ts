import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service'; // Import your Supabase service

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true
})
export class HeaderComponent implements OnInit {
  userName: string | null = ''; // Initialize as empty
  profileImageUrl: string = 'assets/profile/default-profile.jpg'; // Default profile image
  userRole: string | null = ''; // Initialize role

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      // Fetch the current user from Supabase
      const user = await this.supabaseService.getCurrentUser();

      if (user) {
        this.userName = user.name || 'Unnamed User'; // Display 'Unnamed User' if name is not set
        this.profileImageUrl = user.profile_image || 'assets/profile/default-profile.jpg'; // Use default if profile image is not set
        this.userRole = user.role || ''; // Fetch the role of the user from the `account` table
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }

  navigateToProfile() {
    // Navigate based on the user's role
    if (this.userRole === 'admin') {
      this.router.navigate(['/admin/a-profile']);
    } else {
      this.router.navigate(['/user/u-profile']);
    }
  }
}
