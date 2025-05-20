import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { RFQ, RFQService } from 'src/app/services/rfq.service';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { FluidModule } from 'primeng/fluid';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUpload, FileUploadModule, UploadEvent } from 'primeng/fileupload';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { Router } from '@angular/router';
import { Supplier, SuppliersService } from 'src/app/services/suppliers.service';
import { SelectModule } from 'primeng/select';
import { Department, DepartmentService } from 'src/app/services/departments.service';
import { User, UserService } from 'src/app/services/user.service';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TabsModule } from 'primeng/tabs';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { Requisition, RequisitionService } from 'src/app/services/requisition.service';
import { ApprovalSequenceService } from 'src/app/services/approval-sequence.service';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from 'src/app/services/notifications.service';
import { RequestQuotationComponent } from '../request-quotation/request-quotation.component';
import { AoqComponent } from '../aoq/aoq.component';
import { BACResolutionComponent } from '../bac-resolution/bac-resolution.component';
import { BudgetUtilizationComponent } from '../budget-utilization/budget-utilization.component';
import { NoaComponent } from '../noa/noa.component';

@Component({
  selector: 'app-rfq',
  standalone: true,
  imports: [MaterialModule, CommonModule, StepperModule, TableModule, ButtonModule, ButtonGroupModule, TabsModule, OverlayBadgeModule, BadgeModule,
    InputTextModule, FormsModule, SelectModule, FileUploadModule, DatePickerModule, InputNumberModule, ToastModule, ReactiveFormsModule, TextareaModule, LottieAnimationComponent,
    FluidModule, TooltipModule, DialogModule, ConfirmPopupModule, IconFieldModule, InputIconModule, DividerModule, RequestQuotationComponent, AoqComponent, 
    BudgetUtilizationComponent,NoaComponent,
    BACResolutionComponent],
  providers: [MessageService, ConfirmationService],
  templateUrl: './request-for-quotation-list.component.html',
  styleUrls: ['./request-for-quotation-list.component.scss']
})
export class RequestForQuotationListComponent implements OnInit {

  @ViewChild('fileUpload') fileUpload: FileUpload;

  activeStep: number = 1;
  rfqs: RFQ[] = [];
  filteredRFQs: RFQ[] = [];
  suppliers: Supplier[] = [];
  requisitions: Requisition[] = [];
  allRequisitions: Requisition[] = [];
  departments: Department[] = [];
  searchValue: string = '';

  showRFQModal: boolean = false;
  showSupplierModal: boolean = false;
  showAwardModal: boolean = false;

  responsiveOptions: any[] = [
    {
      breakpoint: '1300px',
      numVisible: 4
    },
    {
      breakpoint: '575px',
      numVisible: 1
    }
  ];

  files: File[] = [];

  form = new FormGroup({
    purchase_order: new FormControl<Requisition | null>(null, [Validators.required])
  });

  supplier_form = new FormGroup({
    supplier: new FormControl<Supplier | null>(null, [Validators.required])
  });
  award_form = new FormGroup({
    supplier: new FormControl<Supplier | null>(null, [Validators.required])
  });
  bid_form = new FormGroup({
    bid: new FormControl(0, [Validators.min(0.001),Validators.required])
  });
  supplier_upload_form = new FormGroup({
    upload: new FormControl('', [Validators.required])
  });
  budget_upload_form = new FormGroup({
    upload: new FormControl('', [Validators.required])
  });
  reject_form = new FormGroup({
    notes: new FormControl('', [Validators.required])
  });
  constructor(
    private router: Router,
    private userService: UserService,
    private departmentService: DepartmentService,
    private supplierService: SuppliersService,
    private rfqService: RFQService,
    private requisitionService: RequisitionService,
    private approvalSequenceService: ApprovalSequenceService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private notifService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.fetchItems();
  }

  openRFQModal() {
    this.form.reset();
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
    this.showRFQModal = true;
  }


  currentUser?: User;

  selectedRFQ?: RFQ;

  openSupplierModal(rfq: RFQ) {
    this.supplier_form.reset();
    this.selectedRFQ = rfq;
    this.showSupplierModal = true;
  }

  showBidModal:boolean =false;

  openBidModal(rfq: RFQ, supplierId:string) {
    this.bid_form.reset();
    this.selectedRFQ = rfq;
    this.selectedSupplier = this.suppliers.find(s=>s.id == supplierId);
    this.showBidModal = true;
  }

  isModalVisible = false; // Controls modal visibility

  selectedRequisitionId: string = '';

  openRFQDocument(requisitionId?: string): void {
    if (requisitionId) {
      this.selectedRequisitionId = requisitionId; // Ensure it's valid
      this.isModalVisible = true;
    } else {
      console.error('Requisition ID is null or undefined');
    }
  }


