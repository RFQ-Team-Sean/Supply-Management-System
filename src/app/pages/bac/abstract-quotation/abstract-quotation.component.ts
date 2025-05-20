// abstract-quotation.component.ts
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

interface Project {
  referenceNumber: string;
  name: string;
  location: string;
  approvedBudget: number;
}

interface Bidder {
  name: string;
  totalBidAmount: number;
  bidSecurity: {
    bankCompany: string;
    number: string;
    validity: Date;
    amount: number;
  };
  requiredBidSecurity: number;
  sufficient: boolean;
  remarks: string;
}

interface AbstractQuotation {
  id: string;
  projectReferenceNumber: string;
  projectName: string;
  projectLocation: string;
  approvedBudget: number;
  date: Date;
  time: string;
  bidders: Bidder[];
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-abstract-quotation',
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
  templateUrl: './abstract-quotation.component.html',
  styleUrl: './abstract-quotation.component.scss',
  providers: [MessageService],
})
export class AbstractQuotationComponent implements OnInit {

  statusOptions = [
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' }
  ];

  

  searchQuery = '';
  displayDialog = false;
  displayViewDialog = false;
  abstracts: AbstractQuotation[] = [];
  filteredAbstracts: AbstractQuotation[] = [];
  projects: Project[] = [];
  selectedAbstract: AbstractQuotation | null = null;

  abstractToUpdate: AbstractQuotation | null = null;

  newAbstract: AbstractQuotation = this.getEmptyAbstract();

