import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SupabaseService } from '../../../core/services/supabase.service'; 

@Component({
  selector: 'app-u-profile',
  templateUrl: './u-profile.component.html',
  styleUrls: ['./u-profile.component.css'],
  standalone: true,
  imports: [HeaderComponent]
})
export class UProfileComponent implements OnInit {
  user: {
    userName: string | null;
    profile_image: string;
    userEmail: string | null;
  } = {
    userName: null,
    profile_image: 'assets/profile/default-profile.jpg',// Default profile image
    userEmail: null,// Initialize role
  };

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    try {
      // Fetch the current user from Supabase
      const user = await this.supabaseService.getCurrentUser();
      if (user) {
        this.user.userName = user.name || 'Unnamed User'; // Display 'Unnamed User' if name is not set
        this.user.profile_image = user.profile_image || 'assets/profile/default-profile.jpg'; // Use default if profile image is not set
        this.user.userEmail = user.email || ''; // Use empty string if email is not set
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }

  onChangeProfilePhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Logic to upload the photo and update the profile photo URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profile_image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onChangePassword(): void {
    // Logic to change the user's password
    alert('Password change functionality will be implemented here.');
  }
}