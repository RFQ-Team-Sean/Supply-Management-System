//purchase-request.service.ts

import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

// Re-export the interfaces and types
export { PurchaseRequest, PurchaseRequestStatus, Signatory, PurchaseRequestItem } from '../pages/inspection/purchase-request/purchase-request.interface';
import { PurchaseRequest, PurchaseRequestStatus } from '../pages/inspection/purchase-request/purchase-request.interface';

@Injectable({
    providedIn: 'root'
})
export class PurchaseRequestService {
    private purchaseRequests: PurchaseRequest[] = [];

    constructor() {
        this.initializeSampleData();
    }

    private initializeSampleData() {
        this.purchaseRequests.push({
            coaInfo: {
                annexNo: 'Annex G-6',
                circularNo: 'COA Circular No. 2001-04, S. 2001'
            },
            id: '1',
            prNo: '13-10-246',
            date: new Date('2017-10-06'),
            requisitioningOffice: 'INFORMATION TECHNOLOGY SERVICES DEPARTMENT',
            items: [
               
                
            ],
            purpose: 'For use in the Installation of Directional Signs and Tourist Destination Signs at Designated ASEAN Route',
            totalAmount: 956000.00,
            requestedBy: {
                name: 'NICEAS C. CABERTE',
                designation: 'Chief, Maintenance Section'
            },
            recommendedBy: {
                name: 'NICEAS C. CABERTE',
                designation: 'Chief, Maintenance Section'
            },
            approvedBy: {
                name: 'FRANCIS ANTONIO L. FLORES',
                designation: 'District Engineer'
            },
            status: PurchaseRequestStatus.Pending,
            certification: {
                name: 'SERVILLA C. MEJIAS',
                designation: 'Head Procurement'
            },
            saiDate: null,  // Changed from undefined to null
            alobsDate: null,  
        });
    }
    
    async update(request: PurchaseRequest): Promise<void> {
        try {
            // Implement your update logic here
            // For example:
            // await this.http.put(`/api/purchase-requests/${request.id}`, request).toPromise();
        } catch (error) {
            throw error;
        }
    }
    async getAll(): Promise<PurchaseRequest[]> {
        return this.purchaseRequests;
    }

    async getById(id: string): Promise<PurchaseRequest | undefined> {
        return this.purchaseRequests.find(pr => pr.id === id);
    }

    async save(purchaseRequest: PurchaseRequest): Promise<void> {
        const index = this.purchaseRequests.findIndex(pr => pr.id === purchaseRequest.id);
        if (index >= 0) {
            this.purchaseRequests[index] = purchaseRequest;
        } else {
            this.purchaseRequests.push(purchaseRequest);
        }
    }

    async updateStatus(id: string, status: PurchaseRequestStatus): Promise<void> {
        const request = await this.getById(id);
        if (request) {
            request.status = status;
            await this.save(request);
        }
    }

    async getByPPMPId(ppmpId: string): Promise<PurchaseRequest[]> {
        return this.purchaseRequests.filter(pr => pr.ppmpId === ppmpId);
    }

    async getByAPPId(appId: string): Promise<PurchaseRequest[]> {
        return this.purchaseRequests.filter(pr => pr.appId === appId);
    }

