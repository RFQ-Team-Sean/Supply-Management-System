import { Component, Input, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RequisitionService, Requisition } from 'src/app/services/requisition.service';
import { RFQService, RFQ } from 'src/app/services/rfq.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aoq',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './aoq.component.html',
  styleUrls: ['./aoq.component.scss'],
})
export class AoqComponent implements OnInit {
  @Input() rfqId!: string; // Input property for RFQ ID
  requisitionData: Requisition | undefined; // Fetched requisition data
  rfqData: RFQ | undefined; // Fetched RFQ data
  errorMessage: string = ''; // Error message for invalid search
  totalPrice: number = 0; // Total price
  currentDate:Date = new Date();
  constructor(
    private requisitionService: RequisitionService,
    private rfqService: RFQService
  ) {}

  ngOnInit() {
    // Automatically fetch data and generate the PDF when the rfqId is provided
    if (this.rfqId) {
      this.fetchData().then(() => {
        if (this.rfqData && this.requisitionData) {
          this.exportPdf();
        }
      });
    }
  }

  getTotalPrice(products: { price: number; quantity: number }[]): number {
    return products.reduce((total, product) => total + product.price * product.quantity, 0);
  }

  async fetchData() {
    this.errorMessage = '';
    this.requisitionData = undefined;
    this.rfqData = undefined;

    try {
      const rfqs = await this.rfqService.getAll();
      this.rfqData = rfqs.find((rfq) => rfq.id === this.rfqId);

      if (!this.rfqData) {
        this.errorMessage = 'RFQ not found.';
        return;
      }

      const requisitions = await this.requisitionService.getAllRequisitions();
      this.requisitionData = requisitions.find(
        (req) => req.id === this.rfqData?.purchase_order
      );

      if (!this.requisitionData) {
        this.errorMessage = 'Requisition not found for the given Purchase Order.';
        return;
      }

      this.totalPrice = this.getTotalPrice(this.requisitionData.products);
    } catch (error) {
      this.errorMessage = 'An error occurred while fetching data.';
      console.error(error);
    }
  }

  getWinner(){
    return this.rfqData?.suppliers.find(s=>s.supplierId == this.rfqData?.supplier);
  }

  async exportPdf() {
    if (!this.requisitionData || !this.rfqData) {
      this.errorMessage = 'No data available to export.';
      return;
    }

    const supplier = this.rfqData.suppliers.find(s=>s.supplierId == this.rfqData?.supplier);

    const container = document.createElement('div');
    container.innerHTML = `
      <div class="p-10 ml-10 bg-white shadow-md rounded-lg" style="width: 390mm; height: 350mm;">
        <h1 class="text-2xl font-bold mb-4 flex justify-center">ABSTRACT OF QUOTATIONS</h1>
        
        <div class="mb-4 text-xl">
          <div class="flex flex-row justify-between">
            <p><strong>DATE:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>MODE OF PROCUREMENT:</strong> ${this.requisitionData.title} Small</p>
          </div>
        </div>
      
        <table class="w-full border-collapse border border-gray-300 text-xl" style="table-layout: fixed;">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 p-4" style="width: 5%;">Lot</th>
              <th class="border border-gray-300 p-4" style="width: 10%;">Unit of Measurement</th>
              <th class="border border-gray-300 p-4" style="width: 20%;">Item Description</th>
              <th class="border border-gray-300 p-4" style="width: 15%;">ABC</th>
              <th class="border border-gray-300 p-4" style="width: 15%;">Supplier Name</th>
              <th class="border border-gray-300 p-4" style="width: 15%;">Supplier Price</th>
            </tr>
          </thead>
          <tbody>
            ${this.requisitionData.products
              .map(
                (product) => `
              <tr>
                <td class="border border-gray-300 p-4">${1}</td>
                <td class="border border-gray-300 p-4">lot</td>
                <td class="border border-gray-300 p-4">${this.requisitionData?.title}</td>
                <td class="border border-gray-300 p-4"> ${(product.quantity * product.price).toFixed(2)}</td>
                <td class="border border-gray-300 p-4">${supplier?.supplierName || 'N/A'}</td>
                <td class="border border-gray-300 p-4">P${supplier?.biddingPrice || 'N/A'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="mt-4 text-xl">
          <p><strong>RESOLVED,</strong> that based on the above Abstract of Quotations, the BAC recommends to the Head that the contract be awarded in favor of ${supplier?.supplierName} as the single calculated and responsive bidder/quotation.</p>
          <p><strong>RESOLVED,</strong> this ${new Date().toLocaleDateString()} in the Davao.</p>
        </div>

        <div class="mt-4 text-xl">
          <div class="flex flex-row justify-between">
            <p><strong>Purchase Requisition No. ${this.requisitionData.id}</strong></p>
            <p><strong>Purchase Order No. ${this.rfqData.purchase_order}</strong></p>
          </div>
          <div class="flex flex-row justify-between">
            <p><strong>PREPARED BY:</strong> ${this.requisitionData.createdByUserName}</p>
          </div>
        </div>

        <div class="mt-4 text-xl">
          <p><strong>Recommending Approval:</strong></p>
          <p>Admin - Chairperson, BAC</p>
          <p>Manager - BAC Member</p>
        </div>

        <div class="mt-4 text-xl">
          <p><strong>APPROVED:</strong></p>
          <p>Head of Procuring Entity </p>
        </div>
      </div>
    `;

    document.body.appendChild(container);

    html2canvas(container, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'legal');
      const imgWidth = 330;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('abstract-of-quotations.pdf');

      document.body.removeChild(container);
    });
  }
}



