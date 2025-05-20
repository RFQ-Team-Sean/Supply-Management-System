import { Component, Input, OnInit } from '@angular/core';
import { RFQService, RFQ } from 'src/app/services/rfq.service';
import { RequisitionService, Requisition } from 'src/app/services/requisition.service';
import { SuppliersService, Supplier } from 'src/app/services/suppliers.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-noa',
  standalone: true,
  imports: [ButtonModule, DialogModule, CommonModule],
  templateUrl: './noa.component.html',
  styleUrls: ['./noa.component.scss']
})
export class NoaComponent implements OnInit {
  @Input() rfqId!: string; // Accept RFQ ID as an input
  displayModal: boolean = false; // For controlling modal visibility
  mockData: any = {};

  constructor(
    private rfqService: RFQService,
    private requisitionService: RequisitionService,
    private suppliersService: SuppliersService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.rfqId) {
      await this.loadData(this.rfqId);
    }
  }

async loadData(rfqId: string): Promise<void> {
  try {
    // Fetch RFQ and Requisition Data
    const rfq: RFQ | undefined = await this.rfqService.getById(rfqId);
    const requisition: Requisition | undefined = rfq && rfq.purchase_order ? await this.requisitionService.getRequisitionById(rfq.purchase_order) : undefined;

    if (!rfq || !requisition) {
      console.error('RFQ or Requisition not found');
      return;
    }

    // Get Supplier Information
    const supplierId = rfq.suppliers[0]?.supplierId;
    const supplier: Supplier | undefined = (await this.suppliersService.getAll()).find(s => s.id === supplierId);

    if (!supplier) {
      console.error('Supplier not found');
      return;
    }

    // Map Data to NOA Format
    this.mockData = {
      noaNumber: rfq.id,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      recipient: {
        name: supplier.contactPerson,
        position: 'Supplier Representative',
        company: supplier.name,
        address: supplier.address || 'N/A',
        email: supplier.email || 'N/A'
      },
      items: requisition.products.map((product: { name: any; quantity: any; price: { toLocaleString: (arg0: string, arg1: { style: string; currency: string; }) => any; }; }) => ({
        description: product.name,
        quantity: product.quantity,
        unit: 'Units', // Example unit
        price: product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      })),
      totalPrice: requisition.products.reduce((sum, product) => sum + product.price * product.quantity, 0)
        .toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      deliveryInstructions: 'Within the date indicated in the Work Order (WO) / Purchase Order (PO)'
    };

    // Add a delay to export the PDF
    setTimeout(() => this.exportPdfs(), 500);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}


  showModal() {
    this.displayModal = true;
  }

  hideModal() {
    this.displayModal = false;
  }

  exportPdfs() {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-10 ml-10 bg-white shadow-md" style="width: 360mm; min-height: 350mm; font-family: Arial, sans-serif;">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold">NOTICE OF AWARD</h1>
          <p class="text-2xl">NOA No.: ${this.mockData.noaNumber}</p>
          <p class="text-2xl">${this.mockData.date}</p>
        </div>

        <div class="mb-6 text-xl">
          <p class="font-bold">${this.mockData.recipient.name}</p>
          <p>${this.mockData.recipient.position}</p>
          <p>${this.mockData.recipient.company}</p>
          <p>${this.mockData.recipient.address}</p>
          <p>${this.mockData.recipient.email}</p>
        </div>

        <div class="mb-6 text-xl">
          <p class="font-bold">Dear ${this.mockData.recipient.name}:</p>
          <p class="mt-2">This is to inform you that the Anti-Red Tape Authority has recommended the award
          of contract in your favor for the Procurement of Semi-Expendable ICT Equipment
          for the Office of the Director General, and you are hereby issued this NOTICE OF
          AWARD:</p>
        </div>

        <table class="w-full border-collapse border border-black mb-6 text-xl">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-black p-2">Lot No.</th>
              <th class="border border-black p-2">Item/Description</th>
              <th class="border border-black p-2">Quantity</th>
              <th class="border border-black p-2">Unit</th>
              <th class="border border-black p-2">Total Price</th>
            </tr>
          </thead>
          <tbody>
            ${this.mockData.items.map((item: { description: any; quantity: any; unit: any; price: any; }, index: number) => `
              <tr>
                <td class="border border-black p-2 text-center">${index + 1}</td>
                <td class="border border-black p-2">${item.description}</td>
                <td class="border border-black p-2 text-center">${item.quantity}</td>
                <td class="border border-black p-2 text-center">${item.unit}</td>
                <td class="border border-black p-2 text-right">${item.price}</td>
              </tr>
            `).join('')}
            <tr>
              <td colspan="4" class="border border-black p-2 text-right font-bold">TOTAL</td>
              <td class="border border-black p-2 text-right font-bold">${this.mockData.totalPrice}</td>
            </tr>
          </tbody>
        </table>

        <div class="mb-8 text-xl">
          <p class="font-bold mb-2">Delivery Instructions:</p>
          <p>${this.mockData.deliveryInstructions}</p>
        </div>
      </div>
    `;

    document.body.appendChild(content);

    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('notice-of-award.pdf');
      document.body.removeChild(content);
    });
  }
}
