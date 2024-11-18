// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { InventoryItem, ItemRequest } from '../../features/inventory/inventory.model';

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

  // inventory side
  async getInventoryItems() {
    const { data, error } = await this.supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching inventory: ${error.message}`);
    return data;
  }

  async addInventoryItem(item: Omit<InventoryItem, 'id'>) {
    const { data, error } = await this.supabase
      .from('inventory')
      .insert([item])
      .select();

    if (error) throw new Error(`Error adding item: ${error.message}`);
    return data[0];
  }

  async updateInventoryItem(id: number, item: Partial<InventoryItem>) {
    const { data, error } = await this.supabase
      .from('inventory')
      .update(item)
      .eq('item_id', id)  // Ensure to use item_id instead of id
      .select();
  
    if (error) throw new Error(`Error updating item: ${error.message}`);
    return data[0];
  }
  
  async deleteInventoryItem(itemId: number) {
    if (!itemId) {
      throw new Error('Item ID is required for deletion');
    }
  
    const { error } = await this.supabase
      .from('inventory')
      .delete()
      .eq('item_id', itemId);
  
    if (error) throw new Error(`Error deleting item: ${error.message}`);
    return true;
  }

  // New method to submit an item request
  async submitItemRequest(request: ItemRequest) {
    const { data, error } = await this.supabase
      .from('item_requests')
      .insert([request])
      .select();

    if (error) throw new Error(`Error submitting request: ${error.message}`);
    return data[0]; // Return the inserted request if successful
  }
}
