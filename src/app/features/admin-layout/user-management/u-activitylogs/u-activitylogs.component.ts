import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ActivityLog {
  id: number;
  name: string;
  role: string;
  action: 'Approved' | 'Submit' | 'Mark as Winner' | 'Remove';
  type: 'Purchase Request' | 'PPMP' | 'Bidding' | 'Asset';
  details: string;
  timestamp: string;
}

@Component({
  selector: 'app-u-activitylogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './u-activitylogs.component.html',
  styleUrl: './u-activitylogs.component.css'
})
export class UActivitylogsComponent implements OnInit {
  activityLogs: ActivityLog[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  displayedLogs: ActivityLog[] = [];
  
  ngOnInit() {
    this.initializeDummyLogs();
    this.totalPages = Math.ceil(this.activityLogs.length / this.itemsPerPage);
    this.updateDisplayedLogs();
  }

  initializeDummyLogs() {
    this.activityLogs = [
      {
        id: 1,
        name: 'John Doe',
        role: 'Department Staff',
        action: 'Submit',
        type: 'Purchase Request',
        details: 'Submitted',
        timestamp: '2024-03-15 09:30:00'
      },
      {
        id: 2,
        name: 'Jane Smith',
        role: 'GSO Officer',
        action: 'Approved',
        type: 'PPMP',
        details: 'Approved',
        timestamp: '2024-03-15 10:15:00'
      },
      {
        id: 3,
        name: 'Alice Johnson',
        role: 'BAC Staff',
        action: 'Mark as Winner',
        type: 'Bidding',
        details: 'Marked winner',
        timestamp: '2024-03-15 11:00:00'
      },
      {
        id: 4,
        name: 'Bob Wilson',
        role: 'Property Officer',
        action: 'Remove',
        type: 'Asset',
        details: 'Removed',
        timestamp: '2024-03-15 13:45:00'
      },
      {
        id: 5,
        name: 'Carlos White',
        role: 'Department Staff',
        action: 'Submit',
        type: 'PPMP',
        details: 'Submitted',
        timestamp: '2024-03-15 14:30:00'
      },
      {
        id: 6,
        name: 'Diana Prince',
        role: 'GSO Officer',
        action: 'Approved',
        type: 'Purchase Request',
        details: 'Approved',
        timestamp: '2024-03-15 15:20:00'
      },
      {
        id: 7,
        name: 'Bruce Wayne',
        role: 'BAC Staff',
        action: 'Mark as Winner',
        type: 'Bidding',
        details: 'Marked winner ',
        timestamp: '2024-03-15 16:10:00'
      },
      {
        id: 8,
        name: 'Clark Kent',
        role: 'Property Officer',
        action: 'Remove',
        type: 'Asset',
        details: 'Removed',
        timestamp: '2024-03-15 16:45:00'
      }
    ];
  }

  updateDisplayedLogs() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.displayedLogs = this.activityLogs.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedLogs();
    }
  }

  searchLogs(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm) {
      this.displayedLogs = this.activityLogs.filter(log => 
        log.name.toLowerCase().includes(searchTerm) ||
        log.action.toLowerCase().includes(searchTerm) ||
        log.type.toLowerCase().includes(searchTerm) ||
        log.details.toLowerCase().includes(searchTerm)
      );
    } else {
      this.updateDisplayedLogs();
    }
  }
}
