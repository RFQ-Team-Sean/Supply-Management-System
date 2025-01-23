import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FilterOptions {
  id: string;
  status: string;
}

@Component({
  selector: 'app-suppliermanagement-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliermanagement-filter.component.html',
  styleUrl: './suppliermanagement-filter.component.css'
})
export class SuppliermanagementFilterComponent {
  @Output() filterChanged = new EventEmitter<FilterOptions>();

  constructor(private router: Router) {}

  statuses: string[] = ['Active', 'Inactive'];

  filters: FilterOptions = {
    id: '',
    status: ''
  };

  resetFilters(): void {
    this.filters = {
      id: '',
      status: ''
    };
    this.filterChanged.emit(this.filters);
  }

  applyFilters(): void {
    this.filterChanged.emit(this.filters);
  }

  resetStatus(): void {
    this.filters.status = '';
  }

  openBIDE(): void {
    this.router.navigate(['/user/u-ppmpmanagement/create']);
  }
}
