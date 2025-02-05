import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SuppliermanagementFilterComponent } from './suppliermanagement-filter/suppliermanagement-filter.component';
import { SuppliermanagementPerformanceComponent } from './suppliermanagement-performance/suppliermanagement-performance.component';

interface SPM {
  id: number;
  supplier: string;
  contact_person: string;
  phone_number: string;
  email_address: string;
  status: string;
}

export interface FilterOptions {
  id: string;
  status: string;
}

@Component({
  selector: 'app-bac-suppliermanagement',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SuppliermanagementFilterComponent,
    SuppliermanagementPerformanceComponent
  ],
  templateUrl: './bac-suppliermanagement.component.html',
  styleUrl: './bac-suppliermanagement.component.css'
})
export class BacSuppliermanagementComponent implements OnInit {
  spmData: SPM[] = [];
  displayedSpm: SPM[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  currentView: 'registered' | 'performance' = 'registered';
  showEvaluateModal = false;
  selectedSpm: SPM | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeDummyData();
    this.updateDisplayedSpm();
  }

  initializeDummyData(): void {
    this.spmData = [
      {
        id: 1,
        supplier: "ABC Company",
        contact_person: "John Doe",
        phone_number: "123-456-7890",
        email_address: "john@abc.com",
        status: "Active"
      },
      {
        id: 2,
        supplier: "XYZ Corporation",
        contact_person: "Jane Smith",
        phone_number: "098-765-4321",
        email_address: "jane@xyz.com",
        status: "Inactive"
      },
      {
        id: 3,
        supplier: "Tech Solutions",
        contact_person: "Mike Johnson",
        phone_number: "555-123-4567",
        email_address: "mike@techsol.com",
        status: "Active"
      },
      {
        id: 4,
        supplier: "Global Traders",
        contact_person: "Sarah Wilson",
        phone_number: "777-888-9999",
        email_address: "sarah@global.com",
        status: "Inactive"
      },
      {
        id: 5,
        supplier: "Metro Supplies",
        contact_person: "David Brown",
        phone_number: "444-555-6666",
        email_address: "david@metro.com",
        status: "Active"
      }
    ];
    this.totalPages = Math.ceil(this.spmData.length / this.itemsPerPage);
  }

  updateDisplayedSpm(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedSpm = this.spmData.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedSpm();
  }

  toggleActions(spm: SPM): void {
    this.currentOpenActionId = this.currentOpenActionId === spm.id ? null : spm.id;
  }

  switchView(view: 'registered' | 'performance'): void {
    this.currentView = view;
  }

  deactiveSpm(spm: SPM): void {
    this.selectedSpm = spm;
    this.showEvaluateModal = true;
    this.currentOpenActionId = null;
  }

  closeEvaluateModal() {
    this.showEvaluateModal = false;
    this.selectedSpm = null;
  }

  handleFilterChange(filters: FilterOptions): void {
    this.displayedSpm = this.spmData.filter(spm => {
      const statusMatches = !filters.status || spm.status === filters.status;
      const idMatches = !filters.id || spm.id.toString().includes(filters.id.toString());
      return statusMatches && idMatches;
    });

    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedSpm.length / this.itemsPerPage);
    this.updateDisplayedSpm();
  }

  searchRoles(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedSpm = this.spmData.filter(spm => 
      spm.supplier.toLowerCase().includes(searchTerm) ||
      spm.contact_person.toLowerCase().includes(searchTerm) ||
      spm.phone_number.toLowerCase().includes(searchTerm) ||
      spm.email_address.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedSpm.length / this.itemsPerPage);
    this.updateDisplayedSpm();
  }
}
