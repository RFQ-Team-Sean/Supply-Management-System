import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';

interface CompletionCertificate {
  id: string;
  referenceNo: string;
  contractorName: string;
  projectTitle: string;
  contractAmount: number;
  completionDate: Date;
  inspectionDate: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
  inspectionFindings: string;
  supportingDocs: boolean;
  remarks: string;
}

@Component({
  selector: 'app-completion',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    FileUploadModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './completion.component.html',
  styleUrl: './completion.component.scss',
  providers: [MessageService],
})
export class CompletionComponent implements OnInit {
  searchQuery = '';
  displayDialog = false;

  certificates: CompletionCertificate[] = [];
  filteredCertificates: CompletionCertificate[] = [];

  newCertificate: CompletionCertificate = {
    id: '',
    referenceNo: '',
    contractorName: '',
    projectTitle: '',
    contractAmount: 0,
    completionDate: new Date(),
    inspectionDate: new Date(),
    status: 'Pending',
    inspectionFindings: '',
    supportingDocs: false,
    remarks: '',
  };

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadCertificates();
  }

  loadCertificates() {
    const storedCertificates = localStorage.getItem('certificates');
    if (storedCertificates) {
      this.certificates = JSON.parse(storedCertificates);
      this.filteredCertificates = [...this.certificates];
    } else {
      // Initialize with default data if no data is found in localStorage
      this.certificates = [
        {
          id: 'CCA-2024-001',
          referenceNo: 'PO-2024-001',
          contractorName: 'ABC Construction',
          projectTitle: 'School Building Renovation',
          contractAmount: 1500000,
          completionDate: new Date('2024-02-01'),
          inspectionDate: new Date('2024-02-05'),
          status: 'Pending',
          inspectionFindings: 'All requirements met',
          supportingDocs: true,
          remarks: 'Awaiting final approval'
        },
        {
          id: 'CCA-2024-002',
          referenceNo: 'PO-2024-002',
          contractorName: 'XYZ Builders',
          projectTitle: 'Highway Expansion Project',
          contractAmount: 5000000,
          completionDate: new Date('2024-03-15'),
          inspectionDate: new Date('2024-03-20'),
          status: 'Approved',
          inspectionFindings: 'Minor issues resolved',
          supportingDocs: true,
          remarks: 'Project completed successfully'
        },
        {
          id: 'CCA-2024-003',
          referenceNo: 'PO-2024-003',
          contractorName: 'Green Earth Developers',
          projectTitle: 'Eco-Friendly Housing Complex',
          contractAmount: 3000000,
          completionDate: new Date('2024-01-10'),
          inspectionDate: new Date('2024-01-15'),
          status: 'Rejected',
          inspectionFindings: 'Incomplete documentation',
          supportingDocs: false,
          remarks: 'Resubmit with proper documentation'
        },
        {
          id: 'CCA-2024-004',
          referenceNo: 'PO-2024-004',
          contractorName: 'Tech Innovators Ltd.',
          projectTitle: 'Smart City Infrastructure',
          contractAmount: 10000000,
          completionDate: new Date('2024-04-01'),
          inspectionDate: new Date('2024-04-10'),
          status: 'Pending',
          inspectionFindings: 'Pending final review',
          supportingDocs: true,
          remarks: 'Under review by the committee'
        },
        {
          id: 'CCA-2024-005',
          referenceNo: 'PO-2024-005',
          contractorName: 'Urban Designers',
          projectTitle: 'Shopping Mall Construction',
          contractAmount: 7500000,
          completionDate: new Date('2024-05-01'),
          inspectionDate: new Date('2024-05-05'),
          status: 'Approved',
          inspectionFindings: 'All standards met',
          supportingDocs: true,
          remarks: 'Project completed on time'
        },
        {
          id: 'CCA-2024-006',
          referenceNo: 'PO-2024-006',
          contractorName: 'Riverfront Developers',
          projectTitle: 'Riverfront Beautification Project',
          contractAmount: 2000000,
          completionDate: new Date('2024-06-01'),
          inspectionDate: new Date('2024-06-10'),
          status: 'Pending',
          inspectionFindings: 'Pending final inspection',
          supportingDocs: false,
          remarks: 'Awaiting final inspection report'
        },
        {
          id: 'CCA-2024-007',
          referenceNo: 'PO-2024-007',
          contractorName: 'Skyline Constructions',
          projectTitle: 'Office Tower Construction',
          contractAmount: 12000000,
          completionDate: new Date('2024-07-01'),
          inspectionDate: new Date('2024-07-15'),
          status: 'Rejected',
          inspectionFindings: 'Structural issues identified',
          supportingDocs: false,
          remarks: 'Needs rework and resubmission'
        },
        {
          id: 'CCA-2024-008',
          referenceNo: 'PO-2024-008',
          contractorName: 'Heritage Restorations',
          projectTitle: 'Historical Monument Restoration',
          contractAmount: 2500000,
          completionDate: new Date('2024-08-01'),
          inspectionDate: new Date('2024-08-10'),
          status: 'Approved',
          inspectionFindings: 'Restoration completed as per guidelines',
          supportingDocs: true,
          remarks: 'Project approved by heritage committee'
        },
        {
          id: 'CCA-2024-009',
          referenceNo: 'PO-2024-009',
          contractorName: 'Future Tech Constructions',
          projectTitle: 'Data Center Construction',
          contractAmount: 8000000,
          completionDate: new Date('2024-09-01'),
          inspectionDate: new Date('2024-09-15'),
          status: 'Pending',
          inspectionFindings: 'Pending final approval',
          supportingDocs: true,
          remarks: 'Under review by the technical team'
        },
        {
          id: 'CCA-2024-010',
          referenceNo: 'PO-2024-010',
          contractorName: 'Oceanview Developers',
          projectTitle: 'Beach Resort Construction',
          contractAmount: 6000000,
          completionDate: new Date('2024-10-01'),
          inspectionDate: new Date('2024-10-10'),
          status: 'Approved',
          inspectionFindings: 'All requirements met',
          supportingDocs: true,
          remarks: 'Project completed successfully'
        }
      ];
      this.filteredCertificates = [...this.certificates];
      this.saveCertificates();
    }
  }

  saveCertificates() {
    localStorage.setItem('certificates', JSON.stringify(this.certificates));
  }

  filterCertificates() {
    this.filteredCertificates = this.certificates.filter((cert) =>
      Object.values(cert).some((value) =>
        value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  showDialog() {
    this.displayDialog = true;
    this.newCertificate = {
      id: '',
      referenceNo: '',
      contractorName: '',
      projectTitle: '',
      contractAmount: 0,
      completionDate: new Date(),
      inspectionDate: new Date(),
      status: 'Pending',
      inspectionFindings: '',
      supportingDocs: false,
      remarks: '',
    };
  }

  submitCertificate() {
    if (!this.newCertificate.referenceNo || !this.newCertificate.contractorName || !this.newCertificate.projectTitle) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
      });
      return;
    }
  
    const certificate = {
      ...this.newCertificate,
      id: `CCA-${new Date().getFullYear()}-${String(this.certificates.length + 1).padStart(3, '0')}`,
      status: 'Pending',
    };
  
    this.certificates.unshift(certificate as CompletionCertificate);
    this.filterCertificates();
    this.saveCertificates();
  
    this.messageService.add({
      severity: 'success',
      summary: 'Certificate Created',
      detail: 'Certificate of Completion and Acceptance has been created successfully.',
    });
  
    this.displayDialog = false;
  }
  

  onFileUpload(event: any) {
    if (event.files && event.files.length > 0) {
      this.newCertificate.supportingDocs = true; // Set supportingDocs to true
      this.messageService.add({
        severity: 'info',
        summary: 'File Uploaded',
        detail: `File "${event.files[0].name}" uploaded successfully.`,
      });
    } else {
      this.newCertificate.supportingDocs = false;
    }
  }
  

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-300';
      case 'Approved':
        return 'bg-green-300';
      case 'Rejected':
        return 'bg-red-300';
      default:
        return 'bg-gray-500';
    }
  }
}