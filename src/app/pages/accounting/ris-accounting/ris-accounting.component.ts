import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Tooltip } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-ris-accounting',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, CardModule, Tooltip, Toast],
  templateUrl: './ris-accounting.component.html',
  styleUrls: ['./ris-accounting.component.scss'],
  providers: [MessageService]
})
export class RisAccountingComponent {
  slips = [
    {
      risNumber: 'RIS-001',
      user: 'John Doe',
      department: 'Finance',
      date: '2023-10-01',
      item: 'Laptop',
      quantity: 1
    },
    {
      risNumber: 'RIS-002',
      user: 'Jane Smith',
      department: 'HR',
      date: '2023-10-02',
      item: 'Mouse',
      quantity: 5
    }
    // Add more slips as needed
  ];

  constructor(private messageService: MessageService) {}

  onApprove(slip: any) {
    // Your approval logic here
    this.messageService.add({severity:'success', summary: 'Approved', detail: `The slip ${slip.risNumber} has been approved.`});
  }

  onReject(slip: any) {
    // Your rejection logic here
    this.messageService.add({severity:'error', summary: 'Rejected', detail: `The slip ${slip.risNumber} has been rejected.`});
  }
}