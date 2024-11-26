import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface FilterData {
  dateFrom: string;
  dateTo: string;
  costValue: number;
}

@Component({
  selector: 'app-d-prmfilter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './d-prmfilter.component.html',
  styleUrl: './d-prmfilter.component.css'
})
export class DPrmfilterComponent {
  @Output() filterChange = new EventEmitter<FilterData>();

  dateFrom: string = '';
  dateTo: string = '';
  costValue: number = 100;

  constructor(private router: Router) {}

  onCostChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.costValue = Number(input.value);
  }

  resetDates(): void {
    this.dateFrom = '';
    this.dateTo = '';
  }

  resetCost(): void {
    this.costValue = 100;
  }

  resetAll(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.costValue = 100;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filterChange.emit({
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      costValue: this.costValue
    });
  }

  createPurchaseRequest(): void {
    this.router.navigate(['/user/u-createprm']);
  }
}
