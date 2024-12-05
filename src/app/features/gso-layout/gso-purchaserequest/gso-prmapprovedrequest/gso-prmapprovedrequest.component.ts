import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface ApprovedPRM {
  id: number;
  pr_id: string;
  department: string;
  requested_item: string;
  total_amount: number;
  supplier: string;
  date_delivered: string;
  status: string;
}

@Component({
  selector: 'app-gso-prmapprovedrequest',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './gso-prmapprovedrequest.component.html',
  styleUrl: './gso-prmapprovedrequest.component.css'
})
export class GsoPrmapprovedrequestComponent implements OnInit {
  prmData: ApprovedPRM[] = [
    {
      id: 1,
      pr_id: 'PR-2024-001',
      department: 'IT Department',
      requested_item: 'Desktop Computer Set',
      total_amount: 45000,
      supplier: 'Tech Solutions Inc.',
      date_delivered: '2024-03-15',
      status: 'Approved'
    },
    {
      id: 2,
      pr_id: 'PR-2024-002',
      department: 'HR Department',
      requested_item: 'Office Furniture Set',
      total_amount: 75000,
      supplier: 'Modern Office Supplies',
      date_delivered: '2024-03-14',
      status: 'Approved'
    },
    {
      id: 3,
      pr_id: 'PR-2024-003',
      department: 'Finance Department',
      requested_item: 'Financial Software License',
      total_amount: 120000,
      supplier: 'Software Solutions Co.',
      date_delivered: '2024-03-13',
      status: 'Approved'
    },
    {
      id: 4,
      pr_id: 'PR-2024-004',
      department: 'Admin Department',
      requested_item: 'Filing Cabinets',
      total_amount: 25000,
      supplier: 'Office Depot Manila',
      date_delivered: '2024-03-12',
      status: 'Approved'
    },
    {
      id: 5,
      pr_id: 'PR-2024-005',
      department: 'Marketing Department',
      requested_item: 'Digital Camera Set',
      total_amount: 85000,
      supplier: 'Digital World PH',
      date_delivered: '2024-03-11',
      status: 'Approved'
    },
    {
      id: 6,
      pr_id: 'PR-2024-006',
      department: 'Operations Department',
      requested_item: 'Industrial Printer',
      total_amount: 150000,
      supplier: 'PrintTech Solutions',
      date_delivered: '2024-03-10',
      status: 'Approved'
    },
    {
      id: 7,
      pr_id: 'PR-2024-007',
      department: 'IT Department',
      requested_item: 'Network Equipment',
      total_amount: 95000,
      supplier: 'NetworkPro Manila',
      date_delivered: '2024-03-09',
      status: 'Approved'
    },
    {
      id: 8,
      pr_id: 'PR-2024-008',
      department: 'Training Department',
      requested_item: 'Training Equipment',
      total_amount: 65000,
      supplier: 'Educational Supplies Co.',
      date_delivered: '2024-03-08',
      status: 'Approved'
    },
    {
      id: 9,
      pr_id: 'PR-2024-009',
      department: 'Facilities Department',
      requested_item: 'Maintenance Tools',
      total_amount: 35000,
      supplier: 'Industrial Tools PH',
      date_delivered: '2024-03-07',
      status: 'Approved'
    },
    {
      id: 10,
      pr_id: 'PR-2024-010',
      department: 'Security Department',
      requested_item: 'CCTV System',
      total_amount: 180000,
      supplier: 'Security Systems Inc.',
      date_delivered: '2024-03-06',
      status: 'Approved'
    }
  ];

  displayedPRMs: ApprovedPRM[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  searchTerm: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateDisplayedPRMs();
  }

  updateDisplayedPRMs(): void {
    let filteredData = this.prmData;
    
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filteredData = this.prmData.filter(prm =>
        prm.department.toLowerCase().includes(searchLower) ||
        prm.requested_item.toLowerCase().includes(searchLower) ||
        prm.supplier.toLowerCase().includes(searchLower)
      );
    }

    this.totalPages = Math.ceil(filteredData.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedPRMs = filteredData.slice(startIndex, startIndex + this.itemsPerPage);
  }

  searchLogs(event: Event): void {
    const searchValue = (event.target as HTMLInputElement).value;
    this.searchTerm = searchValue;
    this.currentPage = 1;
    this.updateDisplayedPRMs();
  }

  toggleActions(prm: ApprovedPRM): void {
    this.currentOpenActionId = this.currentOpenActionId === prm.id ? null : prm.id;
  }

  viewPrm(prm: ApprovedPRM): void {
    this.router.navigate(['/gso/gso-prmviewdetails', prm.id]);
    this.currentOpenActionId = null;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPRMs();
    }
  }
}
