import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-ntp',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './ntp.component.html',
  styleUrls: ['./ntp.component.scss']
})
export class NtpComponent {
  mockData = {
    ntpNumber: 'AFD-BAC-NTP-2024-12-03',
    date: 'December 27, 2024',
    ibnumber: 'IB NO. 013-24',
    recipient: {
      name: 'John Doe',
      position: 'Authorized Manager Officer',
      company: 'It Communicatoin.',
      address: 'IT Business Park, Cebu City',
      email: 'johndoe@cebupark.it'
    },
    contractReference: 'SUPPLY, DELIVERY AND INSTALLATION OF VARIOUS CONSOLIDATED ICT REQUIREMENTS OF BAFE FOR CY 2024 (2ND POSTING) FOR LOTS NO. 1 AND 5',
    deliveryInstructions: {
      lot1: 'SIXTY (60) CALENDAR DAYS UPON RECEIPT/CONFORME OF THE NOTICE TO PROCEED (NTP) FOR LOT NO. 1',
      lot5: 'ONE HUNDRED TWENTY (120) CALENDAR DAYS UPON RECEIPT/CONFORME OF THE NOTICE TO PROCEED (NTP) FOR LOT NO. 5'
    }
  };

  exportPdf() {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-10 ml-10 bg-white shadow-md" style="width: 360mm; min-height: 350mm; font-family: Arial, sans-serif;">
        <div class="flex flex-row justify-between mb-8">
          <p class="text-2xl">NTP No.: ${this.mockData.ntpNumber}</p>
          <p class="text-2xl">${this.mockData.date}</p>
        </div>
        <div class="text-center">
          <h1 class="text-4xl font-bold">NOTICE TO PROCEED</h1>
        </div>
        <div class="mb-6 text-2xl mt-10">
          <p>${this.mockData.recipient.company}</p>
          <p>${this.mockData.recipient.address}</p>
          <p>${this.mockData.recipient.email}</p>
        </div>
        <div class="flex flex-row justify-center w-full text-2xl mb-6">
          <div>
            <p>Attention:</p>
          </div>
          <div class="ml-2">
            <p class="font-bold">${this.mockData.recipient.name}</p>
            <p>${this.mockData.recipient.position}</p>
          </div>
        </div>
        <div class="mb-6 text-2xl">
          <p class="">Dear <strong>Mr. Doe:</strong></p>
          <p class="mt-2">With reference to the approved Award and Contract for <strong>${this.mockData.contractReference}</strong> under <strong>${this.mockData.ibnumber}</strong>, you are hereby advised that you must proceed with the legal obligations under the said contract after receipt of this notice.</p>
        </div>
        <div class="mb-6 text-2xl">
          <p>The delivery and acceptance are within <strong>${this.mockData.deliveryInstructions.lot1} ${this.mockData.deliveryInstructions.lot5}</strong></p>
        </div>
        <div class="mb-6 text-2xl">
          <p>Thank you.</p>
        </div>
        <div class="mt-16 text-2xl">
          <p>Very truly yours,</p>
          <p> </p>
          <p>Jaldwin G. Jaldorina, Ph.D.</p>
          <p>Director</p>
        </div>
        <div class="mt-16">
          <p class="pt-4 text-2xl">CONFORME:</p>
          <p class="text-2xl">${this.mockData.recipient.name}</p>
          <p class="text-lg">Signature over Printed Name</p>
          <p class="mt-4 text-2xl">Date Received: _________________________</p>
        </div>
        <div class="mt-10">
          <p class="text-base">Notice to Proceed No. ${this.mockData.ibnumber}</p>
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
      pdf.save('notice-to-proceed.pdf');
      document.body.removeChild(content);
    });
  }
}