  displayStatusDialog = false;
 

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadProjects();
    this.loadAbstracts();
  }

  getEmptyAbstract(): AbstractQuotation {
    return {
      id: '',
      projectReferenceNumber: '',
      projectName: '',
      projectLocation: '',
      approvedBudget: 0,
      date: new Date(),
      time: '',
      bidders: [],
      status: 'Pending'
    };
  }

  loadProjects() {
    // Simulated projects data
    this.projects = [
      {
        referenceNumber: 'PRJ-2024-001',
        name: 'School Building Project',
        location: 'Metro Manila',
        approvedBudget: 1500000
      },
      {
        referenceNumber: 'PRJ-2024-002',
        name: 'Road Construction',
        location: 'Cebu City',
        approvedBudget: 2500000
      }
    ];
  }

  loadAbstracts() {
    const storedAbstracts = localStorage.getItem('abstracts');
    if (storedAbstracts) {
      this.abstracts = JSON.parse(storedAbstracts);
      // Convert string dates back to Date objects
      this.abstracts = this.abstracts.map(abstract => ({
        ...abstract,
        date: new Date(abstract.date),
        bidders: abstract.bidders.map(bidder => ({
          ...bidder,
          bidSecurity: {
            ...bidder.bidSecurity,
            validity: new Date(bidder.bidSecurity.validity)
          }
        }))
      }));
      this.filteredAbstracts = [...this.abstracts];
    } else {
      // Initialize with sample data
      this.abstracts = [
        {
          id: 'ABS-2024-001',
          projectReferenceNumber: 'PRJ-2024-001',
          projectName: 'School Building Project',
          projectLocation: 'Metro Manila',
          approvedBudget: 1500000,
          date: new Date(),
          time: '10:00',
          bidders: [
            {
              name: 'Bidder 1',
              totalBidAmount: 1400000,
              bidSecurity: {
                bankCompany: 'ABC Bank',
                number: 'SEC-001',
                validity: new Date('2024-12-31'),
                amount: 140000
              },
              requiredBidSecurity: 140000,
              sufficient: true,
              remarks: 'Complete requirements'
            }
          ],
          status: 'Pending'
        }
      ];
      this.filteredAbstracts = [...this.abstracts];
      this.saveAbstracts();
    }
  }

  saveAbstracts() {
    localStorage.setItem('abstracts', JSON.stringify(this.abstracts));
  }

  filterAbstracts() {
    this.filteredAbstracts = this.abstracts.filter((abstract) =>
      Object.values(abstract).some((value) =>
        value?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  onProjectSelect(event: any) {
    const selectedProject = this.projects.find(
      (p) => p.referenceNumber === event.value
    );
    if (selectedProject) {
      this.newAbstract.projectName = selectedProject.name;
      this.newAbstract.projectLocation = selectedProject.location;
      this.newAbstract.approvedBudget = selectedProject.approvedBudget;
    }
  }

  addBidder() {
    const newBidder: Bidder = {
      name: '',
      totalBidAmount: 0,
      bidSecurity: {
        bankCompany: '',
        number: '',
        validity: new Date(),
        amount: 0
      },
      requiredBidSecurity: 0,
      sufficient: false,
      remarks: ''
    };
    this.newAbstract.bidders.push(newBidder);
  }

  removeBidder(index: number) {
    this.newAbstract.bidders.splice(index, 1);
  }

  showDialog() {
    this.displayDialog = true;
    this.newAbstract = this.getEmptyAbstract();
  }

  cancelDialog() {
    this.displayDialog = false;
    this.newAbstract = this.getEmptyAbstract();
  }

  // First, let's update the submitAbstract() method to handle existing entries
submitAbstract() {
  if (!this.newAbstract.projectReferenceNumber || !this.newAbstract.date || !this.newAbstract.time) {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields.',
    });
    return;
  }

  if (this.newAbstract.bidders.length === 0) {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please add at least one bidder.',
    });
    return;
  }

  // Check if an abstract with this project reference already exists
  const existingAbstractIndex = this.abstracts.findIndex(
    a => a.projectReferenceNumber === this.newAbstract.projectReferenceNumber
  );

  if (existingAbstractIndex !== -1) {
    // Update existing abstract by adding new bidders
    const existingAbstract = this.abstracts[existingAbstractIndex];
    
    // Add new bidders to the existing abstract
    this.newAbstract.bidders.forEach(bidder => {
      existingAbstract.bidders.push(bidder);
    });
    
    // Update the date and time if needed
    existingAbstract.date = this.newAbstract.date;
    existingAbstract.time = this.newAbstract.time;
    
    // Update the abstract in the array
    this.abstracts[existingAbstractIndex] = existingAbstract;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Abstract Updated',
      detail: 'Bidders have been added to the existing Abstract of Quotation.',
    });
  } else {
    // Create a new abstract
    const abstract = {
      ...this.newAbstract,
      id: `ABS-${new Date().getFullYear()}-${String(this.abstracts.length + 1).padStart(3, '0')}`,
    };

    this.abstracts.unshift(abstract);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Abstract Created',
      detail: 'Abstract of Quotation has been created successfully.',
    });
  }
  
  this.filterAbstracts();
  this.saveAbstracts();
  this.displayDialog = false;
  this.newAbstract = this.getEmptyAbstract();
}

  viewDetails(abstract: AbstractQuotation) {
    this.selectedAbstract = { ...abstract };
    this.displayViewDialog = true;
  }

  closeViewDialog() {
    this.displayViewDialog = false;
    this.selectedAbstract = null;
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

  changeStatus() {
    if (!this.abstractToUpdate) return;

    const index = this.abstracts.findIndex(a => a.id === this.abstractToUpdate!.id);
    if (index !== -1) {
      this.abstracts[index].status = this.abstractToUpdate.status;
      this.filteredAbstracts = [...this.abstracts];
      this.saveAbstracts();
      this.messageService.add({
        severity: 'success',
        summary: 'Status Updated',
        detail: `Status changed to ${this.abstractToUpdate.status}`,
      });
    }
    this.displayStatusDialog = false;
    this.abstractToUpdate = null;
  }

  showStatusDialog(abstract: AbstractQuotation) {
    this.abstractToUpdate = { ...abstract };
    this.displayStatusDialog = true;
  }


}