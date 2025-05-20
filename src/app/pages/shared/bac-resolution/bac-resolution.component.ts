// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf and *ngFor directives
// import { RFQService, RFQ } from 'src/app/services/rfq.service';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { ButtonModule } from 'primeng/button';

// @Component({
//   selector: 'app-bac-resolution',
//   standalone: true,
//   imports: [CommonModule, ButtonModule], // Add CommonModule for structural directives
//   templateUrl: './bac-resolution.component.html',
//   styleUrls: ['./bac-resolution.component.scss']
// })
// export class BACResolutionComponent implements OnInit {
//   rfqId = 'RFQ-20100-0004'; // Example RFQ ID to fetch data
//   mockData: any = {};

//   constructor(private rfqService: RFQService) {}

//   async ngOnInit() {
//     // Fetch data for the specified RFQ ID
//     const rfq = await this.rfqService.getById(this.rfqId);
//     if (rfq) {
//       this.populateMockData(rfq);
//     }
//   }

//   populateMockData(rfq: RFQ) {
//     this.mockData = {
//       title: `BAC Resolution No. ${rfq.id}`,
//       subtitle: `RECOMMENDING AWARD OF CONTRACT FOR RFQ ${rfq.id}`,
//       agency: 'DAVAO DE ORO STATE COLLEGE',
//       department: 'BAC',
//       address: 'Purok 15, M3GP+F4V, Poblacion, Compostela, 8803 Davao de Oro',
//       contact: 'Tel. Nos. 8634-3320 to 21; 8634-3326 / Fax Nos. 8634-3319; 8584-3691',
//       resolutionDetails: [
//         'WHEREAS, the procurement process was initiated for the RFQ;',
//         `WHEREAS, the RFQ ID is ${rfq.id};`,
//         `WHEREAS, the proposal of ${rfq.suppliers[0]?.supplierName} found to be compliant with the requirements.`,
//         `WHEREAS, the bidding price of ${rfq.suppliers[0]?.supplierName} is ₱ ${rfq.suppliers[0]?.biddingPrice?.toFixed(2)}.`,
//         'WHEREAS, the BAC evaluated the proposal and recommended approval.'
//       ],
//       suppliers: rfq.suppliers.map((supplier) => ({
//         name: supplier.supplierName,
//         bidAmount: `₱ ${supplier.biddingPrice?.toFixed(2) || '0.00'}`,
//         remarks: 'Compliant with the specifications and eligibility requirements'
//       })),
//       resolutionConclusion: [
//         'THEREFORE, BE IT RESOLVED AS IT HEREBY RESOLVED, for and in consideration of the foregoing, we, the members of ACPC-BAC, hereby recommend the following:',
//         `1) AWARD OF CONTRACT via Small Value Procurement to ${rfq.suppliers[0]?.supplierName} in the amount of ₱ ${rfq.suppliers[0]?.biddingPrice?.toFixed(2) || '0.00'} inclusive of appropriate taxes and fees.`
//       ],
//       bacMembers: [
//         { name: 'DIR. MAGDALENA S. CASUGA', role: 'Chairperson' },
//         { name: 'DIR. MA. CRISTINA G. LOPEZ', role: 'Vice Chairperson' },
//         { name: 'DIR. NORMAN WILLIAM KRAFT', role: 'Member' },
//         { name: 'NOEL CLAREICE M. DUCUSIN', role: 'Member' },
//         { name: 'KENNEDY A. CARABIAG', role: 'Member' }
//       ]
//     };
//   }

//   exportPdf() {
//     const content = document.querySelector('app-bac-resolution') as HTMLElement;

//     html2canvas(content, { scale: 2 }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'letter');
//       const imgWidth = 210;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;

//       pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
//       pdf.save('bac-resolution.pdf');
//     });
//   }
// }


import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf and *ngFor directives
import { RFQService, RFQ } from 'src/app/services/rfq.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-bac-resolution',
  standalone: true,
  imports: [CommonModule, ButtonModule], // Add CommonModule for structural directives
  templateUrl: './bac-resolution.component.html',
  styleUrls: ['./bac-resolution.component.scss']
})
export class BACResolutionComponent implements OnChanges {
  @Input() rfqId!: string; // Input parameter for RFQ ID
  mockData: any = {}; // Data to bind to the template

  constructor(private rfqService: RFQService) {}

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['rfqId'] && this.rfqId) {
      const rfq = await this.rfqService.getById(this.rfqId);
      if (rfq) {
        this.populateMockData(rfq);
        setTimeout(()=>{
          this.exportPdf();
        },1000)
      }
    }
  }

  populateMockData(rfq: RFQ) {
    this.mockData = {
      title: `BAC Resolution No. ${rfq.id}`,
      subtitle: `RECOMMENDING AWARD OF CONTRACT FOR RFQ ${rfq.id}`,
      department: 'Department of Agriculture',
      agency: 'AGRICULTURAL CREDIT POLICY COUNCIL',
      address: '28/F One San Miguel Avenue (OSMA) Bldg., San Miguel Avenue corner Shaw Blvd., Ortigas Center 1605 Pasig City',
      contact: 'Tel. Nos. 8634-3320 to 21; 8634-3326 / Fax Nos. 8634-3319; 8584-3691',
      resolutionDetails: [
        'WHEREAS, the procurement process was initiated for the RFQ;',
        `WHEREAS, the RFQ ID is ${rfq.id};`,
        `WHEREAS, the proposal of ${rfq.suppliers[0]?.supplierName} found to be compliant with the requirements.`,
        `WHEREAS, the bidding price of ${rfq.suppliers[0]?.supplierName} is ₱ ${rfq.suppliers[0]?.biddingPrice?.toFixed(2)}.`,
        'WHEREAS, the BAC evaluated the proposal and recommended approval.'
      ],
      suppliers: rfq.suppliers.map((supplier) => ({
        name: supplier.supplierName,
        bidAmount: `₱ ${supplier.biddingPrice?.toFixed(2) || '0.00'}`,
        remarks: 'Compliant with the specifications and eligibility requirements'
      })),
      resolutionConclusion: [
        'THEREFORE, BE IT RESOLVED AS IT HEREBY RESOLVED, for and in consideration of the foregoing, we, the members of ACPC-BAC, hereby recommend the following:',
        `1) AWARD OF CONTRACT via Small Value Procurement to ${rfq.suppliers[0]?.supplierName} in the amount of ₱ ${rfq.suppliers[0]?.biddingPrice?.toFixed(2) || '0.00'} inclusive of appropriate taxes and fees.`
      ],
      bacMembers: [
        { name: 'DIR. MAGDALENA S. CASUGA', role: 'Chairperson' },
        { name: 'DIR. MA. CRISTINA G. LOPEZ', role: 'Vice Chairperson' },
        { name: 'DIR. NORMAN WILLIAM KRAFT', role: 'Member' },
        { name: 'NOEL CLAREICE M. DUCUSIN', role: 'Member' },
        { name: 'KENNEDY A. CARABIAG', role: 'Member' }
      ]
    };
  }

  exportPdf() {
    const content = document.querySelector('.bac-resolution') as HTMLElement;
    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'letter');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('bac-resolution.pdf');
    });
  }
  
}
