import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-semi-expendable',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './semi-expendable.component.html',
  styleUrls: ['./semi-expendable.component.scss']
})
export class SemiExpendableComponent {
  mockData = {
    entityName: 'Sample Entity',
    fundCluster: '101',
    semiExpendableProperty: 'Sample Semi-Expendable Property',
    transactions: [
      { date: '2023-10-01', reference: 'ICS-001', propertyNo: 'P-001', itemDescription: 'Item 1', usefulLife: '5 years', issuedQty: 10, issuedOffice: 'Office A', returnedQty: 2, returnedOffice: 'Office B', reissuedQty: 5, reissuedOffice: 'Office C', disposedQty: 1, balanceQty: 12, amount: 1000, remarks: 'Sample Remarks' },
      { date: '2023-10-15', reference: 'ICS-002', propertyNo: 'P-002', itemDescription: 'Item 2', usefulLife: '3 years', issuedQty: 5, issuedOffice: 'Office B', returnedQty: 1, returnedOffice: 'Office A', reissuedQty: 3, reissuedOffice: 'Office C', disposedQty: 0, balanceQty: 7, amount: 500, remarks: 'Sample Remarks 2' },
      // Add more transactions as needed
    ],
  };

  exportPdf() {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-10 bg-white shadow-md rounded-lg">
        <h1 class="text-4xl font-bold mb-4 flex justify-center">REGISTRY OF SEMI-EXPENDABLE PROPERTY ISSUED</h1>
        
        <div class="mb-4 text-2xl">
          <div class="flex flex-row justify-between">
            <p><strong>Entity Name:</strong> ${this.mockData.entityName}</p>
            <p><strong>Fund Cluster:</strong> ${this.mockData.fundCluster}</p>
          </div>
          <div class="flex flex-row justify-between">
            <p><strong>Semi-Expendable Property:</strong> ${this.mockData.semiExpendableProperty}</p>
          </div>
        </div>
      
        <table class="w-full border-collapse border border-gray-300 text-2xl">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 p-4">Date</th>
              <th class="border border-gray-300 p-4">Reference</th>
              <th class="border border-gray-300 p-4">Semi-Expendable Property No.</th>
              <th class="border border-gray-300 p-4">Item Description</th>
              <th class="border border-gray-300 p-4">Estimated Useful Life</th>
              <th class="border border-gray-300 p-4">Issued Qty.</th>
              <th class="border border-gray-300 p-4">Issued Office/Officer</th>
              <th class="border border-gray-300 p-4">Returned Qty.</th>
              <th class="border border-gray-300 p-4">Returned Office/Officer</th>
              <th class="border border-gray-300 p-4">Re-issued Qty.</th>
              <th class="border border-gray-300 p-4">Re-issued Office/Officer</th>
              <th class="border border-gray-300 p-4">Disposed Qty.</th>
              <th class="border border-gray-300 p-4">Balance Qty.</th>
              <th class="border border-gray-300 p-4">Amount</th>
              <th class="border border-gray-300 p-4">Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${this.mockData.transactions
              .map(
                (transaction) => `
              <tr>
                <td class="border border-gray-300 p-4">${transaction.date}</td>
                <td class="border border-gray-300 p-4">${transaction.reference}</td>
                <td class="border border-gray-300 p-4">${transaction.propertyNo}</td>
                <td class="border border-gray-300 p-4">${transaction.itemDescription}</td>
                <td class="border border-gray-300 p-4">${transaction.usefulLife}</td>
                <td class="border border-gray-300 p-4">${transaction.issuedQty}</td>
                <td class="border border-gray-300 p-4">${transaction.issuedOffice}</td>
                <td class="border border-gray-300 p-4">${transaction.returnedQty}</td>
                <td class="border border-gray-300 p-4">${transaction.returnedOffice}</td>
                <td class="border border-gray-300 p-4">${transaction.reissuedQty}</td>
                <td class="border border-gray-300 p-4">${transaction.reissuedOffice}</td>
                <td class="border border-gray-300 p-4">${transaction.disposedQty}</td>
                <td class="border border-gray-300 p-4">${transaction.balanceQty}</td>
                <td class="border border-gray-300 p-4">${transaction.amount}</td>
                <td class="border border-gray-300 p-4">${transaction.remarks}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    document.body.appendChild(content);

    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
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

      pdf.save('semi-expendable-registry.pdf');

      document.body.removeChild(content);
    });
  }
}