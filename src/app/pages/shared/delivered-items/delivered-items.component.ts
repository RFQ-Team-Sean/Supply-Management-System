import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { DeliveredItemsService } from '../../../services/delivered-items.service';
import { DeliveredItem, DeliveryItem } from './delivered-items.interface';
import { ChecklistModalComponent } from './checklist-modal.component';
import { RejectModalComponent } from './reject-modal.component';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-delivered-items',
  templateUrl: './delivered-items.component.html',
  styleUrls: ['./delivered-items.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatButtonModule
  ]
})
export class DeliveredItemsComponent implements OnInit {
  searchValue: string = '';
  dataSource = new MatTableDataSource<DeliveredItem>();
  displayedColumns: string[] = ['supplier', 'dateDelivered', 'department', 'status', 'actions'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalItems: number = 0;
  totalCheckedItems: number = 0;

  constructor(
    private dialog: MatDialog,
    private deliveredItemsService: DeliveredItemsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadDeliveredItems();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadDeliveredItems() {
    this.deliveredItemsService.getDeliveredItems().subscribe(items => {
      this.dataSource.data = items;
      this.updateTotals();
    });
  }

  updateTotals() {
    this.totalItems = this.dataSource.data.reduce((acc, item) => 
      acc + (item.items?.length ?? 0), 0);
    this.totalCheckedItems = this.dataSource.data.reduce((acc, item) => 
      acc + (item.items?.filter(i => i.isDelivered).length ?? 0), 0);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getChecklistIcon(item: DeliveredItem): string {
    if (item.status !== 'pending') {
      return item.status === 'accepted' ? 'check_circle' : 'cancel';
    }
    if (!item.items?.length) return 'assignment';
    const allChecked = item.items.every(i => i.isDelivered);
    const someChecked = item.items.some(i => i.isDelivered);
    
    if (allChecked) return 'assignment_turned_in';
    if (someChecked) return 'assignment_late';
    return 'assignment';
  }

  getChecklistIconColor(item: DeliveredItem): string {
    if (item.status !== 'pending') {
      return item.status === 'accepted' ? 'text-green-600' : 'text-red-600';
    }
    if (!item.items?.length) return 'text-gray-400';
    const allChecked = item.items.every(i => i.isDelivered);
    const someChecked = item.items.some(i => i.isDelivered);
    
    if (allChecked) return 'text-green-600';
    if (someChecked) return 'text-yellow-600';
    return 'text-blue-600';
  }

  getChecklistTooltip(item: DeliveredItem): string {
    if (item.status !== 'pending') {
      return `Delivery ${item.status}`;
    }
    if (!item.items?.length) return 'View Checklist';
    const checkedCount = item.items.filter(i => i.isDelivered).length;
    return `${checkedCount}/${item.items.length} items checked`;
  }

  canGenerateDocuments(item: DeliveredItem): boolean {
    return item.items?.every(i => i.isDelivered) ?? false;
  }

  viewChecklist(item: DeliveredItem) {
    const dialogRef = this.dialog.open(ChecklistModalComponent, {
      width: '800px',
      data: { ...item }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deliveredItemsService.updateDeliveryItems(item.id, result.items)
          .subscribe(() => {
            this.loadDeliveredItems();
            this.snackBar.open('Checklist updated successfully', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          });
      }
    });
  }

  generateDocuments(item: DeliveredItem) {
    if (!this.canGenerateDocuments(item)) {
      this.snackBar.open('Please complete the checklist before generating documents', 'Close', {
        duration: 3000
      });
      return;
    }

    forkJoin([
      this.deliveredItemsService.generateDeliveryReceipt(item.id),
      this.deliveredItemsService.generateInspectionReport(item.id)
    ]).subscribe(([receiptBlob, reportBlob]) => {
      const receiptUrl = window.URL.createObjectURL(receiptBlob);
      const reportUrl = window.URL.createObjectURL(reportBlob);
      
      const receiptLink = document.createElement('a');
      receiptLink.href = receiptUrl;
      receiptLink.download = `delivery-receipt-${item.id}.pdf`;
      receiptLink.click();

      const reportLink = document.createElement('a');
      reportLink.href = reportUrl;
      reportLink.download = `inspection-report-${item.id}.pdf`;
      reportLink.click();

      this.snackBar.open('Documents generated successfully', 'Close', {
        duration: 3000
      });
    });
  }

  acceptDelivery(item: DeliveredItem) {
    if (!this.canGenerateDocuments(item)) {
      this.snackBar.open('Please complete the checklist before accepting the delivery', 'Close', {
        duration: 3000
      });
      return;
    }

    this.deliveredItemsService.acceptDelivery(item.id).subscribe(() => {
      this.loadDeliveredItems();
      this.generateDocuments(item);
      this.snackBar.open('Delivery accepted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    });
  }

  rejectDelivery(item: DeliveredItem) {
    const dialogRef = this.dialog.open(RejectModalComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason) {
        this.deliveredItemsService.rejectDelivery(item.id, reason)
          .subscribe(() => {
            this.loadDeliveredItems();
            this.snackBar.open('Delivery rejected', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
          });
      }
    });
  }

  getDepartmentClass(department: string): string {
    switch (department.toLowerCase()) {
      case 'it':
        return 'bg-blue-100 text-blue-800';
      case 'hr':
        return 'bg-purple-100 text-purple-800';
      case 'finance':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }
}