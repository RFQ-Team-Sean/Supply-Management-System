// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.SUPABASE_URL, environment.SUPABASE_ANON_KEY);
  }

  // Fetch roles from Supabase
  async getRoles() {
    const { data, error } = await this.supabase
      .from('roles')
      .select('*');

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  // Sign up user and insert into the users table
  async signUpUser(name: string, email: string, roleId: number) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        { name, email, role_id: roleId }
      ]);

    if (error) {
      throw new Error(`Sign up error: ${error.message}`);  // Enhanced error message for sign-up
    }

    return data;  // Return the inserted data if needed
  }

  // Sign in user
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(`Login error: ${error.message}`);  // Enhanced error message for login
    }

    return data;  // Return the authentication data if needed
  }
}