    generatePurchaseRequestPdf(data: PurchaseRequest): string {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(12);
        doc.text('Republic of the Philippines', 105, 20, { align: 'center' });
        doc.text('DEPARTMENT OF PUBLIC WORKS AND HIGHWAYS', 105, 25, { align: 'center' });
        doc.text('OFFICE OF THE DISTRICT ENGINEER', 105, 30, { align: 'center' });
        doc.text('Bohol 1st District Engineering Office', 105, 35, { align: 'center' });
        doc.text('Tagbilaran City, Bohol', 105, 40, { align: 'center' });

       // Title
        doc.setFontSize(16);
        doc.text('PURCHASE REQUEST', 105, 50, { align: 'center' });
        doc.setFontSize(10);
        // Check if coaInfo is an object or string and handle accordingly
        if (data.coaInfo && typeof data.coaInfo === 'object') {
            doc.text(data.coaInfo.annexNo, 170, 45);
            doc.text(data.coaInfo.circularNo, 170, 50);
        } else {
            doc.text('Annex G-6', 170, 45);
            doc.text('COA Circular No. ' + (data.coaInfo || '2001-04, S. 2001'), 170, 50);
        }

        // PR Details
        doc.setFontSize(10);
        doc.text(`REQUISITIONING OFFICE: ${data.requisitioningOffice}`, 20, 60);
        doc.text(`P.R. No.: ${data.prNo}`, 150, 60);
        doc.text(`Date: ${data.date.toLocaleDateString()}`, 150, 65);

        // Table
        let yPos = 80;
        const headers = ['ITEM NO.', 'UNIT', 'ITEM / DESCRIPTION', 'QTY.', 'ESTIMATED UNIT COST', 'ESTIMATED TOTAL'];
        const colWidths = [20, 25, 60, 20, 35, 35];
        let xPos = 15;
        
        // Draw Headers
        headers.forEach((header, i) => {
            doc.rect(xPos, yPos, colWidths[i], 10);
            doc.text(header, xPos + 2, yPos + 6);
            xPos += colWidths[i];
        });
        
        yPos += 10;

        // Draw Items
        data.items.forEach(item => {
            xPos = 15;
            const rowHeight = 10;

            // Item Number
            doc.rect(xPos, yPos, colWidths[0], rowHeight);
            doc.text(item.itemNo.toString(), xPos + 2, yPos + 6);
            xPos += colWidths[0];
            
            // Unit
            doc.rect(xPos, yPos, colWidths[1], rowHeight);
            doc.text(item.unit, xPos + 2, yPos + 6);
            xPos += colWidths[1];
            
            // Description (handle long text)
            doc.rect(xPos, yPos, colWidths[2], rowHeight);
            doc.text(item.description, xPos + 2, yPos + 6, { maxWidth: colWidths[2] - 4 });
            xPos += colWidths[2];
            
            // Quantity
            doc.rect(xPos, yPos, colWidths[3], rowHeight);
            doc.text(item.qty.toString(), xPos + 2, yPos + 6);
            xPos += colWidths[3];
            
            // Unit Cost
            doc.rect(xPos, yPos, colWidths[4], rowHeight);
            doc.text(item.unitCost.toFixed(2), xPos + 2, yPos + 6);
            xPos += colWidths[4];
            
            // Total Cost
            doc.rect(xPos, yPos, colWidths[5], rowHeight);
            doc.text(item.totalCost.toFixed(2), xPos + 2, yPos + 6);
            
            yPos += rowHeight;
        });

        // Total
        xPos = 15;
        const totalWidth = colWidths.reduce((a, b) => a + b, 0);
        doc.rect(xPos, yPos, totalWidth - colWidths[5], 10);
        doc.text('TOTAL', xPos + totalWidth - colWidths[5] - 20, yPos + 6);
        doc.rect(xPos + totalWidth - colWidths[5], yPos, colWidths[5], 10);
        doc.text(`₱ ${data.totalAmount.toFixed(2)}`, xPos + totalWidth - colWidths[5] + 2, yPos + 6);

        // Certification
        yPos += 20;
        doc.text('CERTIFICATION:', 20, yPos);
        yPos += 10;
        doc.text('This is to certify that the', 25, yPos);
        yPos += 5;
        doc.text('herein requisitioned items are included', 25, yPos);
        yPos += 5;
        doc.text('in the approved APP.', 25, yPos);
        yPos += 15;
        // Add null check for certification
    if (data.certification) {
        doc.text(data.certification.name, 25, yPos);
        yPos += 5;
        doc.text(data.certification.designation, 25, yPos);
    } else {
        // Optional: Add placeholder or skip if no certification
        doc.text('____________________', 25, yPos);
        yPos += 5;
        doc.text('Supply Officer', 25, yPos);
    }

        // Purpose
        yPos += 15;
        doc.text(`Purpose: ${data.purpose}`, 20, yPos);

        // Signatories
        yPos += 20;
        doc.text('RECOMMENDING APPROVAL:', 20, yPos);
        doc.text('APPROVED BY:', 120, yPos);
        yPos += 25;
        doc.text(data.recommendedBy.name, 20, yPos);
        doc.text(data.approvedBy.name, 120, yPos);
        yPos += 5;
        doc.text(data.recommendedBy.designation, 20, yPos);
        doc.text(data.approvedBy.designation, 120, yPos);

        return doc.output('datauristring');
    }

    // Alias method for backward compatibility
    generatePDF = this.generatePurchaseRequestPdf;
}