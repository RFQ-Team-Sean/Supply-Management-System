import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../core/services/supabase.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-gso-viewppmp',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gso-viewppmp.component.html',
  styleUrls: ['./gso-viewppmp.component.css']
})
export class GsoViewppmpComponent implements OnInit {
  @Input() isModalOpen: boolean = false;
  @Input() projectId: number | null = null;
  @Output() modalClosed = new EventEmitter<void>();
  @Output() approvePpmp = new EventEmitter<void>();
  @Output() rejectPpmp = new EventEmitter<void>();

  ppmpData: any = null;
  ppmpItems: any[] = [];
  categories: any[] = [];
  @ViewChild('reportContent') reportContent!: ElementRef;

  constructor(
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    if (this.projectId !== null) {
      this.loadPpmpData();
      this.loadPpmpItems();
    }
  }

  async loadPpmpData(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpById(this.projectId);
      if (error) {
        console.error('Error fetching PPMP data:', error);
      } else {
        this.ppmpData = data;
      }
    }
  }

  async loadPpmpItems(): Promise<void> {
    if (this.projectId !== null) {
      const { data, error } = await this.supabaseService.getPpmpItemsByProjectId(this.projectId);
      if (error) {
        console.error('Error fetching PPMP items:', error);
      } else {
        this.ppmpItems = data;
        this.categorizeItems();
      }
    }
  }

  categorizeItems(): void {
    const categoriesMap: { [key: string]: any } = {};
    this.ppmpItems.forEach(item => {
      if (!categoriesMap[item.category]) {
        categoriesMap[item.category] = {
          name: item.category,
          items: [],
          totalAmount: 0
        };
      }
      categoriesMap[item.category].items.push(item);
      categoriesMap[item.category].totalAmount += item.total_cost;
    });
    this.categories = Object.values(categoriesMap);
  }

  async downloadPDF(): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const content = this.reportContent.nativeElement;

    // Hide the buttons before generating the PDF
    const buttons = content.querySelectorAll('button');
    buttons.forEach((button: HTMLButtonElement) => button.style.display = 'none');

    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    doc.save('PPMP_Report.pdf');

    // Show the buttons again after generating the PDF
    buttons.forEach((button: HTMLButtonElement) => button.style.display = 'inline-flex');
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal();
    }
  }

  handleApprovePpmp(): void {
    this.approvePpmp.emit();
  }

  handleRejectPpmp(): void {
    this.rejectPpmp.emit();
  }

  trackByIndex(index: number): number {
    return index;
  }
}