import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-sample-page',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './sample-page.component.html',
})
export class AppSamplePageComponent {
  displayedColumns: string[] = ['number', 'requestor', 'department', 'item', 'amount', 'date', 'actions'];
  pendingRequests = [
    { number: 'PR-101', requestor: 'Alice Johnson', department: 'HR', item: 'Laptop', amount: 1200, date: '2025-01-15' },
    { number: 'PR-102', requestor: 'Bob Smith', department: 'IT', item: 'Cardboard', amount: 5000, date: '2025-01-16' },
    { number: 'PR-103', requestor: 'JJ Johnson', department: 'HR', item: 'Laptop', amount: 1200, date: '2025-01-15' },
    { number: 'PR-104', requestor: 'Bob Marley', department: 'IT', item: 'Cardboard', amount: 5000, date: '2025-01-16' },
    { number: 'PR-105', requestor: 'Alice Gou', department: 'HR', item: 'Laptop', amount: 1200, date: '2025-01-15' },
    { number: 'PR-106', requestor: 'Joshua Smith', department: 'IT', item: 'Cardboard', amount: 5000, date: '2025-01-16' },
    { number: 'PR-107', requestor: 'Anton Johnson', department: 'HR', item: 'Laptop', amount: 1200, date: '2025-01-15' },
    { number: 'PR-108', requestor: 'Kenneth Smith', department: 'IT', item: 'Cardboard', amount: 5000, date: '2025-01-16' }
  ];

  accept(pr: any) {
    console.log(`Accepted PR: ${pr.number}`);
  }

  deny(pr: any) {
    console.log(`Denied PR: ${pr.number}`);
  }
}
