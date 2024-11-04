import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface Report {
  name: string;
  generatedBy: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-a-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './a-reports.component.html',
  styleUrls: ['./a-reports.component.css']
})
export class AReportsComponent implements OnInit {
  reports: Report[] = [];
  displayedReports: Report[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeReports();
    this.totalPages = Math.ceil(this.reports.length / this.itemsPerPage);
    this.updateDisplayedReports();
  }

  initializeReports(): void {
    this.reports = [
      { name: 'Sales Report Q1', generatedBy: 'Alice Johnson', date: '2024-10-01', status: 'Completed' },
      { name: 'Inventory Status', generatedBy: 'John Doe', date: '2024-10-02', status: 'Pending' },
      { name: 'Annual Financial Report', generatedBy: 'Jane Smith', date: '2024-10-03', status: 'Completed' },
      { name: 'Employee Attendance', generatedBy: 'Charlie White', date: '2024-10-04', status: 'In Progress' },
      { name: 'Customer Feedback Summary', generatedBy: 'Bob Brown', date: '2024-10-05', status: 'Completed' },
      { name: 'Compliance Report', generatedBy: 'Alice Johnson', date: '2024-10-06', status: 'Pending' },
      { name: 'Marketing Analysis', generatedBy: 'Jane Smith', date: '2024-10-07', status: 'In Progress' },
      { name: 'Budget Allocation', generatedBy: 'John Doe', date: '2024-10-08', status: 'Completed' },
      { name: 'Performance Review', generatedBy: 'Charlie White', date: '2024-10-09', status: 'Pending' },
      { name: 'Project Timeline', generatedBy: 'Bob Brown', date: '2024-10-10', status: 'In Progress' },
    ];
  }

  updateDisplayedReports(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedReports = this.reports.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedReports();
  }

  viewDetails(report: Report): void {
    // Implement view details functionality here
  }
}
