import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../../../../core/services/supabase.service';

interface ApprovedPPMP {
  project_id: number;
  project_name: string;
  requested_items: string;
  total_budget: number;
  date_approved: string | null;
  status: string;
}

@Component({
  selector: 'app-d-ppmpapprovedprocurement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './d-ppmpapprovedprocurement.component.html',
  styleUrl: './d-ppmpapprovedprocurement.component.css'
})
export class DPpmpapprovedprocurementComponent implements OnInit {
  ppmpData: ApprovedPPMP[] = [];
  displayedPpmps: ApprovedPPMP[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  isLoading: boolean = true;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadPpmpRecords();
  }

  async loadPpmpRecords() {
    this.isLoading = true;
    const data = await this.supabaseService.getPPMPManagementData('Approved');
    if (data) {
      this.ppmpData = data;
    }
    this.isLoading = false;
    this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
    this.updateDisplayedPpmps();
  }

  updateDisplayedPpmps(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPpmps = this.ppmpData.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPpmps();
  }

  toggleActions(ppmp: ApprovedPPMP): void {
    this.currentOpenActionId = this.currentOpenActionId === ppmp.project_id ? null : ppmp.project_id;
  }

  viewPpmp(ppmp: ApprovedPPMP): void {
    this.router.navigate(['/user/u-ppmpviewdetails', ppmp.project_id]);
  }

  printPpmp(ppmp: ApprovedPPMP): void {
    // Implement print functionality
    console.log('Printing PPMP:', ppmp);
  }

  searchLogs(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.displayedPpmps = this.ppmpData.filter(ppmp => 
      ppmp.project_name.toLowerCase().includes(searchTerm) //||
      // ppmp.requested_items.some(item => item.toLowerCase().includes(searchTerm))
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedPpmps.length / this.itemsPerPage);
  }
}
