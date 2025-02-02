import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map } from 'rxjs';
import { createClient, SupabaseClient, AuthSession, PostgrestError } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export type PendingStatus = 'Draft' | 'Submitted';

export interface PurchaseRequest {
  id: number;
  pr_id: number;
  requested_item: string;
  total_amount: number;
  date_submitted: string;
  date_approved?: string;
  date_rejected?: string;
  status: PendingStatus | 'Approved' | 'Rejected';
  department?: string;
  requestor?: string;
  priority?: string;
  rejection_reason?: string;
  approved_by?: string;
  rejected_by?: string;
}

export interface ApprovedPurchaseRequest {
  id: number;
  pr_id: number;
  requested_item: string;
  total_amount: number;
  date_submitted: string;
  date_approved: string;
  status: 'Approved';
  department?: string;
  requestor?: string;
  priority?: string;
  approved_by: string;
  created_at: string;
}

export interface PurchaseRequestItem {
  prId: string;
  item: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  totalCost: number;
}

export interface PurchaseRequestData {
  prId?: string;
  departmentName: string;
  requestedBy: string;
  position: string;
  contact: string;
  email: string;
  items: PurchaseRequestItem[];
  totalAmount: number;
  justification: string;
  accountCode: string;
  amountAllocated: number;
  requestingOfficer: string;
  departmentHead: string;
  status?: 'Draft' | 'Submitted';
}

// Add interface for user details
interface UserDetails {
  name: string;
  departmentType: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequestService {
  private supabase: SupabaseClient;

  constructor(private router: Router) {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Add a method to refresh the session
  private async refreshSession(): Promise<AuthSession | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return null;
    }
  }

