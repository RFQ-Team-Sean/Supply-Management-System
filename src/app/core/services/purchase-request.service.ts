import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class PurchaseRequestService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  // Get all pending requests (both Draft and Submitted)
  getPendingRequests(): Observable<PurchaseRequest[]> {
    return from(
      this.supabase
        .from('dp_pending_purchase_requests')
        .select('*')
        .order('date_submitted', { ascending: false })
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
        .order('date_submitted', { ascending: false })
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
        .order('date_submitted', { ascending: false })
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

  // Submit a draft request
  async submitPurchaseRequest(pr_id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('dp_pending_purchase_requests')
        .update({ status: 'Submitted' })
        .eq('pr_id', pr_id);

      if (error) {
        console.error('Error submitting request:', error);
        throw error;
      }
      console.log('Successfully submitted request:', pr_id); // Debug log
    } catch (error) {
      console.error('Error in submitPurchaseRequest:', error);
      throw error;
    }
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

  // Approve a purchase request (move from pending to approved)
  async approvePurchaseRequest(request: PurchaseRequest, approvedBy: string): Promise<void> {
    try {
      // First, delete from pending requests
      const { error: deleteError } = await this.supabase
        .from('dp_pending_purchase_requests')
        .delete()
        .eq('pr_id', request.pr_id);

      if (deleteError) throw deleteError;

      // Then, insert into approved requests
      const { error: insertError } = await this.supabase
        .from('dp_approved_purchase_requests')
        .insert([{
          pr_id: request.pr_id,
          requested_item: request.requested_item,
          total_amount: request.total_amount,
          date_submitted: request.date_submitted,
          date_approved: new Date().toISOString(),
          status: 'Approved',
          department: request.department,
          requestor: request.requestor,
          priority: request.priority,
          approved_by: approvedBy
        }]);

      if (insertError) throw insertError;

      console.log('Successfully approved request:', request.pr_id);
    } catch (error) {
      console.error('Error in approvePurchaseRequest:', error);
      throw error;
    }
  }

  // Reject a purchase request
  async rejectPurchaseRequest(request: PurchaseRequest, rejectedBy: string, rejectionReason: string): Promise<void> {
    const { data: deletedRequest, error: deleteError } = await this.supabase
      .from('dp_pending_purchase_requests')
      .delete()
      .eq('pr_id', request.pr_id);

    if (deleteError) throw deleteError;

    const { error: insertError } = await this.supabase
      .from('dp_rejected_purchase_requests')
      .insert([{
        ...request,
        status: 'Rejected',
        rejected_by: rejectedBy,
        rejection_reason: rejectionReason,
        date_rejected: new Date().toISOString()
      }]);

    if (insertError) throw insertError;
  }
} 