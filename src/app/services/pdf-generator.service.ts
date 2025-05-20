// services/pdf-generator.service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DeliveredItem } from '../pages/shared/delivered-items/delivered-items.interface';
import { DisbursementVoucher } from './disbursement-voucher.service';
import html2canvas from 'html2canvas';
import { DeliveryReceipt } from './delivery-receipt.service';
import { AnnualProcurementPlanService } from '../pages/accounting/app-approval/app-approval.component';

@Injectable({
  providedIn: 'root'
})
export class PdfGeneratorService {
  generateProcurementPlan(plan: AnnualProcurementPlanService) {
    throw new Error('Method not implemented.');
  }
  generateDeliveryReceipt(receipt: DeliveryReceipt) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20; // Define margin for the header
  
    // Header
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.setFont('helvetica', 'bold');
    doc.text('QUANBY SOLUTIONS INC', pageWidth / 2, margin - 5, { align: 'center' });
  
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('4th Flr. Dosc Bldg., Brgy. 37-Bitano, Legazpi City, Albay', pageWidth / 2, margin + 0, { align: 'center' });
    doc.text('VAT Reg. TIN: 625-263-719-00000', pageWidth / 2, margin + 5, { align: 'center' });
  
    // Horizontal Line below Header
    doc.setDrawColor(200, 200, 200); // Light gray line
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 15, pageWidth - margin, margin + 15);
  
    // Title
    doc.setFontSize(16);
    doc.text('DELIVERY RECEIPT', pageWidth / 2, margin + 30, { align: 'center' }); // Centered title
  
    // Header information
    doc.setFontSize(12);
    doc.text(`Delivered to: ${receipt.department_name}`, margin, margin + 50);
    doc.text(`Date: ${new Date(receipt.delivery_date).toLocaleDateString()}`, pageWidth - margin - 60, margin + 50);
  
    doc.text(`TIN: ${receipt.supplier_name}`, margin, margin + 60);
    doc.text(`Terms: N/A`, pageWidth - margin - 60, margin + 60);
  
    doc.text(`Address: ${receipt.department_name}`, margin, margin + 70);
  
    // Table Headers
    const startY = margin + 80; // Adjusted Y position
    const rowHeight = 8; // Reduced row height
    const numberOfRows = 10; // Reduced number of rows
  
    // Column widths (auto-resize based on page width and margins)
    const col1Width = 30; // QTY (fixed width)
    const col2Width = 40; // UNIT (fixed width)
    const col3Width = pageWidth - 2 * margin - col1Width - col2Width; // ARTICLES (dynamic width)
  
    // Draw table header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
  
    // Draw header cells
    doc.rect(margin, startY, col1Width, rowHeight);
    doc.rect(margin + col1Width, startY, col2Width, rowHeight);
    doc.rect(margin + col1Width + col2Width, startY, col3Width, rowHeight);
  
    // Header text
    doc.text('QTY', margin + 5, startY + 6); // Adjusted text position
    doc.text('UNIT', margin + col1Width + 5, startY + 6); // Adjusted text position
    doc.text('ARTICLES', margin + col1Width + col2Width + 5, startY + 6); // Adjusted text position
  
    // Draw table rows
    doc.setFont('helvetica', 'normal');
    for (let i = 0; i < numberOfRows; i++) {
      const y = startY + (i + 1) * rowHeight;
  
      // Draw row cells
      doc.rect(margin, y, col1Width, rowHeight);
      doc.rect(margin + col1Width, y, col2Width, rowHeight);
      doc.rect(margin + col1Width + col2Width, y, col3Width, rowHeight);
  
      // Add notes to the "ARTICLES" column in the first row
      if (i === 0 && receipt.notes) {
        // Split the notes into lines if they are too long
        const notesLines = doc.splitTextToSize(receipt.notes, col3Width - 10); // Split text to fit column width
  
        // Add each line of notes to the cell
        notesLines.forEach((line: string, lineIndex: number) => {
          doc.text(
            line,
            margin + col1Width + col2Width + 5, // X position (left padding)
            y + 6 + lineIndex * 5 // Y position (top padding + line spacing)
          );
        });
      }
    }
  
    // Signature line and text at the bottom right
    const signatureLineLength = 80; // Length of the underline
    const signatureY = pageHeight - margin - 20; // Positioned at the bottom with margin
    const signatureX = pageWidth - margin - signatureLineLength; // Aligned to the right
  
    // Draw underline
    doc.line(signatureX, signatureY, signatureX + signatureLineLength, signatureY);
  
    // Center the text relative to the underline
    const text = "Customer's signature over printed name";
    const textWidth = doc.getTextWidth(text);
    const textX = signatureX + (signatureLineLength - textWidth) / 2; // Center text horizontally
  
    doc.setFontSize(10);
    doc.text(text, textX, signatureY + 5); // Text below the line
  
    // Save PDF
    doc.save(`delivery-receipt-${receipt.receipt_number}.pdf`);
  }

  generateInspectionReport(item: DeliveredItem): Blob {
    const doc = new jsPDF();

    // Header
    this.addHeaderImage(doc);
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255);
    doc.setFontSize(24);
    doc.text('INSPECTION AND ACCEPTANCE REPORT', 105, 25, { align: 'center' });

    // Content
    doc.setTextColor(0);
    doc.setFontSize(12);

    // Company Info Box
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 50, 190, 50, 'F');

    doc.setFontSize(10);
    const leftColumn = [
      { label: 'Report No:', value: `${item.id}` },
      { label: 'Inspection Date:', value: new Date().toLocaleDateString() },
      { label: 'PO Number:', value: item.poNumber || 'N/A' },
      { label: 'Total Amount:', value: item.totalAmount ? `P${item.totalAmount.toLocaleString()}` : 'N/A' }
    ];

    const rightColumn = [
      { label: 'Supplier:', value: item.supplierName },
      { label: 'Department:', value: item.department },
      { label: 'Delivery Date:', value: new Date(item.dateDelivered).toLocaleDateString() }
    ];

    let yPos = 60;
    leftColumn.forEach(row => {
      this.setFontBold(doc);
      doc.text(row.label, 15, yPos);
      this.setFontNormal(doc);
      doc.text(row.value, 50, yPos);
      yPos += 10;
    });

    yPos = 60;
    rightColumn.forEach(row => {
      this.setFontBold(doc);
      doc.text(row.label, 110, yPos);
      this.setFontNormal(doc);
      doc.text(row.value, 145, yPos);
      yPos += 10;
    });

    // Inspection Results Table
    const tableData = item.items.map(i => [
      i.id,
      i.name,
      i.quantity.toString(),
      i.isDelivered ? 'Pass' : 'Pending',
      i.isDelivered ? 'Item meets specifications' : 'Inspection pending',
      i.dateChecked ? new Date(i.dateChecked).toLocaleDateString() : 'N/A'
    ]);

    (doc as any).autoTable({
      startY: 110,
      head: [['Item ID', 'Description', 'Qty', 'Status', 'Remarks', 'Date Inspected']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [63, 81, 181],
        fontSize: 10,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 45 },
        5: { cellWidth: 30, halign: 'center' }
      }
    });

    // Quality Assurance Section
    const finalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(12);
    this.setFontBold(doc);
    doc.text('Quality Assurance Certification', 15, finalY);

    doc.setFontSize(10);
    this.setFontNormal(doc);
    doc.text('This is to certify that the above items have been inspected and verified according to', 15, finalY + 10);
    doc.text('specified quality standards and requirements.', 15, finalY + 17);
    // Signature Section - Continued from previous code
    const signatureY = finalY + 35;

    // Inspector
    doc.setFontSize(10);
    doc.text('Inspected by:', 15, signatureY);
    doc.line(15, signatureY + 20, 85, signatureY + 20);
    doc.setFontSize(8);
    doc.text('Quality Inspector', 15, signatureY + 25);
    doc.text('Date: _________________', 15, signatureY + 32);

    // Supervisor
    doc.setFontSize(10);
    doc.text('Verified by:', 105, signatureY);
    doc.line(105, signatureY + 20, 175, signatureY + 20);
    doc.setFontSize(8);
    doc.text('QA Supervisor', 105, signatureY + 25);
    doc.text('Date: _________________', 105, signatureY + 32);

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addFooter(doc, i);
    }

    return doc.output('blob');
  }



  private addHeaderImage(doc: jsPDF) {
    doc.setFillColor(63, 81, 181);
    doc.circle(20, 15, 8, 'F');
    doc.setTextColor(255);
    doc.setFontSize(12);
    doc.text('AMS', 20, 17, { align: 'center' });
  }

  private addFooter(doc: jsPDF, pageNumber: number) {
    const totalPages = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(
      `Page ${pageNumber} of ${totalPages}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${new Date().toLocaleString()}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }

  private setFontBold(doc: jsPDF) {
    doc.setFont('helvetica', 'bold');
  }

  private setFontNormal(doc: jsPDF) {
    doc.setFont('helvetica', 'normal');
  }
  // Method for generating a Disbursement Voucher PDF
  generateDisbursementVoucher(voucher: DisbursementVoucher): Blob {
    const doc = new jsPDF();
    // Header (More formal title, black and white)
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL PAYMENT AUTHORIZATION VOUCHER', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);  // Ensure black text color
    doc.line(10, 25, 200, 25);  // Line below header

    // Company Information (Example, black and white)
    doc.setFontSize(14);
    doc.text('Quanby Solutions Inc.', 105, 35, { align: 'center' });
    doc.setFontSize(10);
    doc.text('1234 Business Rd, Suite 500', 105, 40, { align: 'center' });
    doc.text('Legazpi City, Albay, 4200', 105, 45, { align: 'center' });
    doc.text('Phone: (123) 456-7890', 105, 50, { align: 'center' });
    doc.text('Email: quanbydevs@gmail.com', 105, 55, { align: 'center' });
    doc.line(10, 60, 200, 60);  // Line separator

    // Voucher Information Section (Black and white)
    doc.setFontSize(12);
    doc.text(`Voucher No: ${voucher.voucherNo}`, 15, 70);
    doc.text(`Date: ${new Date(voucher.date).toLocaleDateString()}`, 15, 80);
    doc.text(`Delivery Receipt No: ${voucher.deliveryReceiptNo}`, 15, 90);
    doc.text(`Supplier Name: ${voucher.supplierName}`, 15, 100);
    doc.text(`Payment Method: ${voucher.paymentMethod}`, 15, 110);
    doc.text(`Total Amount Due: P${voucher.totalAmountDue.toLocaleString()}`, 15, 120);

    if (voucher.notes) {
      doc.text(`Notes: ${voucher.notes}`, 15, 130);
    }

    doc.line(10, 135, 200, 135);  // Line separator

    // Function to format money with commas and peso sign
    const formatCurrency = (amount: number) => {
      return `P${amount.toLocaleString()}`;
    };

    // Items Table (Black and white)
    const tableData = voucher.itemizedDetails.map(item => [
      item.itemDescription,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.totalPrice),
    ]);

    (doc as any).autoTable({
      startY: 145,
      head: [['Item Description', 'Quantity', 'Unit Price (P)', 'Total Price (P)']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10, textColor: 0, lineWidth: 0.1 },  // Ensure black and white, add border
      headStyles: {
        textColor: 0,     // Black text
        fillColor: [255, 255, 255], // White background
        lineWidth: 0.1,   // Thin border line
        halign: 'center', // Center align header text
        valign: 'middle', // Middle vertical alignment
      },
      bodyStyles: { textColor: 0, lineWidth: 0.1 },  // Ensure black body text and border
      margin: { top: 20 },
    });


    // Final Amount & Notes (Optional)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount Due: P${voucher.totalAmountDue.toLocaleString()}`, 15, finalY);

    if (voucher.notes) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Notes: ${voucher.notes}`, 15, finalY + 10);
    }

    doc.line(10, finalY + 20, 200, finalY + 20);  // Line separator

    // Footer (Optional, Page Numbers, black and white)
    doc.setFontSize(8);
    const pageCount = doc.getNumberOfPages();
    doc.text(`Page ${doc.getCurrentPageInfo().pageNumber} of ${pageCount}`, 190, doc.internal.pageSize.height - 10, { align: 'right' });

    // Return Blob Output
    return doc.output('blob');
  }


  mockData = {
    date: '15 2022',
    modeOfProcurement: 'SMALL VALUE PROCUREMENT',
    items: [
      {
        qty: 1,
        unitOfMeasurement: 'pc',
        itemDescription: 'HEAVY DUTY PAPER SHREDDER',
        approvedBudget: '50,000.00',
        philcopyCorporation: { unitPrice: '34,070.00', totalCost: '34,070.00' },
        solidBusinessMachineInc: { unitPrice: 'HAVEN\'T SUBMITTED QUOTATION', totalCost: 'HAVEN\'T SUBMITTED QUOTATION' },
        seccComputerSales: { unitPrice: 'HAVEN\'T SUBMITTED QUOTATION', totalCost: 'HAVEN\'T SUBMITTED QUOTATION' }
      }
    ],
    preparedBy: 'ADMINISTRATIVE ASSISTANT',
    checkedBy: 'BRANCH SERVICES OFFICER',
    notedBy: 'BRANCH HEAD',
    recommendingApproval: [
      { name: 'APP IDOM A / GALLEGO', role: 'Chairperson, RBAC' },
      { name: 'SM RYAN P PASTRANA', role: 'RBAC Member' },
      { name: 'SM DAN CEEVYKYL - URBAN LATEL', role: 'RBAC Member' },
      { name: 'SM ROSA CHLESTF PIERAS', role: 'Vice-Chairperson, RBAC' },
      { name: 'SM CHRIST E. VALDENDELA', role: 'RBAC Member' },
      { name: 'SB DOZI', role: 'RBAC Member' }
    ],
    approvedBy: 'Head of Procuring Entity (HOPE)'
  };

  generateAbstractOfQuotation() {
    const content = document.createElement('div');
    content.innerHTML = `
      <div class="p-10 ml-10 bg-white shadow-md rounded-lg" style="width: 390mm; height: 350mm;">
        <h1 class="text-2xl font-bold mb-4 flex justify-center">ABSTRACT OF QUOTATIONS</h1>
        
        <div class="mb-4 text-xl">
          <div class="flex flex-row justify-between">
            <p><strong>DATE:</strong> ${this.mockData.date}</p>
            <p><strong>MODE OF PROCUREMENT:</strong> ${this.mockData.modeOfProcurement}</p>
          </div>
        </div>
      
        <table class="w-full border-collapse border border-gray-300 text-xl" style="table-layout: fixed;">
          <thead>
            <tr class="bg-gray-200">
              <th class="border border-gray-300 p-4" style="width: 5%;">QTY</th>
              <th class="border border-gray-300 p-4" style="width: 10%;">Unit of Measurement</th>
              <th class="border border-gray-300 p-4" style="width: 20%;">ITEM DESCRIPTION</th>
              <th class="border border-gray-300 p-4" style="width: 15%;">APPROVED BUDGET</th>
              <th class="border border-gray-300 p-4" style="width: 15%;">PHILCOPY CORPORATION</th>
              <th class="border border-gray-300 p-4" style="width: 15%;">SOLID BUSINESS MACHINE INC.</th>
              <th class="border border-gray-300 p-4" style="width: 15%;">SECC COMPUTER SALES, SERVICE & ENTERPRISES</th>
            </tr>
          </thead>
          <tbody>
            ${this.mockData.items
              .map(
                (item) => `
              <tr>
                <td class="border border-gray-300 p-4">${item.qty}</td>
                <td class="border border-gray-300 p-4">${item.unitOfMeasurement}</td>
                <td class="border border-gray-300 p-4">${item.itemDescription}</td>
                <td class="border border-gray-300 p-4">${item.approvedBudget}</td>
                <td class="border border-gray-300 p-4">${item.philcopyCorporation.unitPrice}<br>${item.philcopyCorporation.totalCost}</td>
                <td class="border border-gray-300 p-4">${item.solidBusinessMachineInc.unitPrice}<br>${item.solidBusinessMachineInc.totalCost}</td>
                <td class="border border-gray-300 p-4">${item.seccComputerSales.unitPrice}<br>${item.seccComputerSales.totalCost}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="mt-4 text-xl">
          <p><strong>RESOLVED,</strong> that based on the above Abstract of Quotations, the RBAC recommends to the Head of Procuring Entity (HOPE) that the contract be awarded in favor of PHILCOPY CORPORATION as the single calculated and responsive bidder/quotation.</p>
          <p><strong>RESOLVED,</strong> this 15th day of 2022 in the City of Cebu.</p>
        </div>

        <div class="mt-4 text-xl">
          <div class="flex flex-row justify-between">
            <p><strong>Purchase Requisition No. 2022-025</strong></p>
            <p><strong>Purchase Order No. 2022-025</strong></p>
          </div>
          <div class="flex flex-row justify-between">
            <p><strong>PREPARED BY:</strong> ${this.mockData.preparedBy}</p>
            <p><strong>CHECKED BY:</strong> ${this.mockData.checkedBy}</p>
            <p><strong>NOTED BY:</strong> ${this.mockData.notedBy}</p>
          </div>
        </div>

        <div class="mt-4 text-xl">
          <p><strong>Recommending Approval:</strong></p>
          ${this.mockData.recommendingApproval
            .map(
              (approver) => `
            <p>${approver.name} - ${approver.role}</p>
          `
            )
            .join('')}
        </div>

        <div class="mt-4 text-xl">
          <p><strong>APPROVED:</strong></p>
          <p>${this.mockData.approvedBy}</p>
        </div>
      </div>
    `;

    document.body.appendChild(content);

    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'legal');
      const imgWidth = 330;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pageWidth = pdf.internal.pageSize.getWidth(); // Get the page width (297mm for A4 landscape)
      const xOffset = (pageWidth - imgWidth) / 2;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('abstract-of-quotations.pdf');

      document.body.removeChild(content);
    });
  }

}