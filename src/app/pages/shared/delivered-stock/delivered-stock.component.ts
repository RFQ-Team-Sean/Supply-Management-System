import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextarea } from 'primeng/inputtextarea';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CalendarModule } from 'primeng/calendar';
import { DeliveryService } from 'src/app/services/delivery.service';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { DeliveryStatus, DeliverySubStatus, StockDetail, DeliveredStock } from 'src/app/schema/schema';
import { deliveredStocks } from 'src/app/schema/inventory-dummydata';
import { environment } from 'src/environment/environment';
import { InputNumberModule } from 'primeng/inputnumber';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/services/notifications.service';

// Local storage key for delivered stocks - defined in delivery.service.ts
const DELIVERED_STOCKS_KEY = 'deliveredStocks';

@Component({
  selector: 'app-delivered-stock',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    TagModule,
    ToastModule,
    MatCardModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    ConfirmDialogModule,
    CheckboxModule,
    InputGroupModule,
    InputGroupAddonModule,
    CalendarModule,
    InputTextarea,
    InputNumberModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './delivered-stock.component.html',
  styleUrls: ['./delivered-stock.component.scss']
})
export class DeliveredStockComponent implements OnInit, OnDestroy {
  @ViewChild('dt') dt!: Table;
  
  deliveredStocks: DeliveredStock[] = [];
  private subscription = new Subscription();
  filteredDeliveredStocks: any[] = [];
  activeStatus: string = 'Under Delivery';
  showDetailsDialog: boolean = false;
  selectedStock: DeliveredStock | null = null;
  selectedStockDetails: StockDetail[] = [];
  showPODialog: boolean = false;
  cancelRemarks: string = '';
  showCancelDialog: boolean = false;
  selectedStockForCancel: DeliveredStock | null = null;
  loading = false;
  searchValue: string = '';
  currentYear = new Date().getFullYear();
  requestedByName: string = '';
  requestedByPosition: string = '';
  receivedByName: string = '';
  receivedByPosition: string = '';
  showAcknowledgementDialog: boolean = false;
  selectedCompletedStock: DeliveredStock | null = null;
  showReturnDialog: boolean = false;
  selectedReturnedStock: DeliveredStock | null = null;
  showCancelledDialog: boolean = false;
  selectedCancelledStock?: DeliveredStock;
  cancelledBy: string = '';
  cancellerPosition: string = '';
  cancellationDate: Date = new Date();
  showCancellationDetailsDialog: boolean = false;
  isEndUser: boolean = false;
  showReturnRemarks: boolean = false;
  returnRemarks: string = '';
  showIncompleteDetailsDialog: boolean = false;
  selectedIncompleteStock: DeliveredStock | null = null;
  showMissingItemsDialog: boolean = false;
  selectedItemForMissing: StockDetail | null = null;
  selectedItemForRemarks: StockDetail | null = null;
  showRemarksDialog: boolean = false;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private deliveryService: DeliveryService,
    private userService: UserService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    
    // Check if user is enduser
    const user = this.userService.getUser();
    this.isEndUser = user?.role === 'enduser';

    // For endusers, always set activeStatus to Under Delivery
    if (this.isEndUser) {
      this.activeStatus = 'Under Delivery';
    } else {
      // For non-endusers, set to Completed by default to show completed, incomplete and returned items
      this.activeStatus = 'Completed';
    }

    // Force reload data from localStorage/server to get fresh data
    this.deliveryService.loadDeliveredStocks().then(() => {
      // Subscribe to the delivered stocks
      this.subscription.add(
        this.deliveryService.deliveredStocks$.subscribe(stocks => {
          this.deliveredStocks = stocks;
          
          // Log all stocks for debugging
          console.log('Loaded deliveredStocks:', this.deliveredStocks.length);
          console.log('Status breakdown:', 
            this.deliveredStocks.reduce((acc, stock) => {
              acc[stock.status] = (acc[stock.status] || 0) + 1;
              return acc;
            }, {} as Record<string, number>));
          
          // Filter based on active status
          this.filterByStatus(this.activeStatus);
          
          this.loading = false;
          
          // Check for request-based deliveries
          this.checkForRequestDeliveries();
        })
      );
    });