  // Updated getUserDepartment method with session refresh
  async getUserDepartment(): Promise<UserDetails> {
    try {
      // Try to get current user
      let authResponse = await this.supabase.auth.getUser();

      // If there's an authentication error, try to refresh the session
      if (authResponse.error?.message.includes('expired')) {
        const session = await this.refreshSession();
        if (session) {
          authResponse = await this.supabase.auth.getUser();
        } else {
          throw new Error('Session expired. Please log in again.');
        }
      }

      if (authResponse.error) {
        throw new Error(`Authentication error: ${authResponse.error.message}`);
      }

      const user = authResponse.data.user;
      if (!user) {
        throw new Error('No user found in auth response');
      }

      // Get user's account details with detailed error logging
      const accountResponse = await this.supabase
        .from('account')
        .select('name, department_type, email, role')
        .eq('id', user.id)
        .single();

      console.log('Account query response:', accountResponse);

      if (accountResponse.error) {
        console.error('Database error:', accountResponse.error);
        throw new Error(`Database error: ${accountResponse.error.message}`);
      }

      const data = accountResponse.data;
      if (!data) {
        throw new Error('No account data found for user');
      }

      // Format department type with detailed logging
      let departmentType = 'Department Not Set';
      console.log('Raw department_type:', data.department_type);

      if (data.department_type) {
        departmentType = data.department_type
          .toString()
          .replace(/_department/i, '')  // Remove _department suffix
          .split('_')                   // Split by underscore
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      } else {
        // Fallback to email-based department detection
        const email = data.email.toLowerCase();
        console.log('Using email for department detection:', email);
        
        if (email.includes('it.')) departmentType = 'IT_department';
        else if (email.includes('hr.')) departmentType = 'humanresource_department';
        else if (email.includes('finance.')) departmentType = 'financial_department';
        else if (email.includes('academic.')) departmentType = 'academic_department';
        else if (email.includes('admin_dept.')) departmentType = 'administrative_department';
        else if (email.includes('operation.')) departmentType = 'operation_department';
      }

      const result = {
        name: data.name || user.email?.split('@')[0] || 'Name Not Set',
        departmentType,
        email: data.email || user.email || ''
      };

      console.log('Returning user details:', result);
      return result;

    } catch (err: unknown) {
      const error = err as Error;
      console.error('Detailed error in getUserDepartment:', {
        error: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  // Get GSO pending requests
  getGsoPendingRequests(): Observable<PurchaseRequest[]> {
    return from(
      this.supabase
        .from('gso_pending_purchase_requests')
        .select('*')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) throw error;
        return data;
      })
    );
  }

  // Submit department request to GSO
  async submitDeptRequest(pr_id: number): Promise<void> {
    const { error } = await this.supabase
      .rpc('submit_dept_request', { p_pr_id: pr_id });
    
    if (error) throw error;
  }

  // Approve GSO request
  async approveGsoRequest(pr_id: number, approvedBy: string): Promise<void> {
    const { error } = await this.supabase
      .rpc('approve_gso_request', { 
        p_pr_id: pr_id,
        p_approved_by: approvedBy 
      });
    
    if (error) throw error;
  }

  // Reject GSO request
  async rejectGsoRequest(pr_id: number, rejectedBy: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .rpc('reject_gso_request', { 
        p_pr_id: pr_id,
        p_rejected_by: rejectedBy,
        p_rejection_reason: reason 
      });
    
    if (error) throw error;
  }

  // Get all pending requests (both Draft and Submitted)
  getPendingRequests(): Observable<PurchaseRequest[]> {
    return from(
      this.supabase
        .from('dp_pending_purchase_requests')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error fetching pending requests:', error);
          throw error;
        }
        console.log('Fetched pending requests:', data); // Debug log
        return data;
      })
    );
  }

  // Get only draft requests
  getDraftRequests(): Observable<PurchaseRequest[]> {
    return from(
      this.supabase
        .from('dp_pending_purchase_requests')
        .select('*')
        .eq('status', 'Draft')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error fetching draft requests:', error);
          throw error;
        }
        console.log('Fetched draft requests:', data); // Debug log
        return data;
      })
    );
  }

  // Get only submitted requests
  getSubmittedRequests(): Observable<PurchaseRequest[]> {
    return from(
      this.supabase
        .from('dp_pending_purchase_requests')
        .select('*')
        .eq('status', 'Submitted')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Error fetching submitted requests:', error);
          throw error;
        }
        console.log('Fetched submitted requests:', data); // Debug log
        return data;
      })
    );
  }

  // Create a new draft request
  async createDraftRequest(request: Omit<PurchaseRequest, 'id' | 'status' | 'date_submitted'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('dp_pending_purchase_requests')
        .insert([{
          ...request,
          status: 'Draft',
          date_submitted: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error creating draft request:', error);
        throw error;
      }
      console.log('Successfully created draft request'); // Debug log
    } catch (error) {
      console.error('Error in createDraftRequest:', error);
      throw error;
    }
  }

  // Update a draft request
  async updateDraftRequest(pr_id: number, updates: Partial<PurchaseRequest>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('dp_pending_purchase_requests')
        .update(updates)
        .eq('pr_id', pr_id)
        .eq('status', 'Draft'); // Only allow updating draft requests

      if (error) {
        console.error('Error updating draft request:', error);
        throw error;
      }
      console.log('Successfully updated draft request:', pr_id); // Debug log
    } catch (error) {
      console.error('Error in updateDraftRequest:', error);
      throw error;
    }
  }

  // Get approved requests from GSO portal
  getApprovedRequests(): Observable<ApprovedPurchaseRequest[]> {
    return from(
      this.supabase
        .from('dp_approved_purchase_requests')
        .select('*')
        .eq('status', 'Approved')  // Only get approved requests
        .order('date_approved', { ascending: false })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) {
          console.error('Supabase error:', error);
          throw new Error('Failed to fetch approved requests');
        }
        console.log('Fetched approved requests:', data);
        return data || [];
      })
    );
  }

  // Fetch rejected purchase requests
  getRejectedRequests(): Observable<PurchaseRequest[]> {
    return from(
      this.supabase
        .from('dp_rejected_purchase_requests')
        .select('*')
        .order('date_rejected', { ascending: false })
    ).pipe(
      map(({ data, error }: any) => {
        if (error) throw error;
        return data;
      })
    );
  }

  // Update generatePRId with session refresh handling
  async generatePRId(): Promise<string> {
    try {
      let { data, error } = await this.supabase.rpc('generate_pr_id');
      
      // If there's an authentication error, try to refresh the session
      if (error?.message.includes('JWT')) {
        await this.refreshSession();
        ({ data, error } = await this.supabase.rpc('generate_pr_id'));
      }
      
      if (error) throw error;

      // Add a random suffix to ensure uniqueness (optional)
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `${data}-${randomSuffix}`;
    } catch (error) {
      console.error('Error generating PR ID:', error);
      throw error;
    }
  }

  async saveDraft(data: PurchaseRequestData): Promise<void> {
    try {
      console.log('Saving draft with data:', data);

      // Generate PR ID if not exists
      const prId = data.prId || await this.generatePRId();
      console.log('Using PR ID:', prId);

      // Convert PR ID to number (remove 'PR-' prefix and other non-numeric characters)
      const numericPrId = parseInt(prId.replace(/\D/g, ''));
      console.log('Numeric PR ID:', numericPrId);

      // Prepare main request data
      const mainRequestData = {
        pr_id: numericPrId,
        requested_item: data.items.map(item => item.item).join(', '),
        total_amount: parseFloat(data.totalAmount.toString()),
        department: data.requestedBy || '',
        requestor: data.departmentName || '',
        position: data.position || '',
        contact: data.contact || '',
        email: data.email || '',
        justification: data.justification || '',
        account_code: data.accountCode || '',
        amount_allocated: parseFloat(data.amountAllocated.toString()),
        requesting_officer: data.requestingOfficer || '',
        department_head: data.departmentHead || '',
        status: 'Draft'
      };

      console.log('Inserting main request with data:', mainRequestData);

      // First, insert the main purchase request
      const { data: prData, error: prError } = await this.supabase
        .from('dp_pending_purchase_requests')
        .insert(mainRequestData)
        .select()
        .single();

      if (prError) {
        console.error('Error inserting main request:', prError);
        throw prError;
      }

      console.log('Main request inserted:', prData);

      // Prepare items data
      const itemsData = data.items.map(item => ({
        pr_id: numericPrId,
        item_description: item.item,
        quantity: parseInt(item.quantity.toString()),
        unit_of_measure: item.unitOfMeasure,
        unit_price: parseFloat(item.unitPrice.toString()),
        total_cost: parseFloat(item.totalCost.toString())
      }));

      console.log('Inserting items:', itemsData);

      const { error: itemsError } = await this.supabase
        .from('purchase_request_items')
        .insert(itemsData);

      if (itemsError) {
        console.error('Error inserting items:', itemsError);
        // If items insertion fails, we should delete the main request
        await this.supabase
          .from('dp_pending_purchase_requests')
          .delete()
          .eq('pr_id', numericPrId);
        throw itemsError;
      }

      console.log('Items inserted successfully');

    } catch (error) {
      console.error('Detailed error saving draft:', {
        error: error as PostgrestError,
        message: (error as PostgrestError)?.message,
        details: (error as PostgrestError)?.details,
        hint: (error as PostgrestError)?.hint
      });
      throw error;
    }
  }

  async submitRequest(data: any): Promise<any> {
    try {
      console.log('Starting submission with data:', data);
      
      // Convert PR ID to numeric if it's not already
      const numericPrId = this.convertPrIdToNumeric(data.prId);
      
      // First, insert into dp_pending_purchase_requests
      const { data: prData, error: prError } = await this.supabase
        .from('dp_pending_purchase_requests')
        .insert([{
          pr_id: numericPrId,
          requested_item: data.items[0]?.item_name || 'Multiple items', // First item or default
          total_amount: data.totalAmount,
          department: data.departmentName,
          requestor: data.requestedBy,
          priority: 'Normal', // You might want to make this configurable
          status: 'Draft'
        }])
        .select()
        .single();

      if (prError) {
        console.error('PR insertion error:', prError);
        throw new Error(`Failed to insert PR: ${prError.message}`);
      }

      console.log('PR record inserted:', prData);

      // Now call the submit_dept_request function
      const { data: submitResult, error: submitError } = await this.supabase
        .rpc('submit_dept_request', { 
          p_pr_id: numericPrId 
        });

      if (submitError) {
        console.error('Submit function error:', submitError);
        throw new Error(`Failed to submit request: ${submitError.message}`);
      }

      console.log('Request submitted successfully:', submitResult);
      
      return { success: true, data: { pr: prData, submit: submitResult } };

    } catch (error: any) {
      console.error('Detailed submission error:', error);
      throw error;
    }
  }

  private convertPrIdToNumeric(prId: string | number): number {
    if (typeof prId === 'number') {
      return prId;
    }
    // Remove any non-numeric characters and convert to number
    return parseInt(prId.toString().replace(/\D/g, ''));
  }

  async submitToDepartment(prId: string): Promise<any> {
    try {
      // Convert PR ID to numeric format
      const numericPrId = this.convertPrIdToNumeric(prId);
      console.log('Using PR ID:', prId);
      console.log('Numeric PR ID:', numericPrId);

      // Update the status to 'submitted' directly
      const { data: updateResult, error: updateError } = await this.supabase
        .from('purchase_requests')
        .update({ status: 'submitted' })
        .eq('pr_id', numericPrId);

      if (updateError) {
        console.error('Error updating status:', updateError);
        throw updateError;
      }

      console.log('Status updated successfully:', updateResult);
      return updateResult;

    } catch (error) {
      console.error('Error submitting request:', error);
      throw error;
    }
  }

  async submitToGSO(prId: number): Promise<void> {
    try {
      console.log('Submitting PR ID:', prId);
      
      // First check if session is valid
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        // Redirect to login or refresh token
        this.router.navigate(['/login']);
        return;
      }

      if (!session) {
        console.log('No active session');
        this.router.navigate(['/login']);
        return;
      }
      
      const { data, error } = await this.supabase
        .rpc('submit_dept_request', {
          p_pr_id: prId
        });

      if (error) {
        console.error('Error submitting to GSO:', error);
        throw error;
      }

      console.log('Successfully submitted to GSO');
      
    } catch (error) {
      console.error('Detailed error submitting request:', error);
      throw error;
    }
  }

  async submitToDepartmentHead(prId: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .rpc('submit_dept_request', {
          p_pr_id: prId  // Make sure parameter name matches exactly
        });
        
      if (error) throw error;
    } catch (error) {
      console.error('Error submitting to GSO:', error);
      throw error;
    }
  }
} 