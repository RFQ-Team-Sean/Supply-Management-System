import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { RequisitionService, Requisition } from 'src/app/services/requisition.service';

@Component({
  selector: 'app-request-quotation',
  standalone: true,
  imports: [CommonModule, ButtonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4">
      <div class="max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
        <div class="bg-blue-600 py-4 px-6 rounded-t-lg">
          <h1 class="text-center text-white text-xl font-bold">REQUEST FOR QUOTATION</h1>
          <h2 class="text-center text-white text-lg">{{ requisition?.title || 'PROCUREMENT OF GOODS AND SERVICES' }}</h2>
        </div>

        <div class="p-6">
          <!-- Requisition Header -->
          <div class="mb-6">
          
          </div>

          <!-- Terms and Conditions -->
          <div class="mb-6">
            <p>
              The Anti-Red Tape Authority invites all eligible and PhilGEPS-registered suppliers and consultants to
              quote the best offer for the items described below, subject to the Terms and Conditions and within the
              Approved Budget for the Contract (ABC).
            </p>
            <p class="mt-2 "> Please refer to the following details:</p>
            <h3 class="text-md mt-6 font-semibold">Terms and Conditions</h3>
            <ul class="list-decimal pl-6 mt-6">
              <li>All entries shall be typed or written in a clear and legible manner.</li>
              <li>Bids should not exceed the Approved Budget for the Contract (ABC).</li>
              <li>
                All prices offered herein are valid, binding, and effective for 30 calendar days upon issuance of this
                document.
              </li>
              <li>Price quotations shall include all applicable government taxes.</li>
              <li>Required documents proving financial and technical capacity may be requested.</li>
              <li>Salient provisions of the IRR of RA 9184, including penalties, shall be observed.</li>
            </ul>
          </div>

          <!-- Item List -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold">Item List</h3>
            <table class="w-full border-collapse border border-gray-300 text-left">
              <thead>
                <tr class="bg-gray-200">
                  <th class="border border-gray-300 px-4 py-2">No.</th>
                  <th class="border border-gray-300 px-4 py-2">Qty</th>
                  <th class="border border-gray-300 px-4 py-2">Item Description</th>
                  <th class="border border-gray-300 px-4 py-2">ABC</th>
                  <th class="border border-gray-300 px-4 py-2">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of requisition?.products; let i = index">
                  <td class="border border-gray-300 px-4 py-2">{{ i + 1 }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ product.quantity }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ product.name }}</td>
                  <td class="border border-gray-300 px-4 py-2">{{ product.price | currency: 'PHP' }}</td>
                  <td class="border border-gray-300 px-4 py-2">
                    {{ product.quantity * product.price | currency: 'PHP' }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right font-semibold border border-gray-300 px-4 py-2">Total ABC:</td>
                  <td class="border border-gray-300 px-4 py-2">{{ totalABC | currency: 'PHP' }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Delivery Details -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold">Delivery Details</h3>
            <p><strong>Purpose:</strong> {{ requisition?.description }}</p>
          </div>

          
        </div>
      </div>
    </div>
  `,
})
export class RequestQuotationComponent implements OnInit, OnChanges {
  @Input() requisitionId!: string;
  requisition: Requisition | undefined;
  totalABC: number = 0;

  constructor(private requisitionService: RequisitionService) {}

  ngOnInit(): void {
    if (this.requisitionId) {
      this.loadRequisition();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['requisitionId'] && changes['requisitionId'].currentValue) {
      this.loadRequisition();
    }
  }

  async loadRequisition() {
    try {
      this.requisition = await this.requisitionService.getRequisitionById(this.requisitionId);
      if (this.requisition) {
        this.totalABC = this.requisition.products.reduce(
          (sum, product) => sum + product.quantity * product.price,
          0
        );

        setTimeout(() => {
          this.exportToPDF();
        }, 1500); 
      }
    } catch (error) {
      console.error('Error loading requisition:', error);
    }
  }



  exportToPDF() {
  const content = document.querySelector('.min-h-screen') as HTMLElement;
  const downloadButton = document.querySelector('.p-button-success') as HTMLElement;

  // Hide the download button
  if (downloadButton) {
    downloadButton.style.display = 'none';
  }

  html2canvas(content).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Convert the PDF to a Blob and trigger a download programmatically
    const pdfBlob = pdf.output('blob');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = 'request-for-quotation.pdf';
    link.click();

    // Cleanup
    URL.revokeObjectURL(link.href);

    // Show the download button again
    if (downloadButton) {
      downloadButton.style.display = '';
    }
  });
}


}
