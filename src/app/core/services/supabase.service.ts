import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from './../../environments/environment';

export interface User {
  account_id: number;
  username: string;
  email: string;
  account_status: string; // Active or Inactive
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Fetch all users from the Supabase database
  async getUsers(): Promise<User[]> {
    const { data, error } = await this.supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data as User[];
  }

  // Update user status in Supabase (e.g., activate/deactivate)
  async updateUserStatus(account_id: number, status: string): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .update({ account_status: status })
      .eq('account_id', account_id);

    if (error) {
      console.error('Error updating user status:', error);
    }
  }

  // Delete user from Supabase
  async deleteUser(account_id: number): Promise<void> {
    const { error } = await this.supabase
      .from('users')
      .delete()
      .eq('account_id', account_id);

    if (error) {
      console.error('Error deleting user:', error);
    }
  }
}
