import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, PostgrestError, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { environment } from './../../environments/environment';
import { PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  account_id: number;
  name: string;
  username: string;
  email: string;
  account_status: string;
  role: string;
  profile_image: string;   
}

interface AuthResponse {
  data: {
    user?: SupabaseUser;
    session?: any;
  } | null;
  error: any | null;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private authStateChange = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  authState$ = this.authStateChange.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.setupAuthListener();
    this.refreshSession();
  }

  private setupAuthListener(): void {
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userDetails = await this.fetchUserDetails(session.user.email ?? '');
        this.currentUserSubject.next(userDetails);
        this.authStateChange.next(true);
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
        this.authStateChange.next(false);
      }
    });
  }

  private async refreshSession(): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session) {
      const userDetails = await this.fetchUserDetails(session.user.email ?? '')
      this.currentUserSubject.next(userDetails);
      this.authStateChange.next(true);
    }
  }

  private async fetchUserDetails(email: string): Promise<User | null> {
    if (!email) return null;

    try {
      const { data, error } = await this.supabase
        .from('account')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // First, check if the user exists in the account table
      const { data: accountData, error: accountError } = await this.supabase
        .from('account')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (accountError || !accountData) {
        return { data: null, error: 'User not found' };
      }

      // Then attempt authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      if (error) throw error;

      const userDetails = await this.fetchUserDetails(email);
      this.currentUserSubject.next(userDetails);
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign-in error:', error);
      return { data: null, error };
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await this.supabase
        .from('account')
        .select('*');

      if (error) throw error;
      return data as User[];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}
