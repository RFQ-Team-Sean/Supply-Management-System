import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Location } from '@angular/common';

interface QuarterDistribution {
  quantity: number;
  amount: number;
}

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
  quarter_distribution: {
    q1: QuarterDistribution;
    q2: QuarterDistribution;
    q3: QuarterDistribution;
    q4: QuarterDistribution;
  };
}

interface PpmpCategory {
  name: string;
  items: PpmpItem[];
}

interface PpmpData {
  id: number;
  project_name: string;
  department: string;
  total_budget: number;
  status: string;
  created_at: string;
  updated_at: string;
  categories: PpmpCategory[];
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
  ppmpData: PpmpData = {
    id: 0,
    project_name: '',
    department: '',
    total_budget: 0,
    status: 'Draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    categories: []
  };
  ppmpItems: PpmpItem[] = [];
  isLoading = false;
  errorMessage = '';

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
      await this.loadPpmpData();
      await this.loadPpmpItems();
      this.organizePpmpDataIntoCategories();
      this.initializeQuarterDistributions();
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.errorMessage = 'Failed to load PPMP data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private organizePpmpDataIntoCategories(): void {
    console.log('Starting organization with items:', this.ppmpItems);
    
    const categoryMap = new Map<string, PpmpItem[]>();
    
    this.ppmpItems.forEach(item => {
      const category = item.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)?.push({...item});
    });
  
    this.ppmpData.categories = Array.from(categoryMap.entries()).map(([name, items]) => ({
      name,
      items: items.map(item => ({
        ...item,
        quarter_distribution: {
          q1: { ...item.quarter_distribution.q1 },
          q2: { ...item.quarter_distribution.q2 },
          q3: { ...item.quarter_distribution.q3 },
          q4: { ...item.quarter_distribution.q4 }
        }
      }))
    }));
    
    console.log('Organized categories:', this.ppmpData.categories);
  }

  async loadPpmpData(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpById(this.projectId);
      if (error) {
        console.error('Error fetching PPMP data:', error);
        throw error;
      }
      if (data) {
        this.ppmpData = {
          ...data,
          categories: data.categories || []
        };
      }
    }
  }

  async loadPpmpItems(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpItemsByProjectId(this.projectId);
      console.log('Raw PPMP Items Data:', data);
      
      if (error) {
        console.error('Error fetching PPMP items:', error);
        throw error;
      }
      
      if (data) {
        this.ppmpItems = data.map((item: any) => {
          // Map using the exact column names from your Supabase data
          const mappedItem: PpmpItem = {
            id: item.id,
            item_name: item.item_name,
            item_description: item.item_description,
            quantity: Number(item.quantity),
            unit_of_measurement: item.unit_of_measurement,
            est_unit_cost: Number(item.est_unit_cost),
            total_cost: Number(item.total_cost),
            category: item.category,
            // Map using your actual column names from Supabase
            q1_quantity: Number(item.qd_q1_qty) || 0,  // Changed from q1_quantity to qd_q1_qty
            q2_quantity: Number(item.qd_q2_qty) || 0,  // Changed from q2_quantity to qd_q2_qty
            q3_quantity: Number(item.qd_q3_qty) || 0,  // Changed from q3_quantity to qd_q3_qty
            q4_quantity: Number(item.qd_q4_qty) || 0,  // Changed from q4_quantity to qd_q4_qty
            quarter_distribution: {
              q1: {
                quantity: Number(item.qd_q1_qty) || 0,
                amount: Number(item.qd_q1_amt) || 0    // Using qd_q1_amt directly from database
              },
              q2: {
                quantity: Number(item.qd_q2_qty) || 0,
                amount: Number(item.qd_q2_amt) || 0    // Using qd_q2_amt directly from database
              },
              q3: {
                quantity: Number(item.qd_q3_qty) || 0,
                amount: Number(item.qd_q3_amt) || 0    // Using qd_q3_amt directly from database
              },
              q4: {
                quantity: Number(item.qd_q4_qty) || 0,
                amount: Number(item.qd_q4_amt) || 0    // Using qd_q4_amt directly from database
              }
            }
          };
  
          console.log('Single mapped item:', mappedItem);
          return mappedItem;
        });
        
        console.log('All mapped items:', this.ppmpItems);
      }
    }
  }
  
  initializeQuarterDistributions(): void {
    this.ppmpData.categories.forEach(category => {
      category.items.forEach(item => {
        if (!item.quarter_distribution) {
          item.quarter_distribution = {
            q1: { quantity: Number(item.q1_quantity) || 0, amount: 0 },
            q2: { quantity: Number(item.q2_quantity) || 0, amount: 0 },
            q3: { quantity: Number(item.q3_quantity) || 0, amount: 0 },
            q4: { quantity: Number(item.q4_quantity) || 0, amount: 0 }
          };
        }
        // Calculate initial amounts
        Object.keys(item.quarter_distribution).forEach(quarter => {
          const q = quarter as 'q1' | 'q2' | 'q3' | 'q4';
          item.quarter_distribution[q].amount = 
            item.quarter_distribution[q].quantity * Number(item.est_unit_cost);
        });
      });
    });
  }

  addCategory(): void {
    this.ppmpData.categories.push({
      name: '',
      items: []
    });
  }

  removeCategory(index: number): void {
    const category = this.ppmpData.categories[index];
    const itemIds = category.items
      .filter(item => item.id)
      .map(item => item.id!);

    // Delete items from database
    itemIds.forEach(id => {
      this.supabaseService.deletePpmpItem(id);
    });

    // Remove category from local state
    this.ppmpData.categories.splice(index, 1);
  }

  addItem(categoryIndex: number): void {
    const newItem: PpmpItem = {
      item_name: '',
      item_description: '',
      quantity: 0,
      unit_of_measurement: '',
      est_unit_cost: 0,
      total_cost: 0,
      category: this.ppmpData.categories[categoryIndex].name,
      q1_quantity: 0,
      q2_quantity: 0,
      q3_quantity: 0,
      q4_quantity: 0,
      quarter_distribution: {
        q1: { quantity: 0, amount: 0 },
        q2: { quantity: 0, amount: 0 },
        q3: { quantity: 0, amount: 0 },
        q4: { quantity: 0, amount: 0 }
      }
    };
    this.ppmpData.categories[categoryIndex].items.push(newItem);
  }

  removeItem(categoryIndex: number, itemIndex: number): void {
    const item = this.ppmpData.categories[categoryIndex].items[itemIndex];
    if (item.id) {
      this.supabaseService.deletePpmpItem(item.id);
    }
    this.ppmpData.categories[categoryIndex].items.splice(itemIndex, 1);
  }

  calculateQuarterAmount(item: PpmpItem, quarter: 'q1' | 'q2' | 'q3' | 'q4'): void {
    const quarterDist = item.quarter_distribution[quarter];
    quarterDist.amount = quarterDist.quantity * item.est_unit_cost;
    
    // Update the corresponding q*_quantity field
    switch(quarter) {
      case 'q1':
        item.q1_quantity = quarterDist.quantity;
        break;
      case 'q2':
        item.q2_quantity = quarterDist.quantity;
        break;
      case 'q3':
        item.q3_quantity = quarterDist.quantity;
        break;
      case 'q4':
        item.q4_quantity = quarterDist.quantity;
        break;
    }
    
    this.validateQuarterlyDistribution(item);
  }

  calculateTotalCost(item: PpmpItem): void {
    item.total_cost = item.quantity * item.est_unit_cost;
  }

  validateQuarterlyDistribution(item: PpmpItem): void {
    const dist = item.quarter_distribution;
    const totalQuarterQuantity = 
      dist.q1.quantity +
      dist.q2.quantity +
      dist.q3.quantity +
      dist.q4.quantity;

    item.quantity = totalQuarterQuantity;
    this.calculateTotalCost(item);

    // Update individual quarter quantities
    item.q1_quantity = dist.q1.quantity;
    item.q2_quantity = dist.q2.quantity;
    item.q3_quantity = dist.q3.quantity;
    item.q4_quantity = dist.q4.quantity;
  }

  async updatePpmp(): Promise<void> {
    if (!this.ppmpData || this.projectId === null) return;

    this.isLoading = true;
    try {
      // Calculate total budget from all items
      this.ppmpData.total_budget = this.ppmpData.categories.reduce(
        (sum, category) => sum + category.items.reduce(
          (categorySum, item) => categorySum + item.total_cost, 0
        ), 0
      );

      // Update PPMP main data
      const { error: ppmpError } = await this.supabaseService.updatePpmp(
        this.projectId,
        this.ppmpData
      );
      if (ppmpError) throw ppmpError;

      // Update all items
      const itemUpdatePromises = this.ppmpData.categories.flatMap(category =>
        category.items.filter(item => item.id).map(item =>
          this.supabaseService.updatePpmpItem(item.id!, item)
        )
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

  onCancel(): void {
    this.location.back();
  }

  onSaveAsDraft(): void {
    this.ppmpData.status = 'Draft';
    this.updatePpmp();
  }

  onSubmit(status: string): void {
    this.ppmpData.status = status;
    this.updatePpmp();
  }
}