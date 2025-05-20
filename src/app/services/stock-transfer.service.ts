import { Injectable } from '@angular/core';
import { StocksService } from './stocks.service';
import { InventoryService } from './inventory.service';

export interface StockTransfer {
  id: string;
  stockId: string;
  location: string;
  fromLocation?: string;
  toLocation?: string;
  amount: number;
  remarks?: string;
  status: 'pending' | 'approved' | 'in_preparation' | 'completed';
}

@Injectable({
  providedIn: 'root'
})
export class StockTransferService {
  private transfers: StockTransfer[] = [];

  constructor(
    private stocksService: StocksService, 
    private inventoryService: InventoryService
  ) {}

  async createTransfer(stockId: string, amount: number, locationId: string): Promise<void> {
    try {
      // Implement your create logic here
      console.log('Creating transfer:', { stockId, amount, locationId });
    } catch (error) {
      console.error('Error creating transfer:', error);
      throw error;
    }
  }

  async getTransfers(): Promise<StockTransfer[]> {
    console.log('Service: Getting all transfers'); // Debug log
    return this.transfers;
  }

  async getSingleTransfer(id: string): Promise<StockTransfer | undefined> {
    console.log('Service: Getting single transfer:', id); // Debug log
    return this.transfers.find(t => t.id === id);
  }

  async prepareTransfer(id: string): Promise<void> {
    console.log('Service: Preparing transfer:', id); // Debug log
    try {
      const transfer = await this.getSingleTransfer(id);
      if (transfer) {
        transfer.status = 'in_preparation';
        const index = this.transfers.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transfers[index] = transfer;
          console.log('Service: Transfer prepared successfully:', transfer); // Debug log
        }
      }
    } catch (error) {
      console.error('Service: Error preparing transfer:', error); // Debug log
      throw error;
    }
  }

  async commitTransfer(id: string): Promise<void> {
    console.log('Service: Committing transfer:', id); // Debug log
    try {
      const transfer = await this.getSingleTransfer(id);
      if (transfer) {
        transfer.status = 'approved';
        const index = this.transfers.findIndex(t => t.id === id);
        if (index !== -1) {
          this.transfers[index] = transfer;
          console.log('Service: Transfer committed successfully:', transfer); // Debug log
        }
      }
    } catch (error) {
      console.error('Service: Error committing transfer:', error); // Debug log
      throw error;
    }
  }

  async rejectTransfer(id: string): Promise<void> {
    const transfer = await this.getSingleTransfer(id);
    if (transfer) {
      transfer.status = 'completed'; // or 'rejected' based on your requirements
      const index = this.transfers.findIndex(t => t.id === id);
      if (index !== -1) {
        this.transfers[index] = transfer;
      }
    }
  }

  async completeTransfer(id: string): Promise<void> {
    const transfer = await this.getSingleTransfer(id);
    if (transfer) {
      transfer.status = 'completed';
      const index = this.transfers.findIndex(t => t.id === id);
      if (index !== -1) {
        this.transfers[index] = transfer;
      }
    }
  }

  async editTransfer(transfer: StockTransfer): Promise<void> {
    const index = this.transfers.findIndex(t => t.id === transfer.id);
    if (index !== -1) {
      this.transfers[index] = transfer;
    }
  }
}