    // Ensure the BehaviorSubject always holds the latest data even after component re-initialization
    if (environment.use === 'local') {
      const storedStocks = localStorage.getItem(DELIVERED_STOCKS_KEY);
      if (storedStocks) {
        try {
          // Force reload in case localStorage was modified outside this component
          this.deliveryService.loadDeliveredStocks();
        } catch (e) {
          console.error('Error loading data from localStorage:', e);
        }
      }
    }
  }

  private checkForRequestDeliveries() {
    // Check if we've been redirected from a request item delivery
    // If so, we can look for deliveries with requisitionNumber matching a RIS format
    const deliveriesFromRequests = this.deliveredStocks.filter(
      stock => stock.requisitionNumber && stock.requisitionNumber.startsWith('RIS-')
    );
    
    if (deliveriesFromRequests.length > 0) {
      // Ensure we're showing all request-based deliveries
    this.filterByStatus('Under Delivery');
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filterByStatus(status: string) {
    this.activeStatus = status;
    
    if (this.isEndUser) {
      // For enduser, only show Under Delivery
      this.filteredDeliveredStocks = this.deliveredStocks.filter(stock => 
        stock.status === 'Under Delivery'
      );
    } else {
      // Original filtering for non-enduser
    this.filteredDeliveredStocks = this.deliveredStocks.filter(stock => {
        // Debug each stock status
        console.log(`Filtering stock id=${stock.id}, status=${stock.status}, against active status=${status}`);
        
      if (status === 'Under Delivery') {
          return stock.status === 'Under Delivery';
      } else if (status === 'Completed') {
          // Show Completed, Returned, and Incomplete items in Delivered tab
          const result = stock.status === 'Completed' || 
                  stock.status === 'Returned' || 
                  stock.status === 'Incomplete';
                  
          // Debug why this item matches or doesn't match
          if (!result) {
            console.log(`Stock ${stock.id} with status ${stock.status} does not match Completed filter criteria`);
          } else {
            console.log(`Stock ${stock.id} with status ${stock.status} matches Completed filter criteria`);
          }
          
          return result;
        } else if (status === 'Cancelled') {
          return stock.status === 'Cancelled';
      } else {
        return stock.status === status;
      }
    });
    }
    
    // Log the statuses of all delivered stocks for debugging
    console.log('All stocks:', this.deliveredStocks.map(s => ({id: s.id, status: s.status, supplier: s.supplier})));
    console.log('Filtered stocks for status', status, ':', 
      this.filteredDeliveredStocks.map(s => ({id: s.id, status: s.status, supplier: s.supplier})));
    
    // Also log counts of each status type
    const statusCounts = this.deliveredStocks.reduce((acc, stock) => {
      acc[stock.status] = (acc[stock.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Status counts:', statusCounts);
  }

  isStatusActive(status: DeliveryStatus): boolean {
    return this.activeStatus === status;
  }

  getStatusSeverity(status: DeliveryStatus): string {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      case 'Rejected':
        return 'danger';
      case 'For Approval':
        return 'warning';
      default:
        return 'info';
    }
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Under Delivery': 'status-under-delivery',
      'Completed': 'status-completed',
      'Returned': 'status-returned',
      'Cancelled': 'status-cancelled',
      'Rejected': 'status-rejected',
      'Incomplete': 'status-incomplete'
    };
    return statusMap[status] || 'status-under-delivery';
  }

  getStatusIcon(status: DeliveryStatus, subStatus?: DeliverySubStatus): string {
    if (status === 'Under Delivery') {
      switch (subStatus) {
        case 'Preparing Items':
          return 'pi pi-box';
        case 'In Transit':
          return 'pi pi-truck';
        case 'Arrived':
          return 'pi pi-check-circle';
        case 'Verifying':
          return 'pi pi-sync';
        default:
          return 'pi pi-clock';
      }
    }

    switch (status) {
      case 'Completed':
        return 'pi pi-check-circle';
      case 'Cancelled':
        return 'pi pi-times-circle';
      case 'Rejected':
        return 'pi pi-ban';
      case 'For Approval':
        return 'pi pi-clock';
      default:
        return 'pi pi-clock';
    }
  }

  viewDetails(stock: DeliveredStock): void {
    if (this.isEndUser) {
      this.selectedStock = stock;
      this.selectedStockDetails = [...stock.details];
      this.showDetailsDialog = true;
      this.updateButtonsState();
    } else {
      this.router.navigate(['/shared/requisition-issue-slip', stock.id]);
    }
  }

  cancelDelivery(stock: DeliveredStock) {
    this.selectedStockForCancel = stock;
    this.cancelRemarks = '';
    this.showCancelDialog = true;
  }

  isValidCancellation(): boolean {
    return !!(this.cancelRemarks?.trim() && 
              this.cancelledBy?.trim() && 
              this.cancellerPosition?.trim() && 
              this.cancellationDate);
  }

  confirmCancel() {
    if (!this.isValidCancellation() || !this.selectedStockForCancel) return;

    // Create the cancellation details
    const cancellationDetails = {
      status: 'Cancelled' as DeliveryStatus,
      remarks: this.cancelRemarks,
      cancelledBy: this.cancelledBy,
      cancellerPosition: this.cancellerPosition,
      cancellationDate: this.cancellationDate
    };

    // Update the stock status through the service
    this.deliveryService.updateStatus(
      this.selectedStockForCancel.id, 
      'Cancelled',
      this.cancelRemarks
    ).then(() => {
      // Update the local stock object with cancellation details
      this.deliveryService.updateDeliveryDetails(
        this.selectedStockForCancel!.id,
        cancellationDetails
      ).then(() => {
        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Delivery cancelled successfully'
        });

        // Create notifications for the cancellation
        const cancelUser = this.userService.getUser();
        const cancelledBy = cancelUser?.fullname || cancelUser?.username || 'Administrator';
        
        // Notification to requester
        if (this.selectedStockForCancel && this.selectedStockForCancel.requestedBy) {
          this.notificationService.addNotification(
            `Your delivery (${this.selectedStockForCancel.receiptNo || this.selectedStockForCancel.id}) has been cancelled. Reason: ${this.cancelRemarks}`,
            'warning',
            this.selectedStockForCancel.requestedBy
          );
        }
        
        // Notification to the admin who took the action
        if (cancelUser) {
          this.notificationService.addNotification(
            `You cancelled delivery ${this.selectedStockForCancel?.receiptNo || this.selectedStockForCancel?.id}`,
            'info',
            cancelUser.username
          );
        }

        // Find the stock in the filtered array and update it
        const index = this.filteredDeliveredStocks.findIndex(s => s.id === this.selectedStockForCancel!.id);
        if (index !== -1) {
          this.filteredDeliveredStocks[index] = {
            ...this.filteredDeliveredStocks[index],
            ...cancellationDetails
          };
        }

        // Reset form and close dialog
        this.resetCancelForm();
        this.showCancelDialog = false;
        this.selectedStockForCancel = null;
      }).catch((error: Error) => {
        console.error('Error updating cancellation details:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update cancellation details'
        });
      });
    }).catch((error: Error) => {
      console.error('Error cancelling delivery:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to cancel delivery'
      });
    });
  }

  private resetCancelForm() {
      this.cancelRemarks = '';
    this.cancelledBy = '';
    this.cancellerPosition = '';
    this.cancellationDate = new Date();
  }

  hasReturnedItems(stock: DeliveredStock): boolean {
    return stock.details.some(detail => detail.deliveryStatus === 'Under Delivery');
  }

  /**
   * Save department remarks for a delivery
   */
  saveRemarks() {
    if (this.selectedStock?.status === 'Under Delivery' && this.selectedStock?.remarks) {
      // Save remarks through the delivery service
      this.deliveryService.updateDeliveryDetails(
        this.selectedStock.id,
        { remarks: this.selectedStock.remarks }
      ).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Department remarks have been saved successfully'
        });
      }).catch((error) => {
        console.error('Error saving remarks:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save remarks'
        });
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter remarks before saving'
      });
    }
  }

  getDetailStatusSeverity(status: DeliveryStatus): 'success' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Under Delivery':
        return 'warn';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: DeliveryStatus): string {
    return status;
  }

  isDeliveryComplete(stock: DeliveredStock): boolean {
    return stock.details.every(detail => 
      detail.isVerified && detail.deliveryStatus === 'Completed'
    );
  }

  isDeliveryPending(stock: DeliveredStock): boolean {
    return stock.details.every(detail => 
      detail.deliveryStatus === 'Under Delivery' || !detail.deliveryStatus
    );
  }

  onItemVerification(detail: StockDetail) {
    if (detail.isVerified) {
      detail.deliveryStatus = 'Completed';
      detail.dateReceived = new Date();
    } else {
      detail.deliveryStatus = 'Under Delivery';
      detail.dateReceived = undefined;
    }
  }

  /**
   * Handle item verification checkbox change
   */
  onItemVerificationChange(event: any, item: StockDetail, index: number) {
    // Update the item's verification status
    item.isVerified = event.checked;
    
    // Update delivery status and date
    if (item.isVerified) {
      item.deliveryStatus = 'Completed';
      item.dateReceived = new Date();
    } else {
      item.deliveryStatus = 'Under Delivery';
      item.dateReceived = undefined;
    }

    // Update the array reference to trigger change detection
    this.selectedStockDetails = [...this.selectedStockDetails];

    // Save the changes to the service if we have a selected stock
    if (this.selectedStock) {
      // Create a partial update with the modified details
      const updateData: Partial<DeliveredStock> = {
        details: this.selectedStockDetails
      };
      
      // Update the delivery details through the service
      this.deliveryService.updateDeliveryDetails(
        this.selectedStock.id,
        updateData
      ).then(() => {
        console.log('Item verification status updated successfully');
      }).catch((error) => {
        console.error('Error updating item verification status:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update item verification status'
        });
      });
    }

    // Update buttons state immediately
    this.updateButtonsState();
  }

  private updateButtonsState() {
    this.hasVerifiedItems();
    this.isAllItemsVerified(this.selectedStock);
  }

  isAllItemsVerified(stock: DeliveredStock | null): boolean {
    if (!stock) return false;
    return stock.details?.every(detail => detail.isVerified) || false;
  }

  hasVerifiedItems(): boolean {
    return this.selectedStockDetails?.some(item => item.isVerified) || false;
  }

  viewPurchaseOrder(stock: DeliveredStock) {
    if (this.isAllItemsVerified(stock)) {
      this.selectedStock = stock;
      this.showPODialog = true;
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Available',
        detail: 'Purchase Order will be available after all items are verified'
      });
    }
  }

  getSubtotal(): number {
    if (!this.selectedStock) return 0;
    return this.selectedStock.details.reduce((sum, item) => 
      sum + (item.quantity * (item.unitPrice ?? 0)), 0);
  }

  getTax(): number {
    return this.getSubtotal() * 0.12; // 12% tax rate
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  downloadPO() {
    // Implement PO download logic here
    this.messageService.add({
      severity: 'success',
      summary: 'Download Started',
      detail: `Purchase Order ${this.selectedStock?.poNumber} is being downloaded`
    });
  }

  markAsDelivered() {
    if (this.selectedStock) {
      this.selectedStock.status = 'Completed';
      this.selectedStock.details.forEach(detail => {
        if (detail.isVerified) {
          detail.deliveryStatus = 'Completed';
            detail.dateReceived = new Date();
        }
      });
      // Update service call here
    }
  }

  /**
   * Mark delivery as complete when all items are verified
   */
  completeDelivery() {
    if (!this.selectedStock || !this.isAllItemsVerified(this.selectedStock)) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to complete this delivery?',
      header: 'Complete Delivery',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (!this.selectedStock) return;
          
          const currentUser = this.userService.getUser();
          
          // Create the completion details
          const completionDetails = {
            status: 'Completed' as DeliveryStatus,
            statusUpdateTime: new Date(),
            receivedByName: this.receivedByName || (currentUser?.fullname || ''),
            receivedByPosition: this.receivedByPosition || (currentUser?.position || ''),
            dateReceived: new Date()
          };

          // Update the delivery status through the service
          await this.deliveryService.updateStatus(
            this.selectedStock.id,
            'Completed'
          );

          // Update additional details
          await this.deliveryService.updateDeliveryDetails(
            this.selectedStock.id,
            completionDetails
          );

          // Update the local object with the new values
          if (this.selectedStock) {
            this.selectedStock = {
              ...this.selectedStock,
              status: completionDetails.status,
              statusUpdateTime: completionDetails.statusUpdateTime
            };
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Delivery has been marked as completed'
          });
          
          // Create notifications for delivery completion
          const completionUser = this.userService.getUser();
          const completionBy = completionUser?.fullname || completionUser?.username || 'Administrator';
          
          // Notification to requester
          if (this.selectedStock && this.selectedStock.requestedBy) {
            this.notificationService.addNotification(
              `Your delivery (${this.selectedStock.receiptNo || this.selectedStock.id}) has been completed and received.`,
              'success',
              this.selectedStock.requestedBy
            );
          }
          
          // Notification to the user who took the action
          if (completionUser) {
            this.notificationService.addNotification(
              `You marked delivery ${this.selectedStock?.receiptNo || this.selectedStock?.id} as completed`,
              'info',
              completionUser.username
            );
          }

          // Force reload data to ensure we have the most up-to-date information
          await this.deliveryService.loadDeliveredStocks();
          
          // Close the dialog
          this.closeDetailsDialog();
        } catch (error) {
          console.error('Error completing delivery:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to complete delivery'
          });
        }
      }
    });
  }

  /**
   * Mark delivery as incomplete for items that aren't verified
   */
  markAsIncomplete() {
    if (!this.selectedStock || !this.hasUnverifiedItems(this.selectedStock)) return;

    this.confirmationService.confirm({
      message: 'Are you sure you want to mark this delivery as incomplete?',
      header: 'Mark Incomplete',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (!this.selectedStock) return;
          
          // Calculate delivered vs total items
          const totalItems = this.selectedStockDetails.reduce((sum, item) => sum + item.quantity, 0);
          const deliveredItems = this.selectedStockDetails.reduce((sum, item) => 
            sum + (item.deliveredQuantity || 0), 0);
          
          // Create incomplete delivery details
          const incompleteDetails = {
            status: 'Incomplete' as DeliveryStatus,
            statusUpdateTime: new Date(),
            remarks: `${deliveredItems} of ${totalItems} items received. Remaining items pending.`,
            followUpAction: 'Awaiting remaining items from supplier',
            deliveredItemCount: deliveredItems,
            totalItemCount: totalItems
          };

          // Update status through the service
          await this.deliveryService.updateStatus(
            this.selectedStock.id,
            'Incomplete'
          );

          // Update additional details
          await this.deliveryService.updateDeliveryDetails(
            this.selectedStock.id,
            incompleteDetails
          );

          // Update items' delivery status
          this.selectedStockDetails.forEach(item => {
            if (item.deliveredQuantity === item.quantity) {
              item.deliveryStatus = 'Completed';
              item.dateReceived = new Date();
            } else {
              item.deliveryStatus = 'Under Delivery';
            }
          });

          // Update the local stock object
          if (this.selectedStock) {
            this.selectedStock = {
              ...this.selectedStock,
              status: incompleteDetails.status,
              statusUpdateTime: incompleteDetails.statusUpdateTime,
              remarks: incompleteDetails.remarks,
              followUpAction: incompleteDetails.followUpAction
            };
          }

          this.messageService.add({
            severity: 'info',
            summary: 'Updated',
            detail: 'Delivery has been marked as incomplete'
          });
          
          // Create notifications for incomplete delivery
          const incompleteUser = this.userService.getUser();
          
          // Notification to requester
          if (this.selectedStock && this.selectedStock.requestedBy) {
            this.notificationService.addNotification(
              `Your delivery (${this.selectedStock.receiptNo || this.selectedStock.id}) has been marked as incomplete. ${incompleteDetails.remarks}`,
              'warning',
              this.selectedStock.requestedBy
            );
          }
          
          // Notification to the user who took the action
          if (incompleteUser) {
            this.notificationService.addNotification(
              `You marked delivery ${this.selectedStock?.receiptNo || this.selectedStock?.id} as incomplete`,
              'info',
              incompleteUser.username
            );
          }

          // Force reload data
          await this.deliveryService.loadDeliveredStocks();
          
          // Close the dialog
          this.closeDetailsDialog();
        } catch (error) {
          console.error('Error marking delivery as incomplete:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update delivery status'
          });
        }
      }
    });
  }

  showReturnSection() {
    this.showReturnRemarks = true;
  }

  /**
   * Process a return request
   */
  processReturn() {
    if (!this.selectedStock || !this.returnRemarks) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please provide return remarks'
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to return this delivery?',
      header: 'Return Delivery',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          if (!this.selectedStock) return;
          
          const currentUser = this.userService.getUser();
          
          // Create the return details
          const returnDetails = {
            status: 'Returned' as DeliveryStatus,
            statusUpdateTime: new Date(),
            remarks: this.returnRemarks,
            returnDate: new Date(),
            returnedBy: currentUser?.fullname || this.selectedStock.requestedBy || '',
            returnReason: this.returnRemarks
          };

          // Update status through the service
          await this.deliveryService.updateStatus(
            this.selectedStock.id,
            'Returned',
            this.returnRemarks
          );

          // Update additional details
          await this.deliveryService.updateDeliveryDetails(
            this.selectedStock.id,
            returnDetails
          );

          // Update the local stock object
          if (this.selectedStock) {
            this.selectedStock = {
              ...this.selectedStock,
              status: returnDetails.status,
              statusUpdateTime: returnDetails.statusUpdateTime,
              remarks: returnDetails.remarks
            };
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Delivery has been marked for return'
          });
          
          // Create notifications for returned delivery
          const returnUser = this.userService.getUser();
          
          // Notification to supplier or admin
          const supplierNotifTarget = this.selectedStock?.supplier || 'admin';
          this.notificationService.addNotification(
            `Delivery ${this.selectedStock?.receiptNo || this.selectedStock?.id} has been returned. Reason: ${this.returnRemarks}`,
            'warning',
            supplierNotifTarget
          );
          
          // Notification to the user who took the action
          if (returnUser) {
            this.notificationService.addNotification(
              `You returned delivery ${this.selectedStock?.receiptNo || this.selectedStock?.id}`,
              'info',
              returnUser.username
            );
          }

          // Force reload data to ensure we have the most up-to-date information
          await this.deliveryService.loadDeliveredStocks();
          
          // Close the dialog
          this.closeDetailsDialog();
        } catch (error) {
          console.error('Error processing return:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to process return'
          });
        }
      }
    });
  }

  printAcknowledgementReceipt(stock: DeliveredStock) {
    this.messageService.add({
      severity: 'success',
      summary: 'Printing',
      detail: `Printing acknowledgement receipt for ${stock.receiptNo}`
    });
    // Implement actual printing logic here
  }

  hasUnverifiedItems(stock: DeliveredStock | null): boolean {
    if (!stock) return false;
    return stock.details?.some(detail => !detail.isVerified) || false;
  }

  areAllItemsDelivered(stock: DeliveredStock): boolean {
    return stock.details.every(detail => 
      detail.isVerified && detail.deliveryStatus === 'Completed'
    );
  }

  areAllItemsPending(stock: DeliveredStock): boolean {
    return stock.details.every(detail => 
      detail.deliveryStatus === 'Under Delivery' || !detail.deliveryStatus
    );
  }

  calculateTotal(stock: DeliveredStock): number {
    return stock.details.reduce((sum: number, item: StockDetail) => 
      sum + (item.quantity || 0), 0);
  }

  hasUnderDeliveryItems(stock: DeliveredStock): boolean {
    return stock.details.some((detail: StockDetail) => 
      detail.deliveryStatus === 'Under Delivery');
  }

  getSubStatusColor(subStatus: DeliverySubStatus): string {
    switch (subStatus) {
      case 'Preparing Items':
        return 'orange';
      case 'In Transit':
        return 'blue';
      case 'Arrived':
        return 'green';
      case 'Verifying':
        return 'purple';
      default:
        return 'gray';
    }
  }

  getTotalAmount(details: StockDetail[] | undefined): number {
    if (!details) return 0;
    return details.reduce((total, item) => 
      total + (item.quantity * (item.unitPrice || 0)), 0);
  }

  async printRIS() {
    const printContent = document.getElementById('ris-form-printable');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    
    try {
      await window.print();
    } catch (error) {
      console.error('Print error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to print document'
      });
    } finally {
      document.body.innerHTML = originalContent;
      // Reinitialize component
      this.showDetailsDialog = true;
    }
  }

  async saveRISDocument() {
    try {
      const content = document.getElementById('ris-form-printable');
      if (!content) return;

      this.messageService.add({
        severity: 'info',
        summary: 'Processing',
        detail: 'Generating PDF...'
      });

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Generate filename
      const requisitionNo = this.selectedStock?.requisitionNumber || 'RIS';
      const date = new Date();
      const filename = `${requisitionNo}_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.pdf`;

      pdf.save(filename);

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'RIS document saved successfully'
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate document'
      });
    }
  }

  /**
   * Return stock to inventory
   */
  returnToStock(stock: DeliveredStock) {
    this.confirmationService.confirm({
      message: `Are you sure you want to return this delivery to stock? The items will be added to inventory.`,
      header: 'Return to Stock',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          // Call the new addToInventoryWithoutDeletion method
          const success = await this.deliveryService.addToInventoryWithoutDeletion(stock);
          
          if (success) {
            // Update the local reference to show the status change
            stock.returnedToInventory = true;
            stock.returnTime = new Date();
            
            // Refresh the filtered list
            this.filteredDeliveredStocks = [...this.filteredDeliveredStocks];
            
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Items returned to inventory successfully',
              life: 3000
            });
            
            // Close dialogs if open
            this.showDetailsDialog = false;
            this.selectedStock = null;
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to return items to inventory',
              life: 3000
            });
          }
        } catch (error) {
          console.error('Error returning items to inventory:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while returning items to inventory',
            life: 3000
          });
        }
      }
    });
  }

  // Add a new method to navigate to inventory
  navigateToInventory() {
    this.router.navigate(['/shared/inventory-item']);
  }

  viewCompletedDelivery(stock: DeliveredStock) {
    this.selectedCompletedStock = stock;
    this.showAcknowledgementDialog = true;
  }

  printAcknowledgement(): void {
    const printContent = document.getElementById('acknowledgement-printable')?.cloneNode(true) as HTMLElement;
    const printContainer = document.getElementById('print-container');
    
    if (!printContent || !printContainer) return;

    // Clear previous content
    printContainer.innerHTML = '';
    
    // Add print-specific classes
    printContent.classList.add(
        'p-4',
        'max-w-4xl',
        'mx-auto',
        'bg-white'
    );

    // Remove dialog-specific elements
    const elementsToRemove = printContent.querySelectorAll('.p-dialog-footer, .print\\:hidden');
    elementsToRemove.forEach(el => el.remove());

    // Add content to print container
    printContainer.appendChild(printContent);

    // Print the document
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContainer.innerHTML;
    
    window.print();

    // Restore original content
    document.body.innerHTML = originalContent;
    
    // Reinitialize your component/dialog
    this.showAcknowledgementDialog = true;
  }

  closeDetailsDialog() {
    this.showDetailsDialog = false;
    this.showReturnRemarks = false;
    this.returnRemarks = '';
  }

  viewReturnedDelivery(stock: DeliveredStock) {
    this.selectedReturnedStock = stock;
    this.showReturnDialog = true;
  }

  printReturnForm(): void {
    const printContent = document.getElementById('return-form-printable')?.cloneNode(true) as HTMLElement;
    const printContainer = document.getElementById('print-container');
    
    if (!printContent || !printContainer) return;

    // Clear previous content
    printContainer.innerHTML = '';
    
    // Add print-specific classes
    printContent.classList.add(
        'p-4',
        'max-w-4xl',
        'mx-auto',
        'bg-white'
    );

    // Remove dialog-specific elements
    const elementsToRemove = printContent.querySelectorAll('.p-dialog-footer, .print\\:hidden');
    elementsToRemove.forEach(el => el.remove());

    // Add content to print container
    printContainer.appendChild(printContent);

    // Print the document
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContainer.innerHTML;
    
    window.print();

    // Restore original content
    document.body.innerHTML = originalContent;
    
    // Reinitialize your component/dialog
    this.showReturnDialog = true;
  }

  viewCancelledDelivery(stock: DeliveredStock) {
    this.selectedCancelledStock = stock;
    this.showCancelledDialog = true;
  }

  printCancelledInfo(): void {
    const printContent = document.getElementById('cancelled-info-printable')?.cloneNode(true) as HTMLElement;
    const printContainer = document.getElementById('print-container');
    
    if (!printContent || !printContainer) return;

    // Clear previous content
    printContainer.innerHTML = '';
    
    // Add print-specific classes
    printContent.classList.add(
        'p-4',
        'max-w-4xl',
        'mx-auto',
        'bg-white'
    );

    // Remove dialog-specific elements
    const elementsToRemove = printContent.querySelectorAll('.p-dialog-footer, .print\\:hidden');
    elementsToRemove.forEach(el => el.remove());

    // Add content to print container
    printContainer.appendChild(printContent);

    // Print the document
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContainer.innerHTML;
    
    window.print();

    // Restore original content
    document.body.innerHTML = originalContent;
    
    // Reinitialize your component/dialog
    this.showCancelledDialog = true;
  }

  async saveAcknowledgementDocument() {
    try {
      const content = document.getElementById('acknowledgement-printable');
      if (!content) return;

      // Show loading message
      this.messageService.add({
        severity: 'info',
        summary: 'Processing',
        detail: 'Generating PDF...'
      });

      // Create PDF
      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Generate filename with date
      const date = new Date();
      const filename = `Acknowledgement_Receipt_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}.pdf`;

      // Save the PDF
      pdf.save(filename);

      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Document saved successfully'
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate document'
      });
    }
  }

  viewCancellationDetails(stock: DeliveredStock) {
    this.selectedCancelledStock = stock;
    this.showCancellationDetailsDialog = true;
  }

  getTotalItems(details: StockDetail[] | undefined): number {
    if (!details) return 0;
    return details.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  // Update the status of a delivered stock
  updateDeliveryStatus(delivery: DeliveredStock, newStatus: DeliveryStatus, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to mark this delivery as ${newStatus}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deliveryService.updateStatus(delivery.id, newStatus)
          .then(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Status Updated',
              detail: `Delivery has been marked as ${newStatus}`
            });
          })
          .catch(error => {
            console.error('Error updating delivery status:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update delivery status'
            });
          });
      }
    });
  }

  viewIncompleteDetails(stock: DeliveredStock) {
    this.selectedIncompleteStock = stock;
    this.showIncompleteDetailsDialog = true;
  }

  loadSampleData() {
    this.deliveredStocks = deliveredStocks;
  }

  /**
   * Open dialog to specify missing quantities
   */
  openMissingItemsDialog(item: StockDetail) {
    this.selectedItemForMissing = item;
    // Initialize deliveredQuantity if not set
    if (this.selectedItemForMissing.deliveredQuantity === undefined) {
      this.selectedItemForMissing.deliveredQuantity = item.quantity;
    }
    this.showMissingItemsDialog = true;
  }

  /**
   * Check if the entered missing quantity is valid
   */
  isValidMissingQuantity(): boolean {
    if (!this.selectedItemForMissing) return false;
    
    const deliveredQty = this.selectedItemForMissing.deliveredQuantity;
    return deliveredQty !== undefined && 
           deliveredQty >= 0 && 
           deliveredQty <= this.selectedItemForMissing.quantity;
  }

  /**
   * Save missing item details and close dialog
   */
  saveMissingItemDetails() {
    if (!this.selectedItemForMissing || !this.isValidMissingQuantity()) return;

    // Update the item's verification status based on delivered quantity
    if (this.selectedItemForMissing.deliveredQuantity === this.selectedItemForMissing.quantity) {
      this.selectedItemForMissing.isVerified = true;
      this.selectedItemForMissing.deliveryStatus = 'Completed';
    } else {
      this.selectedItemForMissing.isVerified = false;
      this.selectedItemForMissing.deliveryStatus = 'Under Delivery';
    }

    // Close the dialog
    this.showMissingItemsDialog = false;
    this.selectedItemForMissing = null;

    // Update buttons state
    this.updateButtonsState();
  }

  openRemarksDialog(item: StockDetail) {
    this.selectedItemForRemarks = item;
    this.showRemarksDialog = true;
  }

  // Format the return time for the tooltip
  getReturnTimeInfo(stock: DeliveredStock): string {
    if (!stock.returnTime) return '';
    return `Returned on ${new Date(stock.returnTime).toLocaleString()}`;
  }
}