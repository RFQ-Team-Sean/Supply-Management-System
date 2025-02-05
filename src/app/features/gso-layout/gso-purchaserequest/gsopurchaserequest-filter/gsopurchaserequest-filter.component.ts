import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gsopurchaserequest-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gsopurchaserequest-filter.component.html',
  styleUrl: './gsopurchaserequest-filter.component.css'
})
export class GsopurchaserequestFilterComponent {
  filter = {
    department: '',
    dateReceived: ''
  };

  resetDepartment() {
    this.filter.department = '';
  }

  resetDateReceived() {
    this.filter.dateReceived = '';
  }

  resetAll() {
    this.filter = {
      department: '',
      dateReceived: ''
    };
  }

  applyFilter() {
    // Implement filter logic here
    console.log('Applied filters:', this.filter);
  }
}