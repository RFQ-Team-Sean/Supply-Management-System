import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  selector: 'app-performance-viewreport',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-viewreport.component.html',
  styleUrl: './performance-viewreport.component.css'
})
export class PerformanceViewreportComponent {
  @Input() spm!: SPM;
  @Output() closeModal = new EventEmitter<void>();

  onClose() {
    this.closeModal.emit();
  }

  onConfirm() {
    this.closeModal.emit();
  }
}
