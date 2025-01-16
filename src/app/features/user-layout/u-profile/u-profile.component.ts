import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { SupabaseService } from '../../../core/services/supabase.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface User {
  id: string | null;
  name: string;
  username?: string;
  email: string;
  account_status: string;
  role: string;
  profile_image: string | null;
}

@Component({
  selector: 'app-u-profile',
  templateUrl: './u-profile.component.html',
  styleUrls: ['./u-profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class UProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  view: 'profile' | 'edit' | 'changePassword' = 'profile';
  userName: string = 'Loading...';
  userUsername: string = '';
  userRole: string = '';
  userEmail: string = '';
  userProfileImage: string = '';
  isProfileMenuOpen: boolean = false;
  isImageLoading: boolean = true;
  selectedImage: File | null = null;

  passwords = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(private supabase: SupabaseService) {}

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
        this.userEmail = user.email;
        this.userUsername = user.username;
        this.userRole = user.role;

        this.isImageLoading = true;
        const imageUrl = await this.supabase.getPublicImageUrl(user.profile_image);
        if (imageUrl) {
          const cacheBustedUrl = `${imageUrl}?t=${new Date().getTime()}`;
          const image = new Image();
          image.src = imageUrl;

          image.onload = () => {
            this.userProfileImage = cacheBustedUrl;
            this.isImageLoading = false;
          };

          image.onerror = () => {
            console.error('Failed to load profile image');
            this.isImageLoading = false;
          };
        } else {
          this.isImageLoading = false;
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.isImageLoading = false;
    }
  }

  async onEditProfile(event: Event) {
    event.preventDefault();

    // Prepare user data
    const updatedUser: User = {
      id: await this.supabase.getCurrentUserId(),
      name: this.userName,
      email: this.userEmail,
      username: this.userUsername,
      role: this.userRole,
      account_status: 'active', // Example, replace with your logic
      profile_image: this.userProfileImage,
    };

    // Call the update function
    await this.updateUserInDB(updatedUser.id, updatedUser);
    this.changeView('profile');
  }

  async updateUserInDB(updatedUserId: string | null, updatedUser: User) {
    if (!updatedUserId) {
      console.error('User ID is required');
      return;
    }

    try {
      let imagePath: string | null = null;

      if (this.selectedImage) {
        console.log(this.selectedImage);
        imagePath = await this.supabase.uploadProfileImage(this.selectedImage, updatedUserId);
      }

      // switch (updatedUser.role) {
      //   case 'Department Staff':
      //     updatedUser.role = 'department';
      //     break;
      //   case 'BAC Staff':
      //     updatedUser.role = 'bac';
      //     break;
      //   case 'Admin':
      //     updatedUser.role = 'admin';
      //     break;
      //   case 'GSO Officer':
      //     updatedUser.role = 'gso';
      //     break;
      //   default:
      //     updatedUser.role = '';
      // }

      await this.supabase.updateUser(updatedUserId, {
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        account_status: updatedUser.account_status,
        profile_image: imagePath || updatedUser.profile_image,
      });

      // If a new image was uploaded, update the displayed image with a cache-busting URL
      if (imagePath) {
        this.userProfileImage = `${imagePath}?t=${new Date().getTime()}`;
      }

      alert('Profile updated successfully!');
      await this.loadProfileData(); // Reload the updated profile data
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  }

  onProfilePictureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedImage = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.userProfileImage = reader.result as string; // Preview the new image
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  roleDisplayMapping: { [key: string]: string } = {
    gso: 'GSO Officer',
    admin: 'Admin',
    bac: 'BAC Staff',
    department: 'IT Department',
    //property: 'Property Officer'
  };

  getRoleDisplay(role: string): string {
    return this.roleDisplayMapping[role] || role;
  }

  onChangePassword(event: Event) {
    event.preventDefault();
    if (this.passwords.newPassword !== this.passwords.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    this.changeView('profile');
  }

  changeView(newView: 'profile' | 'edit' | 'changePassword') {
    this.view = newView;
  }
}
