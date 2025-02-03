import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';
import { DViewppmpprocurementComponent } from "../../user-layout/u-ppmpmanagement/d-viewppmpprocurement/d-viewppmpprocurement.component";

interface PPMP {
  project_id: number;
  project_name: string;
  requested_items: string;
  total_budget: number;
  date_created: string;
  status: string;
}

@Component({
  selector: 'app-gso-ppmpentry',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DViewppmpprocurementComponent
],
  templateUrl: './gso-ppmpentry.component.html',
  styleUrls: ['./gso-ppmpentry.component.css']
})
export class GsoPpmpentryComponent implements OnInit {
filterPpmp() {
throw new Error('Method not implemented.');
}
  ppmpData: PPMP[] = [];
  displayedPpmp: PPMP[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  currentOpenActionId: number | null = null;
  isLoading: boolean = true;
  showViewModal: boolean = false;
  selectedProjectId: number | null = null;
searchTerm: any;

  constructor(
    private router: Router,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.loadSubmittedPpmpRecords();
  }

  async loadSubmittedPpmpRecords() {
    this.isLoading = true;
    const data = await this.supabaseService.getPendingGsoPpmps();
    // console.log('data is: ', data);
    if (data) {
      this.ppmpData = data;
      this.totalPages = Math.ceil(this.ppmpData.length / this.itemsPerPage);
      this.updateDisplayedPpmp();
    }
    this.isLoading = false;
  }

  updateDisplayedPpmp(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.displayedPpmp = this.ppmpData.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedPpmp();
  }

  toggleActions(ppmp: PPMP): void {
    this.currentOpenActionId = this.currentOpenActionId === ppmp.project_id ? null : ppmp.project_id;
  }

  viewPpmp(ppmp: PPMP): void {
    this.selectedProjectId = ppmp.project_id;
    this.showViewModal = true;
  }

  approvePpmp(ppmp: PPMP): void {
    ppmp.status = 'Approved';
    // Here you would typically call a service method to update the status in the database
    this.updateDisplayedPpmp();
  }

  rejectPpmp(ppmp: PPMP): void {
    ppmp.status = 'Rejected';
    // Here you would typically call a service method to update the status in the database
    this.updateDisplayedPpmp();
  }
}