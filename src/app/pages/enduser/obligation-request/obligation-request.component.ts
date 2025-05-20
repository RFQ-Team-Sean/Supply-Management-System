import { CommonModule } from '@angular/common';
import { Component, NgZone, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormArray } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CrudService } from 'src/app/services/crud.service';
import { Budget, Contract, FundSource, PPMPProject, PurchaseRequest, Office, Building, ObligationRequest, UserBudget, Document, Department } from 'src/app/schema/schema';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { SkeletonModule } from 'primeng/skeleton';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
interface ContractOption {
  label: string;
  value: string; // contract.id
}
interface ORSWithTotal {
  totalAmount: number;
}
interface FieldRow {
  particulars: string;
  mfoPap: string;
  uacsObjectCode: string;
  amount: string;
}

const ENTITY_NAME_MAP: { [key: number]: string } = {
  2: 'Purchase Request', // entity_id: 2 
  5: 'Purchase Order'    // entity_id: 5
};

interface ChecklistItem {
  name: string;
  entityId: number;
  checked: boolean;
  fileName?: string;
}

@Component({
  selector: 'app-obligation-request',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    CommonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
    FileUploadModule,
    FormsModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    ConfirmPopupModule,
    ConfirmDialogModule,
    CheckboxModule,
    SkeletonModule
  ],
  templateUrl: './obligation-request.component.html',
  styleUrl: './obligation-request.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class ObligationRequestComponent implements OnInit {

  @ViewChild('pdfContent') pdfContent!: ElementRef;

  private vendorInfoData: { companyName: string; address: string; }[] = [];
  private contractData: Contract[] = [];
  private purchaseRequestData: PurchaseRequest[] = [];
  private ppmpProjectData: PPMPProject[] = [];
  private userBudgetData: UserBudget[] = [];
  private budgetData: Budget[] = [];
  private fundSourceData: FundSource[] = [];
  private officeData: Office[] = [];
  private departmentData: Department[] = [];
  private buildingData: Building[] = [];
  private documentData: Document[] = [];
  private currentUserId: string = 'U-12456-1A';

  additionalDocs: File[] = [];
  mainDocs: File[] = [];
  pdfBlob: Blob | null = null;
  pdfBlobUrl: string | null = null;

  loading: boolean = true;

  supportingDocsChecklist: ChecklistItem[] = [
    { name: ENTITY_NAME_MAP[2], entityId: 2, checked: false, fileName: undefined }, // PURCHASE REQ
    { name: ENTITY_NAME_MAP[5], entityId: 5, checked: false, fileName: undefined } // PURCHASE ORDER
  ];

  searchQuery = '';
  displayDialog = false;
  requestDateFormatted: string = this.formatDate(new Date());
  uploadedFiles: File[] = [];
  fundSourceId: string = '';

  orsList: ObligationRequest[] = [];
  filteredORSList: ObligationRequest[] = [];

  previewDialogVisible: boolean = false;
  selectedORS: ObligationRequest | null = null;
  selectedOrs: string | null = null;

  fundSourceOptions: { label: string; value: string }[] = [];

  ors: ObligationRequest = {
    serialNo: '',
    entityName: 'Department of Education',
    date: '',
    fundSourceId: '',
    requestingOffice: '',
    payee: '',
    address: '',
    responsibilityCenter: '',
    items: [{ particulars: '', mfoPap: '', uacsObjectCode: '50203010', amount: 0 }],
    supportingDocs: [],
    status: 'Pending' as const,
    obligationAmount: 0,
    payableNotYetDue: 0,
    payableDue: 0,
    paymentAmount: 0,
    balanceObligation: 0,
    balancePayable: 0,
    obligationReferences: [],
    requestDate: new Date(),
    accountCode: '',
    totalAmount: 0
  };

  contracts: { label: string; value: string }[] = [];
  selectedContract: string | null = null;

  orsForm: FormGroup;
  fields: FieldRow[] = [{ particulars: '', mfoPap: '', uacsObjectCode: '', amount: '' }];

  private subscription: Subscription = new Subscription();
  
  get fieldsArray() {
    return this.orsForm.get('items') as FormArray;
  }

  // get amountsArray() {
  //   return this.orsForm.get('amounts') as FormArray; // New FormArray for amounts
  // }

  constructor(
    private messageService: MessageService,
    private crudService: CrudService,
    private userService: UserService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    this.orsForm = this.fb.group({
      fundSourceId: ['', Validators.required],
      items: this.fb.array([
        this.fb.group({
          particulars: ['', Validators.required],
          mfoPap: ['', Validators.required],
          uacsObjectCode: ['', Validators.required],
          amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
        })
      ])
    });
    this.ors.items = [{ particulars: '', mfoPap: '', uacsObjectCode: '', amount: 0 }];
    this.ors.accountCode = this.currentUserId;
  }

  async ngOnInit() {
    await this.loadAllData();
    this.ors.accountCode = this.currentUserId;
    this.setEntityNameFromUser();
    this.fundSourceOptions = this.fundSourceData.map(fs => ({
      label: fs.source_name,
      value: fs.id
    }));
  }

  // addAmount() {
  //   this.amountsArray.push(this.fb.control('', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]));
  // }

  // removeAmount(index: number) {
  //   if (this.amountsArray.length > 1) {
  //     this.amountsArray.removeAt(index);
  //   }
  // }

  async loadAllData() {
    this.loading = true;
    try {
      this.contractData = await this.crudService.getAll(Contract);
      console.log('Contract Data:', this.contractData);

      this.budgetData = await this.crudService.getAll(Budget);
      console.log('Budget Data:', this.budgetData);

      this.purchaseRequestData = await this.crudService.getAll(PurchaseRequest);
      this.ppmpProjectData = await this.crudService.getAll(PPMPProject);
      this.userBudgetData = await this.crudService.getAll(UserBudget);
      this.fundSourceData = await this.crudService.getAll(FundSource);
      this.officeData = await this.crudService.getAll(Office);
      this.buildingData = await this.crudService.getAll(Building);
      this.orsList = await this.crudService.getAll(ObligationRequest);
      this.documentData = await this.crudService.getAll(Document);
      this.departmentData = await this.crudService.getAll(Department);

      console.log('Budget Data:', this.budgetData);

      this.contracts = this.contractData.map(contract => ({
        label: `${contract.id} - ${contract.contractor_name} (${contract.contract_amount} PHP)`,
        value: contract.id
      }));
      console.log('Mapped Contracts:', this.contracts);

      this.filteredORSList = [...this.orsList];
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error loading data:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data.' });
    } finally {
      this.loading = false;
    }
  }

  filterRequests() {
    this.filteredORSList = this.orsList.filter(ors =>
      Object.values(ors).some(value =>
        value?.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    );
  }

  addField() {
    this.fields.push({ particulars: '', mfoPap: '', uacsObjectCode: '', amount: '' });
  }

  removeField(index: number) {
    if (this.fields.length > 1) {
      this.fields.splice(index, 1);
    }
  }

  updateFormValues() {
    const itemsArray = this.orsForm.get('items') as FormArray;
  // Only update if fields have changed
  if (this.fields.length !== itemsArray.length || !this.fields.every((field, i) => {
    const control = itemsArray.at(i);
    return control.value.particulars === field.particulars &&
           control.value.mfoPap === field.mfoPap &&
           control.value.uacsObjectCode === field.uacsObjectCode &&
           control.value.amount === field.amount;
  })) {
    itemsArray.clear();
    this.fields.forEach(field => {
      itemsArray.push(this.fb.group({
        particulars: [field.particulars || '', Validators.required],
        mfoPap: [field.mfoPap || '', Validators.required],
        uacsObjectCode: [field.uacsObjectCode || '50203010', Validators.required],
        amount: [field.amount || '', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
      }));
    });
  }
  }

  private setEntityNameFromUser() {
    const user = this.userService.getUser(); // Assuming UserService provides current user
    const userOffice = this.officeData.find(o => o.id === user?.officeId);
    const userDepartment = this.departmentData.find(d => d.id === userOffice?.department_id);
    this.ors.entityName = userDepartment?.name || 'Unknown Department';
  }

  showDialog() {
    this.displayDialog = true;
    this.resetForm();
  }

  onContractChange(event: { value: Contract['id'] }) {
  console.log('Contract Changed:', event.value);
  const contractId = event.value;
  const contract = this.contractData.find(c => c.id === contractId);
  if (!contract) {
    this.resetForm();
    return;
  }

  const purchaseRequest = this.purchaseRequestData.find(pr => pr.id === contract.purchase_request_id);
  const ppmpProject = purchaseRequest ? this.ppmpProjectData.find(p => p.id === purchaseRequest.project_id) : null;
  const office = purchaseRequest ? this.officeData.find(o => o.id === purchaseRequest.office_id) : null;
  const building = office ? this.buildingData.find(b => b.id === office.building_id) : null;
  const userBudget = ppmpProject ? this.userBudgetData.find(ub => ub.id === ppmpProject.user_budget_id) : null;
  const budget = userBudget ? this.budgetData.find(b => b.id === userBudget.budget_id) : null;

  this.ngZone.run(() => {
    this.ors = {
      ...this.ors,
      serialNo: `ORS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      entityName: 'Department of Education',
      date: this.formatDate(new Date()),
      fundSourceId: budget?.fund_id || '',
      requestingOffice: office?.name || 'Unknown Office',
      payee: contract.contractor_name,
      address: building?.address || '',
      responsibilityCenter: office ? `${office.name.split(' ')[0]}-001` : '',
      items: [{
        particulars: ppmpProject?.project_description || `Payment for contract ${contract.id}`,
        mfoPap: ppmpProject?.project_code || 'MFO-DEFAULT',
        uacsObjectCode: '50203010',
        amount: contract.contract_amount || 0
      }],
      totalAmount: contract.contract_amount || 0,
      supportingDocs: this.getRelatedFiles(contractId, contract.purchase_request_id),
      obligationAmount: contract.contract_amount,
      payableNotYetDue: contract.contract_amount,
      payableDue: 0,
      paymentAmount: 0,
      balanceObligation: contract.contract_amount,
      balancePayable: contract.contract_amount,
      obligationReferences: [{ date: this.formatDate(new Date()), particulars: 'Obligation recorded', refNo: this.ors.serialNo }],
      requestDate: new Date(),
      accountCode: this.currentUserId
    };

    // Sync fields and form
    this.fields = this.ors.items.map(item => ({
      particulars: item.particulars,
      mfoPap: item.mfoPap,
      uacsObjectCode: item.uacsObjectCode,
      amount: item.amount.toString()
    }));
    console.log('Fields after mapping:', JSON.stringify(this.fields, null, 2));

    const itemsArray = this.orsForm.get('items') as FormArray;
    itemsArray.clear();
    this.fields.forEach(field => {
      itemsArray.push(this.fb.group({
        particulars: [field.particulars, Validators.required],
        mfoPap: [field.mfoPap, Validators.required],
        uacsObjectCode: [field.uacsObjectCode, Validators.required],
        amount: [field.amount, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
      }));
    });
    this.orsForm.patchValue({ fundSourceId: this.ors.fundSourceId });
    console.log('Form after update:', JSON.stringify(this.orsForm.value, null, 2));

    this.updateChecklist(contractId, contract.purchase_request_id);
    this.cdr.detectChanges();
  });
}
  
  private getRelatedFiles(contractId: string, purchaseRequestId: string): string[] {
    const relatedDocs = this.documentData.filter(doc =>
      (doc.entity_id === 5 && doc.record_id === contractId) || // Purchase Order
      (doc.entity_id === 2 && doc.record_id === purchaseRequestId) // Purchase Request
    );
    const contract = this.contractData.find(c => c.id === contractId);
    const files = relatedDocs.map(doc => doc.file_path.split('/').pop() || '');
    if (contract?.attachment) {
      files.push(contract.attachment.split('/').pop() || '');
    }
    return files;
  }

  private updateChecklist(contractId: string, purchaseRequestId: string) {
    const relatedDocs = this.documentData.filter(doc =>
      (doc.entity_id === 5 && doc.record_id === contractId) || // Purchase Order
      (doc.entity_id === 2 && doc.record_id === purchaseRequestId) // Purchase Request
    );
    const contract = this.contractData.find(c => c.id === contractId);
  
    if (!relatedDocs.length && !contract?.attachment) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Documents',
        detail: 'No supporting documents found for this contract.'
      });
    }
  
    this.supportingDocsChecklist.forEach(item => {
      if (item.entityId === 2) {
        const prDoc = relatedDocs.find(doc => doc.entity_id === 2);
        item.checked = !!prDoc;
        item.fileName = prDoc ? prDoc.file_path.split('/').pop() : undefined;
      } else if (item.entityId === 5) {
        const poDoc = relatedDocs.find(doc => doc.entity_id === 5);
        item.checked = !!poDoc || !!contract?.attachment;
        item.fileName = poDoc ? poDoc.file_path.split('/').pop() : (contract?.attachment?.split('/').pop() || undefined);
      }
    });
  
    this.mainDocs = [];
    this.additionalDocs = [];
    relatedDocs.forEach(doc => {
      const fileName = doc.file_path.split('/').pop() || '';
      const file = new File([], fileName);
      if (this.supportingDocsChecklist.some(check => check.entityId === doc.entity_id)) {
        this.mainDocs.push(file);
      } else {
        this.additionalDocs.push(file);
      }
    });
    if (contract?.attachment) {
      const fileName = contract.attachment.split('/').pop() || '';
      this.mainDocs.push(new File([], fileName));
    }
  }

  getFundSourceName(fundSourceId: string): string {
    const fundSource = this.fundSourceData.find(fs => fs.id === fundSourceId);
    return fundSource ? fundSource.source_name : '';
  }


  onFileUpload(event: any) {
    const newFiles = event.files as File[];
    this.additionalDocs = [...this.additionalDocs, ...newFiles];
    this.ors.supportingDocs = [...this.mainDocs.map(f => f.name), ...this.additionalDocs.map(f => f.name)];
    const contractId = this.selectedContract;
    const purchaseRequestId = this.contractData.find(c => c.id === contractId)?.purchase_request_id || '';
    if (contractId && purchaseRequestId) {
      if (contractId && purchaseRequestId) {
        this.updateChecklist(contractId, purchaseRequestId);
      }
    }
    this.messageService.add({ severity: 'info', summary: 'Files Uploaded', detail: `${newFiles.length} files added.` });
    this.cdr.detectChanges();
  }
  
  calculateTotalAmount(items: any[]): number {
    return items?.reduce((sum, item) => sum + (item.amount || 0), 0);
  }

  async submitORS() {
    this.updateFormValues();
  
    if (!this.selectedContract || this.orsForm.invalid) {
      console.log('Form Invalid:', this.orsForm.value);
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Invalid Input', 
        detail: 'Please select a contract and fill all required fields.' 
      });
      return;
    }
  
    const formValues = this.orsForm.value;
    const items = this.fields.map(field => ({
      particulars: field.particulars,
      mfoPap: field.mfoPap,
      uacsObjectCode: field.uacsObjectCode,
      amount: parseFloat(field.amount) || 0
    }));
    const totalAmount = this.calculateTotalAmount(items);
  
    const serialNo = `ORS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const newORS: Omit<ObligationRequest, 'id'> = {
      serialNo,
      entityName: this.ors.entityName,
      date: this.ors.requestDate.toISOString().split('T')[0],
      fundSourceId: formValues.fundSourceId,
      requestingOffice: this.ors.requestingOffice,
      responsibilityCenter: this.ors.responsibilityCenter,
      payee: this.ors.payee,
      address: this.ors.address,
      items,
      supportingDocs: [...this.ors.supportingDocs, `${serialNo}.pdf`],
      status: 'Pending',
      obligationAmount: totalAmount,
      payableNotYetDue: totalAmount,
      payableDue: 0,
      paymentAmount: 0,
      balanceObligation: totalAmount,
      balancePayable: totalAmount,
      obligationReferences: [{
        date: this.formatDate(new Date()),
        particulars: 'Obligation recorded',
        refNo: serialNo
      }],
      accountCode: this.ors.accountCode,
      requestDate: this.ors.requestDate,
      contractId: this.selectedContract || undefined,
      totalAmount // Explicitly set since it's a getter in the class
    };
  
    const pdfBlob = await this.generatePDF(newORS);
    if (!pdfBlob) {
      return; // Stop if PDF generation fails
    }
  
    const fileName = `${serialNo}.pdf`;
    if (!this.pdfBlob) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'PDF blob is not available.' });
      return;
    }
    const url = URL.createObjectURL(this.pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  
    try {
      const createdORS = await this.crudService.create(ObligationRequest, newORS);
      this.orsList.unshift(createdORS);
      this.filteredORSList = [...this.orsList];
      this.selectedORS = new ObligationRequest();
      Object.assign(this.selectedORS, createdORS, { totalAmount: this.calculateTotalAmount(createdORS.items) });
      this.messageService.add({ severity: 'success', summary: 'ORS Created', detail: 'Submitted successfully.' });
    } catch (error) {
      console.error('Error creating ORS:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create ORS.' });
    }
  
    this.resetForm();
    this.displayDialog = false;
  }

  async generatePDF(ors: ObligationRequest) {
    try {
      // Sync form fields to ors.items
      this.updateFormValues(); // Ensure fields are up-to-date
      const items = this.fields.map(field => ({
        particulars: field.particulars,
        mfoPap: field.mfoPap,
        uacsObjectCode: field.uacsObjectCode,
        amount: parseFloat(field.amount) || 0
      }));
  
      // Assign the passed ors to this.ors with updated items
      this.ors = new ObligationRequest();
      Object.assign(this.ors, {
        ...ors,
        items: items // Override items with the latest from fields
      });
  
      // Force DOM update
      this.cdr.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100)); // Ensure DOM renders
  
      const doc = new jsPDF();
      const content = this.pdfContent.nativeElement;
  
      if (!content) {
        throw new Error('PDF content element not found');
      }
  
      console.log('Items before PDF generation:', this.ors.items); // Debug
  
      const canvas = await html2canvas(content, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
  
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
  
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      if (this.pdfBlobUrl) {
        URL.revokeObjectURL(this.pdfBlobUrl);
      }
      this.pdfBlob = doc.output('blob');
      this.pdfBlobUrl = URL.createObjectURL(this.pdfBlob);
      console.log('PDF Generated:', { pdfBlob: this.pdfBlob });
      return this.pdfBlob;
    } catch (error) {
      console.error('PDF Generation Failed:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to generate PDF.' });
      return null;
    }
  }

  async saveORS() {
    if (!this.selectedORS || !this.selectedORS.id) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No valid ORS selected for update.' });
      return;
    }
  
    try {
      const { id, ...orsWithoutId } = this.selectedORS;
      const totalAmount = orsWithoutId.items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const updateData = {
        ...orsWithoutId,
        totalAmount
      };
      const updatedORS = await this.crudService.update(ObligationRequest, this.selectedORS.id, updateData);
      const index = this.orsList.findIndex(ors => ors.id === updatedORS.id);
      if (index !== -1) {
        this.orsList[index] = updatedORS;
        this.filteredORSList = [...this.orsList];
      }
      this.messageService.add({ severity: 'success', summary: 'ORS Updated', detail: 'Saved successfully.' });
      this.previewDialogVisible = false; // Close dialog after saving
    } catch (error) {
      console.error('Error updating ORS:', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save ORS.' });
    }
  }

  downloadPDF(fileName: string) {
    console.log('Download Attempt:', { fileName, pdfBlob: this.pdfBlob, selectedORS: this.selectedORS });
    if (this.pdfBlob && this.selectedORS && fileName === `${this.selectedORS.serialNo}.pdf`) {
      const url = this.pdfBlobUrl || URL.createObjectURL(this.pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      if (!this.pdfBlobUrl) {
        URL.revokeObjectURL(url); // Clean up only if we created a new URL
      }
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error',
        detail: 'PDF not available for download or file name mismatch.'
      });
    }
  }

  private getBuildingAddress(officeId?: string): string {
    if (!officeId) return '';
    const office = this.officeData.find(o => o.id === officeId);
    const building = office ? this.buildingData.find(b => b.id === office.building_id) : null;
    return building?.address || '';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-yellow-200';
      case 'Approved': return 'bg-green-300';
      case 'Rejected': return 'bg-red-300';
      default: return 'bg-gray-300';
    }
  }

  resetForm() {
    this.ors = new ObligationRequest();
    this.ors.items = [{ particulars: '', mfoPap: '', uacsObjectCode: '', amount: 0 }];
    this.ors.accountCode = this.currentUserId;
    this.requestDateFormatted = this.formatDate(this.ors.requestDate);
    this.selectedContract = null;
    this.mainDocs = [];
    this.additionalDocs = [];
    this.supportingDocsChecklist.forEach(item => (item.checked = false));
    this.orsForm.reset();
    const itemsArray = this.orsForm.get('items') as FormArray;
    itemsArray.clear();
    itemsArray.push(this.fb.group({
      particulars: ['', Validators.required],
      mfoPap: ['', Validators.required],
      uacsObjectCode: ['', Validators.required],
      amount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]]
    }));
    this.fields = [{ particulars: '', mfoPap: '', uacsObjectCode: '', amount: '' }];
    this.cdr.detectChanges();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onFileRemove(event: any) {
    const removedFile = event.file;
    this.additionalDocs = this.additionalDocs.filter(f => f.name !== removedFile.name);
    this.ors.supportingDocs = [...this.mainDocs.map(f => f.name), ...this.additionalDocs.map(f => f.name)];
    const contractId = this.selectedContract;
    const purchaseRequestId = this.contractData.find(c => c.id === contractId)?.purchase_request_id || '';
    if (contractId && purchaseRequestId) {
      this.updateChecklist(contractId, purchaseRequestId);
    }
    this.cdr.detectChanges();
  }

  viewFile(fileName: string) {
    const relatedDoc = this.documentData.find(doc => doc.file_path.endsWith(fileName));
    const contract = this.contractData.find(c => c.attachment?.endsWith(fileName));
  
    const isPRorPO = (relatedDoc && (relatedDoc.entity_id === 2 || relatedDoc.entity_id === 5)) || (contract && contract.attachment?.endsWith(fileName) && fileName.includes('purchase_order'));
  
    if (isPRorPO) {
      this.messageService.add({
        severity: 'info',
        summary: 'Preview',
        detail: `Previewing ${fileName} (simulated)`
      });
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'File Not Found',
        detail: `${fileName} not available or not a Purchase Request/Purchase Order document`
      });
    }
  }

  removeFile(file: File) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== file.name);
    this.ors.supportingDocs = this.uploadedFiles.map(f => f.name);
    const contractId = this.selectedContract;
    const purchaseRequestId = this.contractData.find(c => c.id === contractId)?.purchase_request_id || '';
    if (contractId && purchaseRequestId) {
      this.updateChecklist(contractId, purchaseRequestId);
    }    
    this.cdr.detectChanges();
  }

  async showPreviewDialog(ors: ObligationRequest) {
    this.selectedORS = new ObligationRequest();
    Object.assign(this.selectedORS, {
      ...ors,
      requestDate: ors.requestDate instanceof Date ? ors.requestDate : new Date(ors.requestDate),
      items: [...ors.items], // Deep copy items
      supportingDocs: [...(ors.supportingDocs || []), `${ors.serialNo}.pdf`]
    });
    this.selectedORS.totalAmount = this.calculateTotalAmount(this.selectedORS.items); // Set totalAmount explicitly
  
    const pdfBlob = await this.generatePDF(this.selectedORS);
    if (!pdfBlob) {
      return; // Stop if PDF generation fails
    }
  
    this.previewDialogVisible = true;
    this.cdr.detectChanges();
  }

  deleteORS(ors: ObligationRequest) {
    if (!ors || !ors.id) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No valid ORS selected for deletion.' });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ORS <br> <span class="font-bold">${ors.id}</span>?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      accept: async () => {
        try {
          await this.crudService.delete(ObligationRequest, ors.id!);
          this.orsList = this.orsList.filter(item => item.id !== ors.id);
          this.filteredORSList = this.filteredORSList.filter(item => item.id !== ors.id);
          this.previewDialogVisible = false;
          this.selectedORS = null;
          this.selectedOrs = null;
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'ORS deleted successfully.' });
        } catch (error) {
          console.error('Error deleting ORS:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete ORS.' });
        }
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled.' });
      }
    });
  }
}