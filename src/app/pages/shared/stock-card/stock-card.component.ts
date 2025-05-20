import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-stock-card',
  standalone: true,
  imports: [ButtonModule], 
  templateUrl: './stock-card.component.html',
  styleUrls: ['./stock-card.component.scss']
})
export class StockCardComponent {
  mockData = {
    entityName: 'Sample Entity',
    fundCluster: '101',
    item: 'Sample Item',
    stockNo: '12345',
    description: 'Sample Description',
    reorderPoint: '50',
    unitOfMeasurement: 'Unit(s)',
    transactions: [
      { date: '2023-10-01', reference: 'REF-001', receiptQty: 100, issueQty: 50, balanceQty: 50, daysToConsume: 30 },
      { date: '2023-10-15', reference: 'REF-002', receiptQty: 0, issueQty: 25, balanceQty: 25, daysToConsume: 15 },
      { date: '2023-10-30', reference: 'REF-003', receiptQty: 75, issueQty: 30, balanceQty: 45, daysToConsume: 20 },
      { date: '2023-11-01', reference: 'REF-004', receiptQty: 50, issueQty: 20, balanceQty: 75, daysToConsume: 25 },
      { date: '2023-11-15', reference: 'REF-005', receiptQty: 100, issueQty: 50, balanceQty: 125, daysToConsume: 40 },
      { date: '2023-11-30', reference: 'REF-006', receiptQty: 0, issueQty: 30, balanceQty: 95, daysToConsume: 30 },
      { date: '2023-12-01', reference: 'REF-007', receiptQty: 60, issueQty: 20, balanceQty: 135, daysToConsume: 45 },
      { date: '2023-12-15', reference: 'REF-008', receiptQty: 80, issueQty: 40, balanceQty: 175, daysToConsume: 50 },
      { date: '2023-12-30', reference: 'REF-009', receiptQty: 0, issueQty: 25, balanceQty: 150, daysToConsume: 35 },
      { date: '2024-01-01', reference: 'REF-010', receiptQty: 90, issueQty: 30, balanceQty: 210, daysToConsume: 55 },
    ],
  };

  exportPdf() {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-10 bg-white shadow-md rounded-lg">
        <h1 class="text-4xl font-bold mb-4 flex justify-center">STOCK CARD</h1>
        
        <div class="mb-4 text-2xl">
          <div class="flex flex-row justify-between">
            <p><strong>Entity Name:</strong> ${this.mockData.entityName}</p>
            <p><strong>Fund Cluster:</strong> ${this.mockData.fundCluster}</p>
          </div>
          <div class="flex flex-row justify-between">
            <p><strong>Item:</strong> ${this.mockData.item}</p>
            <p><strong>Stock No.:</strong> ${this.mockData.stockNo}</p>
          </div>
          <div class="flex flex-row justify-between">
            <p><strong>Description:</strong> ${this.mockData.description}</p>
            <p><strong>Re-order Point:</strong> ${this.mockData.reorderPoint}</p>
          </div>
          <div class="flex flex-row justify-between">
            <p><strong>Unit of Measurement:</strong> ${this.mockData.unitOfMeasurement}</p>
          </div>
        </div>
      
        <table class="w-full border-collapse border border-gray-300 text-2xl">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 p-4">Date</th>
              <th class="border border-gray-300 p-4">Reference</th>
              <th class="border border-gray-300 p-4">Receipt Qty.</th>
              <th class="border border-gray-300 p-4">Issue Qty.</th>
              <th class="border border-gray-300 p-4">Balance Qty.</th>
              <th class="border border-gray-300 p-4">No. of Days to Consume</th>
            </tr>
          </thead>
          <tbody>
            ${this.mockData.transactions
              .map(
                (transaction) => `
              <tr>
                <td class="border border-gray-300 p-4">${transaction.date}</td>
                <td class="border border-gray-300 p-4">${transaction.reference}</td>
                <td class="border border-gray-300 p-4">${transaction.receiptQty}</td>
                <td class="border border-gray-300 p-4">${transaction.issueQty}</td>
                <td class="border border-gray-300 p-4">${transaction.balanceQty}</td>
                <td class="border border-gray-300 p-4">${transaction.daysToConsume}</td>
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

      pdf.save('stock-card.pdf');

      document.body.removeChild(content);
    });
  }
}