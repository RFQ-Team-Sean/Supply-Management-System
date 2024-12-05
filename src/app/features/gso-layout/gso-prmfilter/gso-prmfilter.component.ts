import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gso-prmfilter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gso-prmfilter.component.html',
  styleUrl: './gso-prmfilter.component.css'
})
export class GsoPrmfilterComponent {
  filter = {
    department: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  };

  resetDepartment() {
    this.filter.department = '';
  }

  resetDateRange() {
    this.filter.dateFrom = '';
    this.filter.dateTo = '';
  }

  resetStatus() {
    this.filter.status = '';
  }

  resetAll() {
    this.filter = {
      department: '',
      dateFrom: '',
      dateTo: '',
      status: ''
    };
  }

  applyFilter() {
    // Implement filter logic here
    console.log('Applied filters:', this.filter);
  }
}
