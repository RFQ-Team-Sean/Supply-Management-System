import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './rfq.component.html',
  styleUrls: ['./rfq.component.scss']
})
export class RfqComponent {
  mockData = {
    title: 'REQUEST FOR QUOTATION',
    projectTitle: 'PROCUREMENT OF SEMI-EXPENDABLE ICT EQUIPMENT FOR OFFICE OF THE DIRECTOR GENERAL',
    prNo: '2024-09-0288',
    dateReceived: 'April 29, 2024',
    termsAndConditions: [
      'All entries shall be typed or written in a clear legible manner.',
      'Bids should not exceed the Approved Budget for the Contract (ABC).',
      'All prices offered herein are valid, binding and effective for 30 calendar days upon issuance of this document. Alternative bids shall be rejected.',
      'Price quotations to be denominated in Philippine Peso shall include all applicable government taxes subject to 5% R-VAT and 1% (PO) or 2% (JO) deductions.',
      'ARTA BAC Secretariat may require you to submit documents that will prove your legal, financial and technical capability to undertake this contract.',
      'Salient provisions of the IRR of RA 9184: Section 68 - Liquidated Damages and Section 69 - Imposition of Administrative Penalties shall be observed.'
    ],
    items: [
      { itemNo: 1, qty: '10 pcs', abc: 'P 80,000.00', description: '5TB External Hard Drive (HDD)' },
      { itemNo: 2, qty: '2 units', abc: 'P 98,000.00', description: 'Portable Fast Document Scanner' },
      { itemNo: 3, qty: '3 units', abc: 'P 147,000.00', description: 'LED Smart TV with Stand' },
      { itemNo: 4, qty: '5 pcs', abc: 'P 7,500.00', description: 'HDMI Cables' }
    ],
    totalLotABC: 'P 332,500.00',
    deliveryPeriod: 'As Stated in the Terms of Reference',
    deliverySite: '5th Floor NFA Building, Visayas Avenue, Diliman, Quezon City',
    directorName: 'DIR. LEA-GRACE B. SALÉEDO',
    directorDesignation: 'Director IV, Finance and Administrative Office'
  };

  exportPdf() {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-10 ml-10 bg-white shadow-md rounded-lg" style="width: 210mm; height: 297mm;">
        <h1 class="text-xl font-bold mb-4 flex justify-center">${this.mockData.title}</h1>
        <h2 class="text-base font-bold mb-4 flex justify-center">${this.mockData.projectTitle}</h2>
        <p class="text-sm mb-4"><strong>P. R. No./Date Received:</strong> ${this.mockData.prNo} / ${this.mockData.dateReceived}</p>
  
        <div class="mb-4 text-sm">
          <p>The Anti-Red Tape Authority invites all eligible and PhilGEPS-registered suppliers, contractors and consultants to quote the best offer for the described item subject to the Terms and Conditions and within the Approved Budget for the Contract.</p>
        </div>
  
        <div class="mb-4 text-sm">
          <p><strong>Required Documents:</strong></p>
          <ul>
            <li>1. Mayor’s Permit</li>
            <li>2. Philippines Registration No.</li>
            <li>3. Notarized Omnibus Sworn Statement</li>
            <li>4. Signed Request for Quotation</li>
            <li>5. Signed Terms of Reference</li>
          </ul>
        </div>
  
        <div class="mb-4 text-sm">
          <p><strong>Terms and Conditions:</strong></p>
          <ol>
            ${this.mockData.termsAndConditions
              .map((condition) => `<li>${condition}</li>`)
              .join('')}
          </ol>
        </div>
  
        <table class="w-full border-collapse border border-gray-300 text-xs" style="table-layout: fixed;">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 p-2">Item No.</th>
              <th class="border border-gray-300 p-2">QTY</th>
              <th class="border border-gray-300 p-2">ABC</th>
              <th class="border border-gray-300 p-2">Item/Description</th>
              <th class="border border-gray-300 p-2">Brand/Model</th>
              <th class="border border-gray-300 p-2">Unit Price</th>
              <th class="border border-gray-300 p-2">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${this.mockData.items
              .map(
                (item) => `
              <tr>
                <td class="border border-gray-300 p-4">${item.itemNo}</td>
                <td class="border border-gray-300 p-4">${item.qty}</td>
                <td class="border border-gray-300 p-4">${item.abc}</td>
                <td class="border border-gray-300 p-4">${item.description}</td>
                <td class="border border-gray-300 p-4">(To be filled-up by the supplier)</td>
                <td class="border border-gray-300 p-4"></td>
                <td class="border border-gray-300 p-4"></td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
  
        <div class="mt-4 text-xs">
          <p><strong>Total Lot ABC:</strong> ${this.mockData.totalLotABC}</p>
          <p><strong>Delivery Period:</strong> ${this.mockData.deliveryPeriod}</p>
          <p><strong>Delivery Site:</strong> ${this.mockData.deliverySite}</p>
        </div>
  
        <div class="mt-8 text-sm">
          <p><strong>Very truly yours,</strong></p>
          <p>${this.mockData.directorName}</p>
          <p>${this.mockData.directorDesignation}</p>
        </div>
      </div>
    `;
  
    document.body.appendChild(content);
  
    html2canvas(content, { scale: 4 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'letter'); // Portrait mode
      const imgWidth = 350; // A4 width in mm (portrait)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('request-for-quotation.pdf');
  
      document.body.removeChild(content);
    });
  }
  
}