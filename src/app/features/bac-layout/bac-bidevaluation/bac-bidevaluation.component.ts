import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BidevaluationFilterComponent } from "./bidevaluation-filter/bidevaluation-filter.component";
import { BidevaluationWinningbidComponent } from "./bidevaluation-winningbid/bidevaluation-winningbid.component";
import { BidevaluationEvaluateComponent } from './bidevaluation-evaluate/bidevaluation-evaluate.component';

interface BIDE {
  id: number;
  number: string;
  requested_items: string[];
  supplier: string;
  amount_submitted: number;
  evaluation_due_date: string;
  bid_evaluation_status: string;
  date_created: string;
  status: string;
}

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  status: string;
}

@Component({
  selector: 'app-bac-bidevaluation',
  standalone: true,
  imports: [
    BidevaluationFilterComponent, 
    BidevaluationWinningbidComponent,
    BidevaluationEvaluateComponent,
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './bac-bidevaluation.component.html',
  styleUrl: './bac-bidevaluation.component.css'
})
export class BacBidevaluationComponent implements OnInit {
  bideData: BIDE[] = [];
  displayedBide: BIDE[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  currentView: 'active' | 'winning' = 'active';
  showEvaluateModal = false;
  selectedBide: BIDE | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeDummyData();
    this.updateDisplayedBide();
  }

  initializeDummyData(): void {
    this.bideData = [
      {
        id: 1,
        number: 'BID-001',
        requested_items: ['Desktop Computers', 'Laptops'],
        supplier: 'Tech Solutions Inc.',
        amount_submitted: 1500000,
        evaluation_due_date: '2024-03-15',
        bid_evaluation_status: 'Pending Evaluation',
        status: 'On-Going',
        date_created: '2024-01-01'
      },
      {
        id: 2,
        number: 'BID-002',
        requested_items: ['Office Furniture', 'Filing Cabinets'],
        supplier: 'Office Solutions Co.',
        amount_submitted: 800000,
        evaluation_due_date: '2024-03-20',
        bid_evaluation_status: 'Under Evaluation',
        status: 'On-Going',
        date_created: '2024-01-15'
      },
      {
        id: 3,
        number: 'BID-003',
        requested_items: ['Laboratory Equipment', 'Chemical Supplies'],
        supplier: 'Lab Supplies Inc.',
        amount_submitted: 2000000,
        evaluation_due_date: '2024-03-25',
        bid_evaluation_status: 'Pending Evaluation',
        status: 'On-Going',
        date_created: '2024-01-30'
      },
      {
        id: 4,
        number: 'BID-004',
        requested_items: ['Medical Equipment', 'PPE Supplies'],
        supplier: 'MedTech Solutions',
        amount_submitted: 3500000,
        evaluation_due_date: '2024-04-01',
        bid_evaluation_status: 'Under Evaluation',
        status: 'Pending',
        date_created: '2024-02-01'
      },
      {
        id: 5,
        number: 'BID-005',
        requested_items: ['Network Equipment', 'Security Cameras'],
        supplier: 'Network Systems Corp',
        amount_submitted: 1200000,
        evaluation_due_date: '2024-04-05',
        bid_evaluation_status: 'Pending Evaluation',
        status: 'Draft',
        date_created: '2024-02-05'
      },
      {
        id: 6,
        number: 'BID-006',
        requested_items: ['Air Conditioning Units', 'Ventilation Systems'],
        supplier: 'Cool Air Solutions',
        amount_submitted: 900000,
        evaluation_due_date: '2024-04-10',
        bid_evaluation_status: 'Under Evaluation',
        status: 'Accept',
        date_created: '2024-02-10'
      },
      {
        id: 7,
        number: 'BID-007',
        requested_items: ['Office Supplies', 'Printing Materials'],
        supplier: 'Office Depot Inc.',
        amount_submitted: 500000,
        evaluation_due_date: '2024-04-15',
        bid_evaluation_status: 'Pending Evaluation',
        status: 'Decline',
        date_created: '2024-02-15'
      },
      {
        id: 8,
        number: 'BID-008',
        requested_items: ['Software Licenses', 'IT Support'],
        supplier: 'Tech Support Solutions',
        amount_submitted: 2500000,
        evaluation_due_date: '2024-04-20',
        bid_evaluation_status: 'Under Evaluation',
        status: 'On-Going',
        date_created: '2024-02-20'
      }
    ];
    this.totalPages = Math.ceil(this.bideData.length / this.itemsPerPage);
  }

  updateDisplayedBide(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedBide = this.bideData.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedBide();
  }

  toggleActions(bide: BIDE): void {
    this.currentOpenActionId = this.currentOpenActionId === bide.id ? null : bide.id;
  }

  switchView(view: 'active' | 'winning'): void {
    this.currentView = view;
  }

  evaluateBids(bide: BIDE): void {
    this.selectedBide = bide;
    this.showEvaluateModal = true;
    this.currentOpenActionId = null;
  }

  closeEvaluateModal() {
    this.showEvaluateModal = false;
    this.selectedBide = null;
  }

  handleFilterChange(filters: FilterOptions): void {
    this.displayedBide = this.bideData.filter(bide => {
      const bideDate = new Date(bide.date_created);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      const dateMatches = (!fromDate || bideDate >= fromDate) && 
                         (!toDate || bideDate <= toDate);
      
      const statusMatches = !filters.status || bide.status === filters.status;

      return dateMatches && statusMatches;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedBide.length / this.itemsPerPage);
    this.updateDisplayedBide();
  }

  searchRoles(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedBide = this.bideData.filter(bide => 
      bide.number.toLowerCase().includes(searchTerm) ||
      bide.supplier.toLowerCase().includes(searchTerm) ||
      bide.requested_items.some(item => item.toLowerCase().includes(searchTerm))
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedBide.length / this.itemsPerPage);
    this.updateDisplayedBide();
  }
}
