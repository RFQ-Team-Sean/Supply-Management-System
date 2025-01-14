import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../core/services/supabase.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  account_status: string;
  profile_image: string | null;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  @Input() user: User | null = null;
  @Output() profileUpdated = new EventEmitter<User>();
  @Output() imageSelected = new EventEmitter<File | null>();

  roles = ['GSO Officer', 'Department Staff', 'BAC Staff', 'Property Officer'];
  statuses = ['Active', 'Inactive'];
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  constructor(private SupabaseService: SupabaseService) {}

  ngOnInit(){
    this.loadUserProfileImage(this.user)
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imageSelected.emit(this.selectedFile);

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
  
  async loadUserProfileImage(user: User | null) {
    if (!user){
      return;
    }
    if (user.profile_image) {
      const publicUrl = await this.SupabaseService.getPublicImageUrl(user.profile_image);
      user.profile_image = publicUrl;
      this.imagePreview = user.profile_image;
    }
    else{
      this.imagePreview = null;
    }
  }

  onSubmit() {
    if (this.user) {
      const updatedUser = {
        ...this.user,
        image: this.imagePreview || this.user.profile_image
      };
      this.profileUpdated.emit(updatedUser);
    }
    this.imagePreview = null;
  }
}
