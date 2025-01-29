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

interface PPMPManagementData {
  project_id: number;
  date_created: string;
  project_name: string;
  requested_items: string;
  total_budget: number;
  status: string;
  date_approved: string | null;
  date_rejected: string | null;
  fiscal_year: number | null;
  department: string;
  estimated_department_budget: number | null;
  remaining_department_budget: number | null;
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
    // Only initialize if we're in a browser context
    if (isPlatformBrowser(this.platformId)) {
      this.supabaseInitPromise = this.initializeSupabase().catch(error => {
        console.error('Error during Supabase initialization:', error);
      });
      // Move checkSession to after initialization
      this.supabaseInitPromise.then(() => {
        this.checkSession();
      });
    }
  }

  private async checkSession(): Promise<void> {
    await this.ensureSupabaseInitialized();
    if (!this.supabase) {
      console.error('Supabase client not initialized.');
      return;
    }
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
      } else if (session) {
        // Handle active session
        console.log('Active session found');
      } else {
        console.log('No active session');
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  }

  // Commenting out the signIn method
  async signIn(email: string, password: string) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized.');
    }

    try {
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch user details including role from the account table
      const { data: userData, error: userError } = await this.supabase
        .from('account')
        .select('*')
        .eq('id', authData.user?.id)
        .single();

      if (userError) throw userError;

      // Store user data
      this.currentUser = userData;

      // Store session
      if (authData.session) {
        localStorage.setItem('supabase.auth.token', authData.session.access_token);
        localStorage.setItem('userRole', userData.role);
      }

      return { data: { ...authData, userData }, error: null };
    } catch (error) {
      console.error('Sign-in error:', error);
      return { data: null, error };
    }
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

  async getUserRole(email: string): Promise<string | null> {
    if (!this.supabase) {
      console.error('Supabase client not initialized.');
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from('account')
        .select('role')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data?.role || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
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
      .from('users')
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

  async createUser(email: string, password: string, userData: any) {
    if (!this.supabase) {
      console.error('Supabase client not initialized.');
      return null;
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async getPPMPManagementData(statusFilter: string) {
    if (!this.supabase) {
      console.error('Supabase client not initialized.');
      return null;
    }

    const { data, error } = await this.supabase
      .rpc('get_ppmp_management_data');

    if (error) {
      console.error('Error fetching data:', error);
      return [];
    }

    const typedData = data as PPMPManagementData[];

    if (statusFilter === 'Pending'){
      return typedData?.filter(item => item.status === 'Pending' || item.status === 'Draft') || [];
    } else if (statusFilter === 'Approved'){
      return typedData?.filter(item => item.status === 'Approved') || [];
    } else if (statusFilter === 'Rejected'){
      return typedData?.filter(item => item.status === 'Rejected') || [];
    } else if (statusFilter === 'All') {
      return data as PPMPManagementData[];
    }else {
      return [];
    }
  }

  async insertProject(data: any) {
    if (!this.supabase) {
      console.error('Supabase client not initialized.');
      return null;
    }

    const { data: projectData, error } = await this.supabase
      .from('ppmp_management')
      .insert(data)
      .select();
    if (error) throw error;
    return projectData;
  }

  async insertItems(items: any[]) {
    if (!this.supabase) {
      console.error('Supabase client not initialized.');
      return null;
    }

    const { data: itemsData, error } = await this.supabase
      .from('ppmp_item_requests')
      .insert(items)
      .select();
    if (error) throw error;
    return itemsData;
  }

  async getPpmpById(projectId: number): Promise<{ data: any; error: any }> {
    if (!this.supabase) {
      console.error('Supabase client not initialized.');
      return { data: null, error: 'Supabase client not initialized.' };
    }

    try {
      const { data, error } = await this.supabase
        .from('ppmp_management')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching PPMP data:', error);
      return { data: null, error };
    }
  }
async updatePpmp(projectId: number, ppmpData: any): Promise<{ data: any; error: any }> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return { data: null, error: 'Supabase client not initialized.' };
  }

  try {
    const { data, error } = await this.supabase
      .from('ppmp_management')
      .update(ppmpData)
      .eq('project_id', projectId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating PPMP data:', error);
    return { data: null, error };
  }
}

async getPpmpItemsByProjectId(projectId: number): Promise<{ data: any; error: any }> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return { data: null, error: 'Supabase client not initialized.' };
  }

  try {
    const { data, error } = await this.supabase
      .from('ppmp_item_requests')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching PPMP items:', error);
    return { data: null, error };
  }
}

async updatePpmpItem(itemId: number, itemData: any): Promise<{ data: any; error: any }> {
  if (!this.supabase) {
    console.error('Supabase client not initialized.');
    return { data: null, error: 'Supabase client not initialized.' };
  }

  try {
    const { data, error } = await this.supabase
      .from('ppmp_item_requests')
      .update(itemData)
      .eq('id', itemId);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating PPMP item:', error);
    return { data: null, error };
  }
}





}
