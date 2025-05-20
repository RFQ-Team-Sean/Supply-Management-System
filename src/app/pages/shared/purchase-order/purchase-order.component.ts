import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SuppliersService } from 'src/app/services/suppliers.service';
import { RequisitionService } from 'src/app/services/requisition.service';
import { RFQService } from 'src/app/services/rfq.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-purchase-order',
  standalone: true,
  imports: [ButtonModule, FormsModule, CommonModule],
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss']
})
export class PurchaseOrderComponent implements OnChanges {
  @Input() rfqId: string = '';

  purchaseOrderData: any = {
    requestingOffice: 'OFFICE OF THE DIRECTOR GENERAL',
    contractor: '',
    address: '',
    tin: '',
    telNo: '',
    faxNo: 'N/A',
    email: '',
    poNo: 'ODC-2024-N-022',
    prNo: '2024-09-0288',
    poDate: 'Nov. 12, 2024',
    prDate: 'April 29, 2024',
    modeOfProcurement: 'Shopping',
    deliveryTerm: 'As specified in the Terms of Reference',
    placeOfDelivery: '5th Floor NFA Building, Visayas Avenue, Diliman, Quezon City',
    dateOfDelivery: 'As specified in the Terms of Reference',
    paymentTerm: '30 days after the submission of complete documents',
    items: [],
    totalGrossAmountInWords: '',
    totalGrossAmount: 0,
    penaltyClause: 'In case of failure to make the full delivery within the date specified above, without written justifiable explanation as permitted by existing laws, a penalty of equivalent to one-tenth (1/10) of one percent (1%) of the value under items shall be imposed for each day of delay.',
    conforme: 'Signature Over Printed Name of Suppliers',
    conformeDate: '13 2024 NY + 5W',
    fundsAvailable: 'Funds Available:',
    supportingDocuments: 'Supporting Documents Complete and Proper:',
    dbrNo: 'DBR No: ______',
    dbrDate: 'Date: ______',
    accountant: 'Accountant',
    supplierSignature: '________________________',
    supplierName: '',
    supplierDesignation: 'Authorized Representative',
    requestingOfficeSignature: '________________________',
    requestingOfficeName: 'OFFICE OF THE DIRECTOR GENERAL',
    requestingOfficeDesignation: 'Authorized Signatory'
  };

  constructor(
    private suppliersService: SuppliersService,
    private requisitionService: RequisitionService,
    private rfqService: RFQService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rfqId'] && this.rfqId) {
      this.loadPurchaseOrderData();
    }
  }

  async loadPurchaseOrderData() {
    if (!this.rfqId) {
      console.warn('RFQ ID is not provided.');
      return;
    }

    try {
      const rfq = await this.rfqService.getById(this.rfqId);
      if (!rfq) {
        console.warn('RFQ not found.');
        return;
      }

      const requisition = await this.requisitionService.getRequisitionById(rfq.purchase_order || '');
      if (!requisition) {
        console.warn('Requisition not found.');
        return;
      }

      const supplier = await this.suppliersService.getAll().then(suppliers => 
        suppliers.find(s => s.id === rfq.suppliers[0]?.supplierId)
      );
      if (!supplier) {
        console.warn('Supplier not found.');
        return;
      }

      // Update the purchase order data
      this.purchaseOrderData.contractor = supplier.name;
      this.purchaseOrderData.address = supplier.address;
      this.purchaseOrderData.tin = supplier.id;
      this.purchaseOrderData.telNo = supplier.contactNumber;
      this.purchaseOrderData.email = supplier.email;
      this.purchaseOrderData.items = requisition.products.map((product, index) => ({
        itemNo: index + 1,
        qty: product.quantity,
        unit: 'unit',
        description: product.name,
        unitCost: product.price,
        totalCost: product.price * product.quantity
      }));
      this.purchaseOrderData.totalGrossAmount = this.purchaseOrderData.items.reduce(
        (total: any, item: { totalCost: any; }) => total + item.totalCost, 
        0
      );
      this.purchaseOrderData.totalGrossAmountInWords = this.convertNumberToWords(this.purchaseOrderData.totalGrossAmount);
      this.purchaseOrderData.supplierName = supplier.name;
    } catch (error) {
      console.error('Error loading purchase order data:', error);
    }
  }

  exportPdf() {
    const content = document.createElement('div');
    content.className = 'p-5 bg-white font-sans';

    content.innerHTML = `
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold">PURCHASE ORDER</h2>
        <h3 class="text-2xl">${this.purchaseOrderData.requestingOffice}</h3>
      </div>
      <!-- Your original table structure goes here -->
    `;

    document.body.appendChild(content);

    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('purchase-order.pdf');

      document.body.removeChild(content);
    });
  }

  private convertNumberToWords(amount: number): string {
    // Implementation of number-to-words conversion
    return 'Amount in Words'; // Replace with actual conversion logic
  }
}
