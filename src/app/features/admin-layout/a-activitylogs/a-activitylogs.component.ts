import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface ActivityLog {
  date: string;
  user: string;
  action: string;
  details: string;
  ip_address: string;
  status: 'Successful' | 'Failed';
}

@Component({
  selector: 'app-a-activitylogs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './a-activitylogs.component.html',
  styleUrls: ['./a-activitylogs.component.css']
})
export class AActivitylogsComponent implements OnInit {
  activityLogs: ActivityLog[] = [];
  displayedLogs: ActivityLog[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 7; // Number of items per page
  totalPages: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeActivityLogs();
    this.totalPages = Math.ceil(this.activityLogs.length / this.itemsPerPage);
    this.updateDisplayedLogs();
  }

  initializeActivityLogs(): void {
    this.activityLogs = [
      { date: '2024-10-01', user: 'John Doe', action: 'Login', details: 'User logged into the system', ip_address: '192.168.1.1', status: 'Successful' },
      { date: '2024-10-02', user: 'Jane Smith', action: 'Create', details: 'Created new purchase request for office supplies', ip_address: '192.168.1.2', status: 'Successful' },
      { date: '2024-10-03', user: 'Alice Johnson', action: 'Approve PR', details: 'Approved purchase request #12345', ip_address: '192.168.1.3', status: 'Successful' },
      { date: '2024-10-04', user: 'Bob Brown', action: 'Reject PR', details: 'Rejected purchase request #12346', ip_address: '192.168.1.4', status: 'Failed' },
      { date: '2024-10-05', user: 'Charlie White', action: 'General Report', details: 'Generated report for October 2024', ip_address: '192.168.1.5', status: 'Successful' },
      { date: '2024-10-06', user: 'Jane Smith', action: 'Login', details: 'User logged into the system', ip_address: '192.168.1.6', status: 'Successful' },
      { date: '2024-10-07', user: 'John Doe', action: 'Create', details: 'Created new purchase request for IT equipment', ip_address: '192.168.1.7', status: 'Successful' },
      { date: '2024-10-08', user: 'Alice Johnson', action: 'Approve PR', details: 'Approved purchase request #12347', ip_address: '192.168.1.8', status: 'Failed' },
      { date: '2024-10-09', user: 'Bob Brown', action: 'Reject PR', details: 'Rejected purchase request #12348', ip_address: '192.168.1.9', status: 'Successful' },
      { date: '2024-10-10', user: 'Charlie White', action: 'General Report', details: 'Generated report for September 2024', ip_address: '192.168.1.10', status: 'Failed' },
    ];
  }

  updateDisplayedLogs(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedLogs = this.activityLogs.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedLogs();
  }
}
