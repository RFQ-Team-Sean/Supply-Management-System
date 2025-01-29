import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { Location } from '@angular/common';

interface PPMPItem {
  item_name: string;
  item_description: string;
  unit_of_measurement: string;
  est_unit_cost: number;
  quantity: number;
  total_cost: number;
  qd_q1_qty: number;
  qd_q1_amt: number;
  qd_q2_qty: number;
  qd_q2_amt: number;
  qd_q3_qty: number;
  qd_q3_amt: number;
  qd_q4_qty: number;
  qd_q4_amt: number;
  category: string;
}

@Component({
  selector: 'app-d-viewppmpprocurement',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './d-viewppmpprocurement.component.html',
  styleUrls: ['./d-viewppmpprocurement.component.css']
})
export class DViewppmpprocurementComponent implements OnInit {
  @Input() projectId: number | null = null;
  @Input() isModalOpen: boolean = false;
  @Output() modalClosed = new EventEmitter<void>();

  ppmpData: any = null;
  ppmpItems: PPMPItem[] = [];
  categories: { name: string; items: PPMPItem[]; totalAmount: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private location: Location
  ) {}

  ngOnInit(): void {
    if (!this.isModalOpen) {
      this.route.paramMap.subscribe(params => {
        this.projectId = Number(params.get('id'));
        this.loadData();
      });
    } else if (this.projectId) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.loadData();
    }
  }

  private async loadData(): Promise<void> {
    await this.loadPpmpData();
    await this.loadPpmpItems();
  }

  async loadPpmpData(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpById(this.projectId);
      if (error) {
        console.error('Error fetching PPMP data:', error);
      } else {
        this.ppmpData = data;
      }
    }
  }

  async loadPpmpItems(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpItemsByProjectId(this.projectId);
      if (error) {
        console.error('Error fetching PPMP items:', error);
      } else {
        this.ppmpItems = data;
        this.categorizeItems();
      }
    }
  }

  categorizeItems(): void {
    const categoriesMap: { [key: string]: { name: string; items: PPMPItem[]; totalAmount: number } } = {};
    this.ppmpItems.forEach(item => {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = {
          name: item.category,
          items: [],
          totalAmount: 0
        };
      }
      categoriesMap[item.category].items.push(item);
      categoriesMap[item.category].totalAmount += item.total_cost;
    });
    this.categories = Object.values(categoriesMap);
  }

  openModal(): void {
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden'; 
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.modalClosed.emit(); 
    document.body.style.overflow = 'auto'; 
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  goBack(): void {
    this.location.back();
  }

  trackByIndex(index: number): number {
    return index;
  }
}