import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  status: string;
}

@Component({
  selector: 'app-bidevaluation-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bidevaluation-filter.component.html',
  styleUrl: './bidevaluation-filter.component.css'
})
export class BidevaluationFilterComponent {
  @Output() filterChanged = new EventEmitter<FilterOptions>();

  constructor(private router: Router) {}

  statuses: string[] = [
    'Pending',
    'Draft',
    'On-Going',
    'Accept',
    'Decline'
  ];

  filters: FilterOptions = {
    dateFrom: '',
    dateTo: '',
    status: ''
  };

  resetDateRange(): void {
    this.filters.dateFrom = '';
    this.filters.dateTo = '';
  }



  resetStatus(): void {
    this.filters.status = '';
  }

  resetFilters(): void {
    this.filters = {
      dateFrom: '',
      dateTo: '',
      status: ''
    };
    this.filterChanged.emit(this.filters);
  }

  applyFilters(): void {
    this.filterChanged.emit(this.filters);
  }

  openBIDE(): void {
    this.router.navigate(['/user/u-ppmpmanagement/create']);
  }
}