import { Injectable } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, PostgrestError, SupabaseClient, User as SupabaseUser, AuthError } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { PLATFORM_ID, Inject } from '@angular/core';




export interface User {
  account_id: number;
  name: string;
  username: string;
  email: string;
  account_status: string;
  role: string;
  profile_image: string;
}

interface AppUser extends SupabaseUser {
  account_id?: string | number;
  name?: string;
  username?: string;
  account_status?: string;
  app_metadata: any;
  user_metadata: any;
  aud: string;
  created_at: string;
  email: string; 
}


@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  from(table: string) {
    throw new Error('Method not implemented.');
  }
  private supabase: SupabaseClient | null = null;
  currentUser: User | null = null;  // Add this line to store the current user details

  private supabaseInitPromise: Promise<void> | null = null;
  client: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.supabaseInitPromise = this.initializeSupabase();
    this.initializeSupabase().then(() => {
    }).catch(error => {
      console.error('Error during Supabase initialization:', error);
    });
    this.checkSession(); //Added
  }

  private checkSession(): void {
    if (!this.supabase) {
        console.error('Supabase client not initialized.');
        return;
    }

    this.supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (error) {
            console.error('Error fetching session:', error.message);
        } else if (session) {
        } else {
            console.error('No active session.');
        }
    });
}

async getCurrentUserId(): Promise<string | null> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return null;
  }

  try {
    const { data: { user } } = await this.supabase.auth.getUser(); // Await the promise and destructure the user
    return user?.id || null; // Return the user ID if it exists
  } catch (error) {
    console.error('Error fetching current user:', (error as Error).message);
    return null;
  }
}

// Initialize Supabase client if running on the browser
private async initializeSupabase(): Promise<void> {
  if (isPlatformBrowser(this.platformId)) {
    try {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', (error as Error).message);
      throw error;
    }
  }
}

private async ensureSupabaseInitialized(): Promise<void> {
  if (this.supabaseInitPromise) {
    // Wait for the initialization promise to complete
    await this.supabaseInitPromise;
  }
}

// Sign in using email and password
async signIn(email: string, password: string): Promise<{ data: any, error: any }> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return { data: null, error: 'Supabase client not initialized' };
  }
  try {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign-in error:', (error as Error).message);
      return { data: null, error };
    }
    
    this.checkSession(); //Added 

    // Fetch current user details to store them
    const userResponse = await this.supabase
      .from('account')
      .select('*')
      .eq('email', email)
      .single();  // Fetch the current user based on the email

    if (userResponse.error) {
      console.error('Error fetching current user:', userResponse.error.message);
      return { data: null, error: userResponse.error };
    }

    this.currentUser = userResponse.data as User;  // Store the user details

    return { data, error: null };
  } catch (error) {
    console.error('Error during sign-in:', (error as Error).message);
    return { data: null, error: 'Error during sign-in' };
  }
}

async getUserRole(email: string): Promise<string | null> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return null;
  }
  try {
    const { data, error } = await this.supabase
      .from('account')
      .select('*')
      .eq('email', email)
      .single();
    if (error) {
      console.error('Error fetching user role:', (error as PostgrestError).message);
      return null;
    }
    return data?.role ?? null;
  } catch (error) {
    console.error('Error fetching user role:', (error as Error).message);
    return null;
  }
}

async getUsers(): Promise<User[]> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return [];
  }
  
  const { data, error } = await this.supabase
  .from('account')
  .select('*');

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data as User[];
}

async getRoles(): Promise<string[]> {
  if (!this.supabase) return [];
  try {
    const { data, error } = await this.supabase.from('account').select('role');
    if (error) {
      console.error('Error fetching roles:', error.message);
      return [];
    }
    return data.map((item: { role: string }) => item.role);
  } catch (error) {
    console.error('Error:', (error as Error).message);
    return [];
  }
}

async fetchCurrentUser(): Promise<void> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    this.currentUser = null;
    return;
  }

  try {
    const { data, error } = await this.supabase.auth.getSession();

    if (error) {
      console.error('Error fetching session:', error.message);
      this.currentUser = null;
      return;
    }

    // Ensure data and session are not null
    if (data?.session?.user) {
      const appUser = data.session.user as AppUser;
      this.currentUser = {
        ...appUser,
        account_id: appUser.account_id ? Number(appUser.account_id) : undefined,
        // ... map other properties as needed
      } as unknown as User;
    } else {
      this.currentUser = null;
    }
  } catch (error) {
    console.error('Unexpected error:', (error as Error).message);
    this.currentUser = null;
  }
}

async insertAccount(name: string, username: string, password: string, role: string) {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return null;
  }
  const { data, error } = await this.supabase
    .from('account')
    .insert([{ name, username, password, role }]);
  if (error) {
    console.error('Error inserting account:', error);
    return null;
  }
  console.log('Account successfully inserted:', data);
  return data;
}

async getCurrentUser(): Promise<User | null> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return null;
  }

  try {
    const { data, error } = await this.supabase.auth.getSession();
    if (error || !data.session) {
      console.error('Error fetching user session or no session found:', error?.message);
      return null;
    }

    const user = data.session.user;
    if (!user) {
      console.error('No user is logged in.');
      return null;
    }

    // Fetch user details based on the correct column names in the account table
    const { data: userDetails, error: userError } = await this.supabase
      .from('account') // Make sure this is the correct table name
      .select('*') // Ensure to select the correct columns
      .eq('email', user.email) // Adjust the condition based on your table schema
      .single();

    if (userError) {
      console.error('Error fetching user details:', userError.message);
      return null;
    }

    return userDetails as User;
  } catch (err) {
    console.error('Unexpected error fetching current user:', err);
    return null;
  }
}

}
