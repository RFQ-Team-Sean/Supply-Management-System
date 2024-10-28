import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface User {
  account_id: number;
  name: string;
  email: string;
  role: string;
  account_status: string;
  showActions?: boolean; // To manage the visibility of the submenu
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  displayedUsers: User[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeDummyData();
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    this.updateDisplayedUsers();
  }

  initializeDummyData(): void {
    this.users = [
      { account_id: 1, name: 'John Doe', email: 'john.doe@example.com', role: 'Admin', account_status: 'active' },
      { account_id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', role: 'Accountant', account_status: 'inactive' },
      { account_id: 3, name: 'Michael Brown', email: 'michael.brown@example.com', role: 'Manager', account_status: 'active' },
      { account_id: 4, name: 'Emily Davis', email: 'emily.davis@example.com', role: 'Employee', account_status: 'inactive' },
      { account_id: 5, name: 'David Wilson', email: 'david.wilson@example.com', role: 'Auditor', account_status: 'active' },
      { account_id: 6, name: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'Admin', account_status: 'active' },
      { account_id: 7, name: 'Chris Lee', email: 'chris.lee@example.com', role: 'Employee', account_status: 'inactive' },
      { account_id: 8, name: 'Patricia Garcia', email: 'patricia.garcia@example.com', role: 'Manager', account_status: 'active' },
      { account_id: 9, name: 'Robert Martinez', email: 'robert.martinez@example.com', role: 'Auditor', account_status: 'inactive' },
      { account_id: 10, name: 'Linda Clark', email: 'linda.clark@example.com', role: 'Accountant', account_status: 'active' }
    ];
  }

  updateDisplayedUsers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedUsers = this.users.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedUsers();
  }

  toggleActions(user: User): void {
    user.showActions = !user.showActions; // Toggle the visibility
  }

  deactivateUser(user: User): void {
    const index = this.users.findIndex(u => u.account_id === user.account_id);
    if (index !== -1) {
      this.users[index].account_status = 'inactive';
      this.updateDisplayedUsers();
    }
  }

  activateUser(user: User): void {
    const index = this.users.findIndex(u => u.account_id === user.account_id);
    if (index !== -1) {
      this.users[index].account_status = 'active';
      this.updateDisplayedUsers();
    }
  }

  deleteUser(user: User): void {
    this.users = this.users.filter(u => u.account_id !== user.account_id);
    this.totalPages = Math.ceil(this.users.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    this.updateDisplayedUsers();
  }

  editUser(user: User): void {
    // You can implement the logic to navigate to the edit user page here
    this.router.navigate(['/admin/edit-user', user.account_id]);
  }

  createUser(): void {
    this.router.navigate(['/admin/create-user']);
  }
}
