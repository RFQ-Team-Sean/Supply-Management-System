import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DeliveredItem, DeliveryItem } from '../pages/shared/delivered-items/delivered-items.interface';

@Injectable({
  providedIn: 'root'
})
export class DeliveredItemsService {
  private mockData: DeliveredItem[] = [
    {
      id: '1',
      supplierName: 'Tech Solutions Inc.',
      supplierId: 'SUP-001',
      dateDelivered: new Date('2025-01-20'),
      department: 'IT',
      documentUrl: 'assets/mock-invoice.pdf',
      status: 'pending',
      totalAmount: 150000,
      poNumber: 'PO-2025-001',
      items: [
        { id: '1-1', name: 'Laptop Dell XPS 13', quantity: 5, status: 'pending', isDelivered: false },
        { id: '1-2', name: 'Monitor 27"', quantity: 5, status: 'pending', isDelivered: false },
        { id: '1-3', name: 'Wireless Mouse', quantity: 10, status: 'pending', isDelivered: false }
      ],
      lastUpdated: new Date()
    },
    {
      id: '2',
      supplierName: 'Office Depot',
      supplierId: 'SUP-002',
      dateDelivered: new Date('2025-01-19'),
      department: 'HR',
      documentUrl: 'assets/mock-invoice.pdf',
      status: 'pending',
      totalAmount: 75000,
      poNumber: 'PO-2025-002',
      items: [
        { id: '2-1', name: 'Office Chairs', quantity: 10, status: 'pending', isDelivered: false },
        { id: '2-2', name: 'Filing Cabinets', quantity: 3, status: 'pending', isDelivered: false }
      ],
      lastUpdated: new Date()
    }
  ];

  getDeliveredItems(): Observable<DeliveredItem[]> {
    return of(this.mockData);
  }

  updateDeliveryItems(itemId: string, updatedItems: DeliveryItem[]): Observable<any> {
    const itemIndex = this.mockData.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      this.mockData[itemIndex].items = updatedItems.map(item => ({
        ...item,
        dateChecked: item.isDelivered ? new Date() : undefined
      }));
      this.mockData[itemIndex].lastUpdated = new Date();
    }
    return of({ success: true });
  }

  acceptDelivery(itemId: string): Observable<any> {
    const itemIndex = this.mockData.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      this.mockData[itemIndex].status = 'accepted';
      this.mockData[itemIndex].lastUpdated = new Date();
    }
    return of({ success: true });
  }

  rejectDelivery(itemId: string, reason: string): Observable<any> {
    const itemIndex = this.mockData.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
      this.mockData[itemIndex].status = 'rejected';
      this.mockData[itemIndex].remarks = reason;
      this.mockData[itemIndex].lastUpdated = new Date();
    }
    return of({ success: true });
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

  generateDeliveryReceipt(itemId: string): Observable<Blob> {
    const item = this.mockData.find(i => i.id === itemId);
    if (!item) return of(new Blob());
    
    const doc = new jsPDF();
    
    // Header
    this.addHeaderImage(doc);
    doc.setFillColor(63, 81, 181);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255);
    doc.setFontSize(24);
    doc.text('DELIVERY RECEIPT', 105, 25, { align: 'center' });
    
    // Content
    doc.setTextColor(0);
    doc.setFontSize(12);
    
    // Company Info Box
    doc.setFillColor(240, 240, 240);
    doc.rect(10, 50, 190, 50, 'F');
    
    doc.setFontSize(10);
    const leftColumn = [
      { label: 'Receipt No:', value: `${item.supplierId}_DR` },
      { label: 'Date:', value: new Date(item.dateDelivered).toLocaleDateString() },
      { label: 'PO Number:', value: item.poNumber || 'N/A' },
      { label: 'Total Amount:', value: item.totalAmount ? `₱${item.totalAmount.toLocaleString()}` : 'N/A' }
    ];

    const rightColumn = [
      { label: 'Supplier:', value: item.supplierName },
      { label: 'Department:', value: item.department },
      { label: 'Status:', value: item.status.toUpperCase() }
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

    // Items Table
    const tableData = item.items.map(i => [
      i.id,
      i.name,
      i.quantity.toString(),
      i.isDelivered ? '✓' : '✗',
      i.remarks || '',
      i.dateChecked ? new Date(i.dateChecked).toLocaleDateString() : ''
    ]);

    (doc as any).autoTable({
      startY: 110,
      head: [['Item ID', 'Description', 'Qty', 'Delivered', 'Remarks', 'Date Checked']],
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
        1: { cellWidth: 60 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 35 },
        5: { cellWidth: 35, halign: 'center' }
      }
    });

    // Signature Section
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    this.setFontBold(doc);
    doc.text('Received by:', 15, finalY);
    doc.line(15, finalY + 20, 85, finalY + 20);
    doc.setFontSize(8);
    this.setFontNormal(doc);
    doc.text('Signature over printed name', 15, finalY + 25);
    doc.text('Date: _________________', 15, finalY + 32);
    
    doc.setFontSize(10);
    this.setFontBold(doc);
    doc.text('Verified by:', 105, finalY);
    doc.line(105, finalY + 20, 175, finalY + 20);
    doc.setFontSize(8);
    this.setFontNormal(doc);
    doc.text('Signature over printed name', 105, finalY + 25);
    doc.text('Date: _________________', 105, finalY + 32);

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      this.addFooter(doc, i);
    }

    return of(doc.output('blob'));
  }

  generateInspectionReport(itemId: string): Observable<Blob> {
    const item = this.mockData.find(i => i.id === itemId);
    if (!item) return of(new Blob());
    
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
      { label: 'Report No:', value: `${item.supplierId}_IAR` },
      { label: 'Inspection Date:', value: new Date().toLocaleDateString() },
      { label: 'PO Number:', value: item.poNumber || 'N/A' },
      { label: 'Total Amount:', value: item.totalAmount ? `₱${item.totalAmount.toLocaleString()}` : 'N/A' }
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

return of(doc.output('blob'));
}

