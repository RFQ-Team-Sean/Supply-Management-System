import { Component, Output, EventEmitter } from '@angular/core';
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
  selector: 'app-a-ppmpfilter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './a-ppmpfilter.component.html',
  styleUrls: ['./a-ppmpfilter.component.css']
})
export class APpmpfilterComponent {
  @Output() filterChanged = new EventEmitter<FilterOptions>();

  constructor(private router: Router) {}

  departments: string[] = [
    'IT Department',
    'HR Department',
    'Finance Dept',
    'Marketing',
    'Operations',
    'Research Dept',
    'Legal Dept',
    'Admin Dept'
  ];

  statuses: string[] = [
    'Pending',
    'Draft'
  ];

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

  openPPMP(): void {
    this.router.navigate(['/user/u-ppmpmanagement/create']);
  }
}
