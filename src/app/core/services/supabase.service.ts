import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from './../../environments/environment';
import { BehaviorSubject } from 'rxjs';

export interface User {
  account_id: number;
  name: string;
  username: string;
  email: string;
  account_status: string;
  role: string;
  profile_image: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase!: SupabaseClient;
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
        auth: {
          persistSession: true,
          storageKey: 'auth-token',
          storage: localStorage,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      });

      // Set up auth state change listener
      this.supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          this.loadUserProfile(session.user.email);
        } else {
          this.userSubject.next(null);
        }
      });

      // Check for existing session
      this.supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          this.loadUserProfile(session.user.email);
        }
      });
    }
  }

  private async loadUserProfile(email: string | undefined): Promise<void> {
    if (!email) return;

    try {
      const { data, error } = await this.supabase
        .from('account')
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      if (data) {
        this.userSubject.next(data as User);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.userSubject.next(null);
    }
  }

  async signIn(email: string, password: string): Promise<{ data: any; error: any }> {
    const maxAttempts = 3;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        // Attempt to acquire a lock if LockManager API is available
        if (navigator?.locks) {
          return navigator.locks.request("sb-auth-token", { mode: "exclusive" }, async () => {
            const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (authError) {
              return { data: null, error: authError };
            }

            const { data: userData, error: userError } = await this.supabase
              .from('account')
              .select('*')
              .eq('email', email)
              .single();

            if (userError) {
              return { data: null, error: userError };
            }

            this.userSubject.next(userData as User);
            return { data: { auth: authData, user: userData }, error: null };
          });
        } else {
          // Fallback in case LockManager API is not available
          console.warn("LockManager API not available.");
          const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            return { data: null, error: authError };
          }

          const { data: userData, error: userError } = await this.supabase
            .from('account')
            .select('*')
            .eq('email', email)
            .single();

          if (userError) {
            return { data: null, error: userError };
          }

          this.userSubject.next(userData as User);
          return { data: { auth: authData, user: userData }, error: null };
        }
      } catch (error) {
        console.warn('Failed to acquire lock, retrying...', error);
        attempts++;
        await new Promise((res) => setTimeout(res, 1000)); // Wait before retrying
      }
    }

    return { data: null, error: new Error('Failed to acquire lock after several attempts.') };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.userSubject.next(null);
    localStorage.removeItem('userRole');
  }

  getCurrentUser(): User | null {
    return this.userSubject.getValue();
  }
}

//latest

// import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { createClient, SupabaseClient } from '@supabase/supabase-js';
// import { environment } from './../../environments/environment';
// import { BehaviorSubject } from 'rxjs';
// import { Router } from '@angular/router';

// export interface User {
//   account_id: number;
//   name: string;
//   username: string;
//   email: string;
//   account_status: string;
//   role: string;
//   profile_image: string;
// }

// @Injectable({
//   providedIn: 'root',
// })
// export class SupabaseService {
//   private supabase!: SupabaseClient;
//   private userSubject = new BehaviorSubject<User | null>(null);
//   user$ = this.userSubject.asObservable();
//   private router = inject(Router);

//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {
//     if (isPlatformBrowser(this.platformId)) {
//       this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
//         auth: {
//           persistSession: true,
//           storageKey: 'auth-token',
//           storage: localStorage,
//           autoRefreshToken: true,
//           detectSessionInUrl: false,
//         },
//       });

//       // Check for existing session
//       this.supabase.auth.getSession().then(({ data: { session } }) => {
//         if (session?.user) {
//           this.loadUserProfile(session.user.email);
//         }
//       });

//       // Set up auth state change listener
//       this.supabase.auth.onAuthStateChange(async (event, session) => {
//         if (event === 'SIGNED_IN' && session?.user) {
//           await this.loadUserProfile(session.user.email);
//         } else if (event === 'SIGNED_OUT') {
//           this.userSubject.next(null);
//           await this.router.navigate(['/auth/login']);
//         }
//       });
//     }
//   }

//   private async loadUserProfile(email: string | undefined): Promise<void> {
//     if (!email) return;

//     try {
//       const { data, error } = await this.supabase
//         .from('account')
//         .select('*')
//         .eq('email', email)
//         .single();

//       if (error) throw error;
//       if (data) {
//         this.userSubject.next(data as User);
//       }
//     } catch (error) {
//       console.error('Error loading user profile:', error);
//       this.userSubject.next(null);
//     }
//   }

//   async signIn(email: string, password: string): Promise<{ data: any; error: any }> {
//     try {
//       const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (authError) return { data: null, error: authError };

//       const { data: userData, error: userError } = await this.supabase
//         .from('account')
//         .select('*')
//         .eq('email', email)
//         .single();

//       if (userError) return { data: null, error: userError };

//       this.userSubject.next(userData as User);
//       return { data: { auth: authData, user: userData }, error: null };
//     } catch (error) {
//       console.error('Error during sign in:', error);
//       return { data: null, error };
//     }
//   }

//   async signOut(): Promise<void> {
//     await this.supabase.auth.signOut();
//     this.userSubject.next(null);
//     localStorage.removeItem('userRole');
//     await this.router.navigate(['/auth/login']);
//   }

//   getCurrentUser(): User | null {
//     return this.userSubject.getValue();
//   }
// }