generatePurchaseOrder(itemId: string): Observable<Blob> {
  const item = this.mockData.find(i => i.id === itemId);
  if (!item) return of(new Blob());
  
  const doc = new jsPDF();
  
  // Header
  this.addHeaderImage(doc);
  doc.setFillColor(63, 81, 181);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255);
  doc.setFontSize(24);
  doc.text('PURCHASE ORDER', 105, 25, { align: 'center' });
  
  // Content
  doc.setTextColor(0);
  doc.setFontSize(12);
  
  // Company Info Box
  doc.setFillColor(240, 240, 240);
  doc.rect(10, 50, 190, 50, 'F');
  
  doc.setFontSize(10);
  const leftColumn = [
    { label: 'PO Number:', value: item.poNumber || 'N/A' },
    { label: 'Order Date:', value: new Date(item.dateDelivered).toLocaleDateString() },
    { label: 'Payment Terms:', value: 'Net 30' },
    { label: 'Total Amount:', value: item.totalAmount ? `₱${item.totalAmount.toLocaleString()}` : 'N/A' }
  ];

  const rightColumn = [
    { label: 'Supplier:', value: item.supplierName },
    { label: 'Supplier ID:', value: item.supplierId },
    { label: 'Department:', value: item.department },
    { label: 'Status:', value: item.status.toUpperCase() }
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

  // Items Table
  const tableData = item.items.map(i => [
    i.id,
    i.name,
    i.quantity.toString(),
    '₱0.00', // Add unit price if available
    '₱0.00'  // Add total price if available
  ]);

  (doc as any).autoTable({
    startY: 110,
    head: [['Item ID', 'Description', 'Quantity', 'Unit Price', 'Total']],
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
      1: { cellWidth: 80 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' }
    }
  });

  // Terms and Conditions
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  
  this.setFontBold(doc);
  doc.text('Terms and Conditions:', 15, finalY);
  this.setFontNormal(doc);
  doc.setFontSize(9);
  const terms = [
    '1. All items must be delivered according to the specified quantities and specifications.',
    '2. Delivery must be completed within the agreed timeline.',
    '3. Payment will be processed upon complete delivery and acceptance of items.',
    '4. Any deviation from the order must be approved in writing.'
  ];

  let termsY = finalY + 10;
  terms.forEach(term => {
    doc.text(term, 15, termsY);
    termsY += 7;
  });

  // Signature Section
  const signatureY = termsY + 15;
  
  this.setFontBold(doc);
  doc.setFontSize(10);
  doc.text('Prepared by:', 15, signatureY);
  doc.line(15, signatureY + 20, 85, signatureY + 20);
  doc.setFontSize(8);
  this.setFontNormal(doc);
  doc.text('Purchasing Officer', 15, signatureY + 25);
  doc.text('Date: _________________', 15, signatureY + 32);
  
  doc.setFontSize(10);
  this.setFontBold(doc);
  doc.text('Approved by:', 105, signatureY);
  doc.line(105, signatureY + 20, 175, signatureY + 20);
  doc.setFontSize(8);
  this.setFontNormal(doc);
  doc.text('Department Head', 105, signatureY + 25);
  doc.text('Date: _________________', 105, signatureY + 32);

  // Add footer to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    this.addFooter(doc, i);
  }

  return of(doc.output('blob'));
}
}

export { DeliveredItem };
