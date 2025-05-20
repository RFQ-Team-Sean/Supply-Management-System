import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-disbursement',
  standalone: true,
  imports: [ButtonModule, CommonModule],
  templateUrl: './disbursement.component.html',
  styleUrls: ['./disbursement.component.scss']
})
export class DisbursementComponent {
  exportAsPDF() {
    // Create a temporary div to hold the HTML content
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-20 bg-white shadow-md rounded-lg">
        <!-- Header -->
        <div class="text-center mb-4">
          <h1 class="text-xl font-bold">Republic of the Philippines</h1>
          <h2 class="text-lg">Office of the President</h2>
          <h3 class="text-md">NATIONAL TELECOMMUNICATIONS COMMISSION</h3>
          <h4 class="text-sm">Regional Office No V, Legazpi City</h4>
          <p class="text-sm">Fund Cluster 101</p>
        </div>

        <!-- Title -->
        <h1 class="text-2xl font-bold text-center mb-4">DISBURSEMENT VOUCHER</h1>

        <!-- Voucher Details -->
        <div class="grid grid-cols-2 gap-4 mb-4 text-xl">
          <div>
            <p class="font-semibold">Date:</p>
            <p>2023-10-01</p>
          </div>
          <div>
            <p class="font-semibold">DV No.:</p>
            <p>2023-0202</p>
          </div>
        </div>

        <!-- Mode of Payment -->
        <div class="mb-4 text-xl">
          <p class="font-semibold">Mode of Payment:</p>
          <p>MDS Check</p>
        </div>

        <!-- Payee Details -->
        <div class="mb-4 text-xl">
          <p class="font-semibold">Payee:</p>
          <p>K2C GENERAL MERCHANDISE</p>
          <p class="font-semibold">TIN Employee No.:</p>
          <p>ORS/BUR 06-10101-2022-12-00476</p>
          <p class="font-semibold">Address:</p>
          <p>LIBON, ALBAY</p>
        </div>

        <!-- Particulars Table -->
        <table class="w-full mb-4 text-xl">
          <thead>
            <tr>
              <th class="border p-4">Particulars</th>
              <th class="border p-4">Responsibility Center</th>
              <th class="border p-4">MFO/PAP</th>
              <th class="border p-4">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border p-4">To payment for the Procurement, Delivery, Installation, Test and Commissioning of One (1) Unit 50KVA Generator and Construction of Generator House for NTC R5 as per attached supporting documents.</td>
              <td class="border p-4"></td>
              <td class="border p-4"></td>
              <td class="border p-4">P1,557,717.15</td>
            </tr>
          </tbody>
        </table>

        <!-- Amount Details -->
        <div class="mb-4 text-xl">
          <p class="font-semibold">Gross Amount: P1,685,000.00</p>
          <p class="font-semibold">Deductions:</p>
          <ul class="list-disc pl-5">
            <li>Tax Due: P75,223.21</li>
            <li>EWT 1%: P10,044.64</li>
            <li>EWT 2%: P10,000.00</li>
            <li>1% Retention Money: P16,850.00</li>
            <li>Liquidated Damages: P15,165.00</li>
          </ul>
          <p class="font-semibold">Total Deductions: P127,282.85</p>
          <p class="font-semibold">Net Amount: P1,557,717.15</p>
        </div>

        <!-- Certification Section -->
        <div class="mb-4 text-xl">
          <p class="font-semibold">Certified:</p>
          <p>Expenses/Cash Advance necessary, lawful and incurred under my direct supervision.</p>
          <p class="mt-2">SUSAN D. TORRE</p>
          <p>Chief Administrative Officer</p>
        </div>

        <!-- Accounting Entry -->
        <div class="mb-4 text-xl">
          <p class="font-semibold">Accounting Entry:</p>
          <table class="w-full">
            <thead>
              <tr>
                <th class="border p-4">Account Title</th>
                <th class="border p-4">UACS Code</th>
                <th class="border p-4">Debit</th>
                <th class="border p-4">Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border p-4">Accounts Payable</td>
                <td class="border p-4">2010101000</td>
                <td class="border p-4">1,685,000.00</td>
                <td class="border p-4"></td>
              </tr>
              <tr>
                <td class="border p-4">Cash-Modified Disbursement System (MDS), Regular</td>
                <td class="border p-4">1010404000</td>
                <td class="border p-4"></td>
                <td class="border p-4">1,557,717.15</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Approval Section -->
        <div class="mb-4 text-xl">
          <p class="font-semibold">Approved for Payment:</p>
          <p>ENGR. SAMUEL S. SABILE</p>
          <p>OIC-Regional Director</p>
          <p>Agency Head, Authorized Representative</p>
        </div>
      </div>
    `;

    // Append the content to the body temporarily
    document.body.appendChild(content);

    // Use html2canvas to capture the content as an image
    html2canvas(content).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Save the PDF
      pdf.save('disbursement-voucher.pdf');

      // Remove the temporary content from the DOM
      document.body.removeChild(content);
    });
  }
}