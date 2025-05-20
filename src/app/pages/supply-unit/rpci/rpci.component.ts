import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportsGenerationService, RPCI } from 'src/app/services/reports.generation.service';

@Component({
  selector: 'app-rpci',
  standalone: true,
  imports: [ButtonModule, TableModule, DialogModule, CardModule, ReactiveFormsModule, CommonModule],
  templateUrl: './rpci.component.html',
  styleUrls: ['./rpci.component.scss'],
})
export class RpciComponent implements OnInit {
  rpciForm: FormGroup;
  displayDialog: boolean = false;
  editingIndex: number = -1;
  rpciReports: RPCI[] = [];

  constructor(private fb: FormBuilder, private rpciService: ReportsGenerationService) {
    this.rpciForm = this.fb.group({
      rpciNo: ['', Validators.required],
      fundCluster: ['', Validators.required],
      date: ['', Validators.required],
      department: ['', Validators.required],
      accountableOfficer: ['', Validators.required],
      totalValue: ['', [Validators.required, Validators.min(0)]],
      status: ['', Validators.required],
      remarks: [''],
      items: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadRpcReports();
  }

  loadRpcReports() {
    this.rpciService.getAllRpci().subscribe({
      next: (data: RPCI[]) => {
        console.log('Received RPCI data:', data);
        this.rpciReports = data.map(rpci => ({
          id: rpci.id,
          rpci_no: rpci.rpci_no,
          fund_cluster: rpci.fund_cluster,
          date: new Date(rpci.date),
          department: rpci.department,
          accountable_officer: rpci.accountable_officer,
          total_value: rpci.total_value,
          status: rpci.status,
          remarks: rpci.remarks
        }));
      },
      error: (error: any) => {
        console.error('Error loading RPCI reports:', error);
      }
    });
  }

  showDialog() {
    this.displayDialog = true;
    this.editingIndex = -1;
    this.rpciForm.reset();
  }

  editRPCI(rpci: any) {
    this.editingIndex = this.rpciReports.indexOf(rpci);
    this.rpciForm.patchValue({
      rpciNo: rpci.rpci_no,
      fundCluster: rpci.fund_cluster,
      date: rpci.date.toISOString().split('T')[0],
      department: rpci.department,
      accountableOfficer: rpci.accountable_officer,
      totalValue: rpci.total_value,
      status: rpci.status,
      remarks: rpci.remarks
    });
    this.displayDialog = true;
  }

  deleteRPCI(rpci: RPCI) {
    const id = rpci.id;
    this.rpciService.deleteRpci(id).subscribe({
      next: () => {
        this.loadRpcReports();
      },
      error: (error) => {
        console.error('Error deleting RPCI:', error);
      }
    });
  }

  saveRPCI() {
    if (this.rpciForm.invalid) {
      alert('Please fill out all required fields.');
      return;
    }

    const newRPCI = {
      id: this.rpciReports[this.editingIndex].id,
      rpci_no: this.rpciForm.value.rpciNo,
      fund_cluster: this.rpciForm.value.fundCluster,
      date: new Date(this.rpciForm.value.date),
      department: this.rpciForm.value.department,
      accountable_officer: this.rpciForm.value.accountableOfficer,
      total_value: this.rpciForm.value.totalValue,
      status: this.rpciForm.value.status,
      remarks: this.rpciForm.value.remarks
    };

    if (this.editingIndex === -1) {
      this.rpciService.createRpci(newRPCI).subscribe({
        next: () => {
          this.loadRpcReports();
          this.displayDialog = false;
          this.rpciForm.reset();
        },
        error: (error) => {
          console.error('Error creating RPCI:', error);
        }
      });
    } else {
      const id = this.rpciReports[this.editingIndex].id;
      this.rpciService.updateRpci(id, newRPCI).subscribe({
        next: () => {
          this.loadRpcReports();
          this.displayDialog = false;
          this.rpciForm.reset();
        },
        error: (error) => {
          console.error('Error updating RPCI:', error);
        }
      });
    }
  }

  exportPdf(rpci = this.rpciReports[0]) {
    const content = document.createElement('div');
    
    // Format the date properly
    const formattedDate = rpci.date instanceof Date 
      ? rpci.date.toLocaleDateString() 
      : new Date(rpci.date).toLocaleDateString();
    
    content.innerHTML = `
      <div class="p-8 bg-white">
        <div class="text-center mb-4">
          <h2 class="text-xl font-bold">REPORT ON THE PHYSICAL COUNT OF INVENTORIES</h2>
          <p class="text-sm">(Type of Inventory Items)</p>
          <p class="mt-2">As of ${formattedDate}</p>
        </div>
  
        <div class="mb-4">
          <p>Fund Cluster: ${rpci.fund_cluster}</p>
        </div>
  
        <div class="flex justify-between text-sm mb-2">
          <p>For which <u>Name of Accountable Officer</u>: ${rpci.accountable_officer} <u>Office of Designation</u>: ${rpci.department} <u>Station/Unit</u>: ${rpci.department} is accountable, having assumed such accountability on: <u>Date of Assumption</u> ${formattedDate}</p>
        </div>
  
        <table class="w-full border-collapse border border-black text-sm">
          <thead>
            <tr>
              <th class="border border-black p-1 w-1/12">Article</th>
              <th class="border border-black p-1 w-2/12">Description</th>
              <th class="border border-black p-1 w-1/12">Stock Number</th>
              <th class="border border-black p-1 w-1/12">Unit of Measure</th>
              <th class="border border-black p-1 w-1/12">Unit Value</th>
              <th class="border border-black p-1 w-1/12" colspan="2">Balance Per Card</th>
              <th class="border border-black p-1 w-1/12">On Hand Per Count</th>
              <th class="border border-black p-1 w-1/12">Shortage/Overage</th>
              <th class="border border-black p-1 w-2/12">Remarks</th>
            </tr>
            <tr>
              <th class="border border-black p-1" colspan="5"></th>
              <th class="border border-black p-1">Qty</th>
              <th class="border border-black p-1">Value</th>
              <th class="border border-black p-1" colspan="3"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-black p-1">Item 1</td>
              <td class="border border-black p-1">Office Supplies</td>
              <td class="border border-black p-1">SN-001</td>
              <td class="border border-black p-1">Pieces</td>
              <td class="border border-black p-1">₱100.00</td>
              <td class="border border-black p-1">100</td>
              <td class="border border-black p-1">₱10,000.00</td>
              <td class="border border-black p-1">98</td>
              <td class="border border-black p-1">-2</td>
              <td class="border border-black p-1">Missing items</td>
            </tr>
            <tr>
              <td class="border border-black p-1">Item 2</td>
              <td class="border border-black p-1">Computer Equipment</td>
              <td class="border border-black p-1">SN-002</td>
              <td class="border border-black p-1">Units</td>
              <td class="border border-black p-1">₱15,000.00</td>
              <td class="border border-black p-1">30</td>
              <td class="border border-black p-1">₱450,000.00</td>
              <td class="border border-black p-1">30</td>
              <td class="border border-black p-1">0</td>
              <td class="border border-black p-1">Complete</td>
            </tr>
            <tr>
              <td class="border border-black p-1">Item 3</td>
              <td class="border border-black p-1">Furniture</td>
              <td class="border border-black p-1">SN-003</td>
              <td class="border border-black p-1">Sets</td>
              <td class="border border-black p-1">₱5,000.00</td>
              <td class="border border-black p-1">8</td>
              <td class="border border-black p-1">₱40,000.00</td>
              <td class="border border-black p-1">8</td>
              <td class="border border-black p-1">0</td>
              <td class="border border-black p-1">Complete</td>
            </tr>
            ${Array(7).fill('').map(() => `
              <tr>
                <td class="border border-black p-1 h-10"></td>
                <td class="border border-black p-1"></td>
                <td class="border border-black p-1"></td>
                <td class="border border-black p-1"></td>
                <td class="border border-black p-1"></td>
                <td class="border border-black p-1"></td>
                <td class="border border-black p-1"></td>
                <td class="border border-black p-1"></td>
                <td class="border border-black p-1"></td>
                <td class="border border-black p-1"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
  
        <div class="mt-4 flex justify-between text-sm">
          <div class="w-1/3 text-center">
            <p>Certified Correct by:</p>
            <br><br>
            <p>___________________________</p>
            <p>Signature over Printed Name of</p>
            <p>Inventory Committee Chair</p>
          </div>
          <div class="w-1/3 text-center">
            <p>Approved by:</p>
            <br><br>
            <p>___________________________</p>
            <p>Signature over Printed Name of Head of</p>
            <p>Agency/Entity or Authorized Representative</p>
          </div>
          <div class="w-1/3 text-center">
            <p>Verified by:</p>
            <br><br>
            <p>___________________________</p>
            <p>Signature over Printed Name of COA</p>
            <p>Representative</p>
          </div>
        </div>
  
        <div class="mt-4 text-sm text-right">
          <p>Total Value: ₱${rpci.total_value.toLocaleString()}</p>
          <p>Status: ${rpci.status}</p>
          <p>RPCI No: ${rpci.rpci_no}</p>
          <p>Remarks: ${rpci.remarks}</p>
        </div>
      </div>
    `;
  
    document.body.appendChild(content);
  
    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('rpci-report.pdf');
      document.body.removeChild(content);
    });
  }
}  