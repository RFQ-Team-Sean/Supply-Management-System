import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  department: string;
  status: string;
}

@Component({
  selector: 'app-bidmanagment-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidmanagment-filter.component.html',
  styleUrl: './bidmanagment-filter.component.css'
})
export class BidmanagmentFilterComponent {
  @Output() filterChanged = new EventEmitter<FilterOptions>();
  @Input() currentView: 'active' | 'invitation' | 'canvas' = 'active';

  constructor(private router: Router) {}

  get showStatusFilter(): boolean {
    return this.currentView !== 'canvas';
  }

  get statuses(): string[] {
    switch (this.currentView) {
      case 'active':
        return ['On-Going'];
      case 'invitation':
        return ['Accept', 'Reject', 'Pending'];
      default:
        return [];
    }
  }

  filters: FilterOptions = {
    dateFrom: '',
    dateTo: '',
    department: '',
    status: ''
  };

  resetDateRange(): void {
    this.filters.dateFrom = '';
    this.filters.dateTo = '';
  }

  resetDepartment(): void {
    this.filters.department = '';
  }

  resetStatus(): void {
    this.filters.status = '';
  }

  resetFilters(): void {
    this.filters = {
      dateFrom: '',
      dateTo: '',
      department: '',
      status: ''
    };
    this.filterChanged.emit(this.filters);
  }

  applyFilters(): void {
    this.filterChanged.emit(this.filters);
  }

  openBIDM(): void {
    this.router.navigate(['/user/u-ppmpmanagement/create']);
  }
}