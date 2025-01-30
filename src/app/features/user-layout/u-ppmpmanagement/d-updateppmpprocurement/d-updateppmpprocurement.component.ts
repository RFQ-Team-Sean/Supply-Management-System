// d-updateppmpprocurement.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Location } from '@angular/common';

interface PpmpItem {
  id?: number;
  item_name: string;
  item_description: string;
  quantity: number;
  unit_of_measurement: string;
  est_unit_cost: number;
  total_cost: number;
  category: string;
  q1_quantity: number;
  q2_quantity: number;
  q3_quantity: number;
  q4_quantity: number;
}

interface PpmpData {
  id: number;
  project_name: string;
  department: string;
  total_budget: number;
  status: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-d-updateppmpprocurement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d-updateppmpprocurement.component.html',
  styleUrls: ['./d-updateppmpprocurement.component.css']
})
export class DUpdateppmpprocurementComponent implements OnInit {
  projectId: number | null = null;
  ppmpData: PpmpData | null = null;
  ppmpItems: PpmpItem[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.projectId = Number(id);
        this.loadInitialData();
      }
    });
  }

  async loadInitialData(): Promise<void> {
    this.isLoading = true;
    try {
      await Promise.all([
        this.loadPpmpData(),
        this.loadPpmpItems()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.errorMessage = 'Failed to load PPMP data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadPpmpData(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpById(this.projectId);
      if (error) {
        console.error('Error fetching PPMP data:', error);
        throw error;
      }
      this.ppmpData = data;
    }
  }

  async loadPpmpItems(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpItemsByProjectId(this.projectId);
      if (error) {
        console.error('Error fetching PPMP items:', error);
        throw error;
      }
      this.ppmpItems = data;
    }
  }

  uniqueCategories(): string[] {
    return Array.from(new Set(this.ppmpItems.map(item => item.category)));
  }

  filterItemsByCategory(category: string): PpmpItem[] {
    return this.ppmpItems.filter(item => item.category === category);
  }

  validateQuarterlyDistribution(item: PpmpItem): void {
    // Ensure quarterly quantities are initialized
    item.q1_quantity = item.q1_quantity || 0;
    item.q2_quantity = item.q2_quantity || 0;
    item.q3_quantity = item.q3_quantity || 0;
    item.q4_quantity = item.q4_quantity || 0;

    // Calculate total from quarterly distribution
    const quarterlyTotal = item.q1_quantity + item.q2_quantity + item.q3_quantity + item.q4_quantity;
    
    // Update total quantity if quarterly distribution changes
    if (quarterlyTotal !== item.quantity) {
      item.quantity = quarterlyTotal;
    }

    // Recalculate total cost
    this.calculateTotalCost(item);
  }

  calculateTotalCost(item: PpmpItem): void {
    item.total_cost = item.quantity * item.est_unit_cost;
  }

  async updatePpmp(): Promise<void> {
    if (!this.ppmpData || this.projectId === null) return;

    this.isLoading = true;
    try {
      // Update total budget
      this.ppmpData.total_budget = this.ppmpItems.reduce((sum, item) => sum + item.total_cost, 0);

      // Update PPMP main data
      const { error: ppmpError } = await this.supabaseService.updatePpmp(this.projectId, this.ppmpData);
      if (ppmpError) throw ppmpError;

      // Update all items
      const itemUpdatePromises = this.ppmpItems.map(item => 
        this.supabaseService.updatePpmpItem(item.id!, item)
      );

      const itemResults = await Promise.all(itemUpdatePromises);
      const itemErrors = itemResults.filter(result => result.error);

      if (itemErrors.length > 0) {
        throw new Error('Failed to update some items');
      }

      this.router.navigate(['/ppmp/list']);
    } catch (error) {
      console.error('Error updating PPMP:', error);
      this.errorMessage = 'Failed to update PPMP. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.location.back();
  }
}