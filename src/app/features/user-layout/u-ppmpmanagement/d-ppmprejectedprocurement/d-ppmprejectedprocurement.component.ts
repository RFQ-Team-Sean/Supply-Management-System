import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/services/supabase.service';

interface PPMP {
  project_id: number;
  project_name: string;
  requested_items: string;
  total_budget: number;
  date_rejected: string | null;
  status: string;
}

@Component({
  selector: 'app-d-ppmprejectedprocurement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './d-ppmprejectedprocurement.component.html',
  styleUrl: './d-ppmprejectedprocurement.component.css'
})
export class DPpmprejectedprocurementComponent implements OnInit {
  ppmpData: PPMP[] = [];
  displayedPpmps: PPMP[] = [];
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  currentOpenActionId: number | null = null;

  // booleans
  isLoading: boolean = true;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit(): void {
    this.loadPpmpRecords();
  }

  async loadPpmpRecords() {
    this.isLoading = true;
    const data = await this.supabaseService.getPPMPManagementData('Rejected');
    if (data) {
      this.ppmpData = data;
    }
    this.isLoading = false;
    this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
    this.updateDisplayedPpmps();
  }

  updateDisplayedPpmps() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPpmps = this.ppmpData.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
  }

  searchLogs(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.displayedPpmps = this.ppmpData.filter(ppmp => 
      ppmp.project_name.toLowerCase().includes(searchTerm)
    );
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.displayedPpmps.length / this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedPpmps();
    }
  }

  toggleActions(ppmp: PPMP) {
    this.currentOpenActionId = this.currentOpenActionId === ppmp.project_id ? null : ppmp.project_id;
  }

  viewPpmp(ppmp: PPMP) {
    console.log('Viewing PPMP:', ppmp);
    // Implement view logic
  }

  editPpmp(ppmp: PPMP) {
    console.log('Editing PPMP:', ppmp);
    // Implement edit logic
  }

  resubmitPpmp(ppmp: PPMP) {
    console.log('Resubmitting PPMP:', ppmp);
    // Implement resubmit logic
  }
}
