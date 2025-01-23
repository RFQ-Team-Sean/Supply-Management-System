import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SPM {
  id: number;
  supplier: string;
  performance_rating: string;
  total_contracts: string;
  total_value: string;
  status: string;
}

@Component({
  selector: 'app-suppliermanagement-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suppliermanagement-performance.component.html',
  styleUrl: './suppliermanagement-performance.component.css'
})
export class SuppliermanagementPerformanceComponent implements OnInit {
  spms: SPM[] = [
    {
      id: 1,
      supplier: 'Tech Solutions Inc.',
      performance_rating: '95.5',
      total_contracts: '10',
      total_value: '₱1,500,000.00',
      status: 'Approve'
    },
    {
      id: 2,
      supplier: 'Office Solutions Co.',
      performance_rating: '88.7',
      total_contracts: '10',
      total_value: '₱800,000.00',
      status: 'Reject'
    },
    {
      id: 3,
      supplier: 'Lab Supplies Inc.',
      performance_rating: '92.3',
      total_contracts: '10',
      total_value: '₱2,000,000.00',
      status: 'Pending'
    },
    {
      id: 4,
      supplier: 'MedTech Solutions',
      performance_rating: '91.8',
      total_contracts: '10',
      total_value: '₱3,500,000.00',
      status: 'Approve'
    },
    {
      id: 5,
      supplier: 'Network Systems Corp',
      performance_rating: '89.5',
      total_contracts: '10',
      total_value: '₱1,200,000.00',
      status: 'Reject'
    },
    {
      id: 6,
      supplier: 'Cool Air Solutions',
      performance_rating: '87.9',
      total_contracts: '10',
      total_value: '₱900,000.00',
      status: 'Pending'
    },
    {
      id: 7,
      supplier: 'Security Tech Corp',
      performance_rating: '93.2',
      total_contracts: '10',
      total_value: '₱750,000.00',
      status: 'Reject'
    },
    {
      id: 8,
      supplier: 'Office Depot Inc.',
      performance_rating: '86.5',
      total_contracts: '10',
      total_value: '₱500,000.00',
      status: 'Approve'
    },
    {
      id: 9,
      supplier: 'Data Systems Ltd.',
      performance_rating: '94.7',
      total_contracts: '10',
      total_value: '₱2,800,000.00',
      status: 'Pending'
    },
    {
      id: 10,
      supplier: 'AV Solutions Corp',
      performance_rating: '90.1',
      total_contracts: '10',
      total_value: '₱1,800,000.00',
      status: 'Approve'
    }
  ];

  displayedSpm: SPM[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  currentOpenActionId: number | null = null;

  ngOnInit() {
    this.updateDisplayedSpm();
  }

  updateDisplayedSpm() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedSpm = this.spms.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.spms.length / this.itemsPerPage);
  }

  searchLogs(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.displayedSpm = this.spms.filter(spm => 
      spm.supplier.toLowerCase().includes(searchTerm) ||
      spm.performance_rating.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedSpm.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedSpm();
    }
  }

  toggleActions(spm: SPM) {
    this.currentOpenActionId = this.currentOpenActionId === spm.id ? null : spm.id;
  }

  viewReportSmp(spm: SPM) {
    console.log('Viewing report for:', spm);
    this.currentOpenActionId = null;
  }
}