  openAwardModal(rfq: RFQ) {
    this.award_form.reset();
    this.selectedRFQ = rfq;
    this.showAwardModal = true;
  }

  onSelectedFiles(event: any) {
    this.files = event.currentFiles ?? []
  }

  showUploadSupplier: boolean = false;

  selectedSupplier?: Supplier;

  openUploadSupplier(supplierId: string) {
    this.files = [];
    this.supplier_upload_form.reset();
    this.selectedSupplier = this.suppliers.find(s=>supplierId == s.id);
    this.showUploadSupplier = true;
  }

  showUploadBudget: boolean = false;

  openUploadBudget(rfq: RFQ) {
    this.files = [];
    this.budget_upload_form.reset();
    this.selectedRFQ = rfq;
    this.showUploadBudget = true;
  }

  openEditRFQModal(rfq: RFQ) {
    this.form.reset();
    if (this.fileUpload) {
      this.fileUpload.clear();
    }

    this.form.patchValue({
      purchase_order: this.requisitions.find(r => r.id == rfq.purchase_order),
    });
    this.selectedRFQ = rfq;
    this.showRFQModal = true;
  }

  async addSupplier() {
    const supplier = this.supplier_form.value;
    await this.rfqService.editRFQ({
      ...this.selectedRFQ!,
      suppliers: [...this.selectedRFQ!.suppliers, {
        supplierId: supplier.supplier!.id!,
        supplierName: supplier.supplier!.name,
        biddingPrice: undefined,

      }]
    })
    this.supplier_form.reset();
    this.showSupplierModal = false;
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully added supplier on RFQ No. ${this.selectedRFQ!.id}` });
    await this.fetchItems();
    this.activeStep = 1;
  }

  async enterBid() {
    const bid = this.bid_form.value;
    const supplierIndex = this.selectedRFQ!.suppliers.findIndex(s=>s.supplierId == this.selectedSupplier?.id)
    this.selectedRFQ!.suppliers[supplierIndex].biddingPrice = bid.bid!;
    await this.rfqService.editRFQ({
      ...this.selectedRFQ!
    })
    this.bid_form.reset();
    this.showBidModal = false;
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully added supplier bid on RFQ No. ${this.selectedRFQ!.id}` });
    await this.fetchItems();
    this.activeStep = 1;
  }


  showReject: boolean = false;

  openReject(rfq: RFQ) {
    this.reject_form.reset();
    this.showReject = true;
    this.selectedRFQ = rfq;
  }



  async addRFQ() {
    const rfq = this.form.value;
    const id = `RFQ-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000)}`;
    await this.rfqService.addRFQ({
      id: id,
      purchase_order: rfq.purchase_order?.id,
      suppliers: [],
      status: 'new',
    });
    this.form.reset();
    this.showRFQModal = false;
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully added RFQ No. ${id}` });
    await this.fetchItems();
    this.activeStep = 1;
  }


  filterByStatus(status: 'new' | 'canvasing' | 'approved') {
    this.filteredRFQs = this.rfqs.filter(rfq => rfq.status == status);
    if(this.currentUser?.role =='accounting'){
      this.filteredRFQs = this.filteredRFQs.filter(rfq => rfq.awarding =='pending');
    }
  }

  nextStep() {
    this.activeStep++;
    switch (this.activeStep) {
      case 1:
        this.filterByStatus('new');
        break;
      case 2:
        this.filterByStatus('canvasing');
        break;
      case 3:
        this.filterByStatus('approved');
        break;
    }
  }

  countRFQ(status: 'new' | 'canvasing' | 'approved') {
    return this.rfqs.filter(rfq => rfq.status == status).length;
  }

  backStep() {
    this.activeStep--;
    switch (this.activeStep) {
      case 1:
        this.filterByStatus('new');
        break;
      case 2:
        this.filterByStatus('canvasing');
        break;
      case 3:
        this.filterByStatus('approved');
        break;

    }
  }

  switchTab(number: 1 | 2 | 3) {
    this.activeStep = number;
    switch (this.activeStep) {
      case 1:
        this.filterByStatus('new');
        break;
      case 2:
        this.filterByStatus('canvasing');
        break;
      case 3:
        this.filterByStatus('approved');
        break;

    }
  }

  async confirmDeleteRFQ(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to delete this RFQ?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirm',
      },
      accept: async () => {
        await this.rfqService.deleteRFQ(id);
        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully deleted RFQ.` });
        await this.fetchItems();
        this.activeStep = 1;
      },
      reject: () => { },
    });
  }



  async confirmDeleteSupplier(event: Event, rfq: RFQ, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to remove this supplier?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirm',
      },
      accept: async () => {
        await this.rfqService.editRFQ({
          ...rfq,
          suppliers: rfq.suppliers.filter(s => s.supplierId != id)
        })



        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully removed supplier.` });
        await this.fetchItems();
        this.activeStep = 1;
      },
      reject: () => { },
    });
  }


  async confirmSubmitToCanvasing(event: Event, rfq: RFQ) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to submit this RFQ for canvasing?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Confirm',
      },
      accept: async () => {
        await this.rfqService.editRFQ({
          ...rfq,
          status: 'canvasing',
        })
        const users = await firstValueFrom(this.userService.getAllUsers());
        const po = this.allRequisitions.find(r => r.id == rfq.purchase_order);
        for (let user of users) {
          if (user.role == 'bac' || user.id == po?.createdByUserId) {
            this.notifService.addNotification(
              `RFQ No. ${rfq.id} has been submitted for end-user canvasing.`,
              'info',
              user.id
            )
          }
        }

        this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully submitted RFQ for End User Canvasing.` });
        await this.fetchItems();
        this.filterByStatus('canvasing');
        this.activeStep = 2;
      },
      reject: () => { },
    });
  }



  async confirmApprove(rfq: RFQ) {
    const supplier = this.award_form.value;
    await this.rfqService.editRFQ({
      ...rfq,
      status: 'approved',
      supplier: supplier.supplier!.id
    })
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully approved RFQ.` });
    const users = await firstValueFrom(this.userService.getAllUsers());
    for (let user of users) {
      if (user.role == 'bac') {
        this.notifService.addNotification(
          `RFQ No. ${rfq.id} has been approved on end-user canvasing.`,
          'info',
          user.id
        )
      }
    }
    await this.fetchItems();
    this.filterByStatus('canvasing');
    this.activeStep = 2;
    this.showAwardModal = false;
  }
  getSupplierName(id?: string) {
    return this.suppliers.find(s => s.id == id)?.name ?? 'N/A';
  }

  async rejectRFQ(rfq: RFQ) {
    await this.rfqService.editRFQ({
      ...rfq,
      status: 'new',
    })
    this.showReject = false;
    const users = await firstValueFrom(this.userService.getAllUsers());
    for (let user of users) {
      if (user.role == 'bac') {
        this.notifService.addNotification(
          `RFQ No. ${rfq.id} has been rejected on end-user canvasing.`,
          'info',
          user.id
        )
      }
    }
    this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully rejected RFQ.` });
    await this.fetchItems();
    this.filterByStatus('canvasing');
    this.activeStep = 2;
  }

  getPR(id?: string) {
    return this.allRequisitions.find(r => r.id == id);
  }

  getPRTotal(id: string) {
    const req = this.allRequisitions.find(r => r.id == id);
    return req?.products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0) ?? 0
  }

  getUntakenSuppliers(rfq: RFQ) {
    return this.suppliers.filter(s => !rfq?.suppliers.map(t => t.supplierId).includes(s.id!))
  }

  getTakenSuppliers(rfq: RFQ) {
    return this.suppliers.filter(s => rfq?.suppliers.map(t => t.supplierId).includes(s.id!))
  }

  async fetchItems() {
    this.currentUser = this.userService.getUser();
    this.allRequisitions = await this.requisitionService.getAllRequisitions();
    this.rfqs = await this.rfqService.getAll();
    this.rfqs = this.rfqs.filter(r => this.getPR(r.purchase_order));
    this.suppliers = await this.supplierService.getAll();
    this.departments = await this.departmentService.getAllDepartments();
    const allSequences = await firstValueFrom(this.approvalSequenceService.getAllSequences());

    this.requisitions = this.allRequisitions
      .map((req) => {
        // const typeSequences = allSequences.filter(
        //   (seq) => seq.type === (req.currentApprovalLevel <= 4 ? 'procurement' : 'supply')
        // );

        const currentSequence = allSequences.find(
          (seq) => seq.id === req.approvalSequenceId
        );

        return {
          ...req,
          approvalSequenceDetails: currentSequence
          ,
        };
      })
      .filter((req) => {
        if (this.rfqs.find(dr => dr.purchase_order == req.id)) {
          return false;
        }
        return req.approvalSequenceDetails && (req.approvalSequenceDetails?.roleCode == 'bac')
      });
    if (this.currentUser?.role == 'enduser') {
      this.filterByStatus('canvasing');
      this.activeStep = 2;
    }else if(this.currentUser?.role == 'accounting'){
      this.filterByStatus('approved');
      this.activeStep =3;
    }
     else {
      this.filterByStatus('new');
    }
  }


  showAOQModal: boolean = false; // Modal visibility control
  selectedRFQId: string | null = null; // Selected RFQ ID for AOQ

  generateAOQ(rfqId: string): void {
    this.selectedRFQId = rfqId; // Set the RFQ ID to pass to AoqComponent
    this.showAOQModal = true; // Show the modal
  }

  showBACResolution: boolean = false; // Modal visibility control
  selectedRFQResoId: string | null = null; // Selected RFQ ID for AOQ
  generateBACResolution(rfqId: string): void {
    this.selectedRFQResoId = rfqId; // Set the RFQ ID to pass to AoqComponent
    this.showBACResolution = true; // Show the modal
  }

  showBudgetReport: boolean = false; // Modal visibility control
  selectedRFQBudgetId: string | null = null; // Selected RFQ ID for AOQ
 generateBudgetReport(rfqId: string): void {
  this.selectedRFQBudgetId = rfqId; // Set the RFQ ID to pass to BudgetUtilizationComponent
  this.showBudgetReport = true; // Show the modal for budget report
}


  @ViewChild('signatureCanvas', { static: false })
  signatureCanvas!: ElementRef<HTMLCanvasElement>;
  private canvasContext!: CanvasRenderingContext2D;
  private isSigned = false;

  closeSignatureDialog() {
    this.displaySignatureDialog = false;
    this.clearSignature();
  }

  signatureDataUrl:string;

  async submitApproval() {
    try {
      if (!this.isSigned) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Signature',
          detail: 'Please provide your signature before approving.',
        });
        return;
      }  
      // Capture the signature
      const canvas = this.signatureCanvas.nativeElement;
      this.signatureDataUrl = canvas.toDataURL('image/png');
     
      if(this.currentUser?.role == 'accounting'){
        await this.rfqService.editRFQ({
          ...this.selectedRFQ!,
          awarding:'awarded'
        })
      }else{
        await this.rfqService.editRFQ({
          ...this.selectedRFQ!,
          awarding:'pending'
        })
      }

      const users = await firstValueFrom(this.userService.getAllUsers());
      for (let user of users) {
        if (user.role == 'bac' || user.role == 'accounting' || user.role =='enduser') {
          
          if(this.currentUser?.role == 'accounting'){
            this.notifService.addNotification(
              `RFQ No. ${this.selectedRFQ!.id} budget utilization report has been submitted.`,
              'info',
              user.id
            )
            if(user.role =='bac'){
              this.notifService.addNotification(
                `RFQ No. ${this.selectedRFQ!.id} notice of award can now be distributed.`,
                'info',
                user.id
              )
            }
          }else{
            this.notifService.addNotification(
              `RFQ No. ${this.selectedRFQ!.id} BAC Resolution has been forwarded.`,
              'info',
              user.id
            )
          }
        }
      }
      this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully submitted Budget Utilization Report.` });
      this.displaySignatureDialog = false;
      await this.fetchItems();
      this.filterByStatus('approved');
      this.activeStep = 3;


    }catch (e) {}
  }


displaySignatureDialog:boolean =false;
  
openSignatureDialog(rfq:RFQ) {
  this.selectedRFQ = rfq;
  this.displaySignatureDialog = true;
  setTimeout(() => this.setupSignatureCanvas(), 0); // Initialize the canvas after the dialog is opened
}

openBudgetSignatureDialog(rfq:RFQ) {
  this.selectedRFQ = rfq;
  this.displaySignatureDialog = true;
  setTimeout(() => this.setupSignatureCanvas(), 0); // Initialize the canvas after the dialog is opened
}


  private setupSignatureCanvas() {
    const canvas = this.signatureCanvas.nativeElement;
    this.canvasContext = canvas.getContext('2d')!;
    this.canvasContext.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    this.isSigned = false; // Reset the signature flag
  
    let isDrawing = false;
  
    // Event listeners for drawing on the canvas
    canvas.addEventListener('mousedown', () => {
      isDrawing = true;
      this.isSigned = true; // Mark that a signature has been drawn
      this.canvasContext.beginPath(); // Start a new drawing path
    });
  
    canvas.addEventListener('mousemove', (event: MouseEvent) => {
      if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left; // Get the X coordinate relative to the canvas
        const y = event.clientY - rect.top; // Get the Y coordinate relative to the canvas
        this.canvasContext.lineTo(x, y); // Draw a line to the new coordinates
        this.canvasContext.stroke(); // Render the line
      }
    });
  
    canvas.addEventListener('mouseup', () => (isDrawing = false)); // Stop drawing when the mouse is released
    canvas.addEventListener('mouseout', () => (isDrawing = false)); // Stop drawing when the mouse leaves the canvas
  }
  
  // Clears the signature canvas.
  clearSignature() {
    const canvas = this.signatureCanvas.nativeElement;
    this.canvasContext.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    this.isSigned = false; // Reset the signature flag
  }

  showNOAModal: boolean = false; // Control modal visibility for NOA

  openNOAModal(rfqId: string): void {
  this.selectedRFQId = rfqId; // Set the RFQ ID to pass to the NoaComponent
  this.showNOAModal = true; // Show the NOA modal
}

}
