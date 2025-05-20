import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, Validators } from '@angular/forms';
import { Office, PPMP, PPMPItem, PPMPProject, ProcurementMode, ProcurementProcess, Users, Budget, UserBudget, FundSource, PPMPSchedule, Approvals, Approver } from 'src/app/schema/schema';
import { CrudService } from 'src/app/services/crud.service';
import { DynamicFormComponent, DynamicFormData } from 'src/app/components/dynamic-form/dynamic-form.component';
import { UserService } from 'src/app/services/user.service';
import { ProgressTableComponent, ProgressTableData } from 'src/app/components/progress-table/progress-table.component';
import { SignatureModalComponent, SignatureModalData } from 'src/app/components/signature-modal/signature-modal.component';
import { ToastModule } from 'primeng/toast';
import { PpmpDialogComponent, PPMPFormData } from 'src/app/components/ppmp-dialog/ppmp-dialog.component';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';

// Define ProjectStatus enum to match your schema
enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Extended PPMPProject interface with additional fields for display purposes
interface PPMPProjectJoin extends PPMPProject {
  office: string;
  totalAmount: number;
  mode_name: string;
  status_extended: string;
  items_count: number;
  creation_date?: Date;
  submission_date?: Date | null;
  approval_date?: Date | null;
  remarks?: string;
  signature?: string;
  fiscal_year: number; 
  user_signature?: string; // Added from PPMP
  head_signature?: string; // Added from PPMP
  approvals?: Approvals[];
  approvers?: Approver[];
}

@Component({
  selector: 'app-ppmp',
  templateUrl: './ppmp.component.html',
  styleUrls: ['./ppmp.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ProgressTableComponent,
    DynamicFormComponent,
    SignatureModalComponent,
    PpmpDialogComponent,
    ToastModule,
    DialogModule,
    DropdownModule,
    FormsModule,
    ButtonModule
  ],
  providers: [CurrencyPipe, DatePipe, MessageService]
})
export class PpmpComponent implements OnInit {
  user?: Users;
  documentViewerVisible: boolean = false;
  documentUrl: SafeResourceUrl | null = null;
  fiscalYears: number[] = [];
  selectedFiscalYear: number = new Date().getFullYear();
  consolidationLoading: boolean = false;

  constructor(
    private crudService: CrudService,
    private router: Router,
    private userService: UserService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
    private messageService: MessageService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    // Load user first
    this.user = this.userService.getUser();
    
    const currentYear = new Date().getFullYear();
    this.fiscalYears = Array.from({length: 5}, (_, i) => currentYear - i);
    this.selectedFiscalYear = currentYear;

    // Then load fund sources before loading other data
    this.loadFundSourceData().then(() => {
      // Now load main data after fund sources are loaded
      this.loadData();
      
      // Set up live subscription
      this.crudService.live(PPMPProject).subscribe(() => {
        this.loadData();
      });
    });
  }

  // Signature modal for user signing PPMP
  submitSignature: SignatureModalData<Partial<PPMPProjectJoin>> = {
    title: 'Submit PPMP',
    description: 'Please provide your signature to submit this PPMP for head approval.',
    id: 'signature' as any,
    data: {},
    show: false,
    submit: async (signed) => {
      this.ppmpRequests.dataLoaded = false;
      
      if (!signed) {
        throw new Error('System Error: Data not found');
      }
         
      // Update the PPMP with user signature and change status to Pending
      await this.crudService.partial_update(PPMP, signed.ppmp_id!, {
        'status': ProjectStatus.PENDING,
        'user_signature': signed.signature as string,
        'date_submitted': new Date()
      });
      
      await this.loadData();
      this.ppmpRequests.dataLoaded = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Submitted!',
        detail: 'PPMP has been submitted for Head approval.'
      });
    }
  };

  // Signature modal for head signing PPMP
  headSignature: SignatureModalData<Partial<PPMPProjectJoin>> = {
    title: 'Approve PPMP',
    description: 'Please provide your signature to approve this PPMP.',
    id: 'signature' as any,
    data: {},
    show: false,
    submit: async (signed) => {
      this.ppmpRequests.dataLoaded = false;
      
      if (!signed) {
        throw new Error('System Error: Data not found');
      }
      
      // Update the PPMP with head signature and change status to Approved
      await this.crudService.partial_update(PPMP, signed.ppmp_id!, {
        'status': ProjectStatus.APPROVED,
        'head_signature': signed.signature as string,
        'approved_by_id': this.user?.id,
        'date_approved': new Date()
      });
      
      await this.loadData();
      this.ppmpRequests.dataLoaded = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Approved!',
        detail: 'PPMP has been approved and is now ready for consolidation.'
      });
    }
  };

  // Form for rejecting PPMP
  rejectForm: DynamicFormData<Partial<PPMPProjectJoin>> = {
    show: false,
    title: "Reject PPMP",
    description: "Specify note for rejecting PPMP",
    data: {},
    formfields: [
      {
        id: 'remarks',
        label: 'Remarks',
        placeholder: 'Enter notes for rejecting PPMP',
        type: 'textarea',
        validators: [
          {
            name: 'required',
            message: 'Reject notes is required',
            validator: Validators.required
          }
        ]
      }
    ],
    submit: async (value) => {
      this.ppmpRequests.dataLoaded = false;
      
      if (!value) {
        throw new Error('System Error: Data not found');
      }
      
      // Update PPMP status to Rejected (not Draft as in your original)
      await this.crudService.partial_update(PPMP, value.ppmp_id!, {
        'status': ProjectStatus.REJECTED,
        'remarks': value.remarks
      });
      
      await this.loadData();
      this.ppmpRequests.dataLoaded = true;
      this.messageService.add({
        severity: 'warn',
        summary: 'Rejected!',
        detail: 'PPMP has been rejected and sent back to the drafting office.'
      });
    }
  };

  // PPMP Dialog data
  dialogVisible: boolean = false;
  isEditMode: boolean = false;
  dialogLoading: boolean = false;
  ppmpFormData: PPMPFormData | null = null;
  procurementModes: any[] = [];
  procurementModeData: ProcurementMode[] = [];
  procurementProcesses: ProcurementProcess[] = [];
  classifications: any[] = [];
  fundSources: { label: string; value: string }[] = [];

  // Progress table configuration
  ppmpRequests: ProgressTableData<PPMPProjectJoin, 'status'> = {
    title: 'Project Procurement Management Plans',
    description: 'Create, view, and track PPMPs in this section.',
    columns: {
      project_code: 'PPMP Code',
      project_title: 'Project Title',
      office: 'Office',
      fiscal_year: 'Fiscal Year',
      status_extended: 'Status',
      items_count: 'Items',
      totalAmount: 'Total Amount',
      mode_name: 'Procurement Mode'
    },
    formatters: {
      totalAmount: (value) => this.currencyPipe.transform(value?.toString(), 'PHP', 'symbol', '1.2-2') ?? ''
    },
    data: [],
    rowHighlight: (row) => {
      return row.status_extended === 'Rejected' ? '!bg-gradient-to-r from-orange-50 to-transparent' : '';
    },
    steps: [
      {
        id: ProjectStatus.DRAFT,
        label: 'Draft',
                icon: 'pi pi-file-plus',

      },
      {
        id: ProjectStatus.PENDING,
        label: 'For Head Approval',
                icon: 'pi pi-spinner-dotted pi-spin',

      },  
      {
        id: ProjectStatus.APPROVED,
        label: 'Consolidation',
        icon: 'pi pi-verified',
      },
    ],
    activeStep: 0,
    stepField: 'status',
    topActions: [],
    rowActions: [
      {
        hidden: (args: PPMPProjectJoin) => args.status !== ProjectStatus.DRAFT || !args.remarks,
        shape: 'rounded',
        tooltip: 'Click to view rejection remarks',
        icon: 'pi pi-inbox',
        label: 'Notice',
        function: async (event: Event, row: PPMPProjectJoin) => {
          this.rejectForm.data = row;
          this.rejectForm.title = 'Rejection Notice';
          this.rejectForm.description = 'This PPMP has been rejected due to the following reason';
          this.rejectForm.view = true;
          this.rejectForm.show = true;
        }
      },
      {
        hidden: (args: PPMPProjectJoin) => args.status !== ProjectStatus.DRAFT || this.userService.getUser()?.user_type === 'Head',
        shape: 'rounded',
        tooltip: 'Click to delete PPMP',
        icon: 'pi pi-trash',
        label: 'Delete',
        confirmation: 'Are you sure you want to delete this PPMP?',
        color: 'danger',
        function: async (event: Event, row: PPMPProjectJoin) => {
          this.ppmpRequests.dataLoaded = false;
          await this.crudService.delete(PPMP, row.ppmp_id!);
          await this.loadData();
          this.ppmpRequests.dataLoaded = true;
          this.messageService.add({
            severity: 'warn',
            summary: 'Deleted!',
            detail: 'PPMP has been deleted.'
          });
        }
      },
      {
        shape: 'rounded',
        tooltip: 'Click to view PPMP details',
        icon: 'pi pi-eye',
        label: 'View',
        function: async (event: Event, row: PPMPProjectJoin) => {
          this.router.navigate(['/planning/ppmp-details'], {
            queryParams: {
              id: row.id,
              view: 'true'
            }
          });
        }
      },
      {
        hidden: (args: PPMPProjectJoin) => args.status !== ProjectStatus.DRAFT || this.userService.getUser()?.user_type === 'Head', 
        shape: 'rounded',
        tooltip: 'Click to edit PPMP',
        icon: 'pi pi-pencil',
        label: 'Edit',
        function: async (event: Event, row: PPMPProjectJoin) => {
          this.openPpmpDialog(true, row);
        }
      },
      {
        hidden: (args: PPMPProjectJoin) => args.status !== ProjectStatus.DRAFT || args.items_count === 0 || this.userService.getUser()?.user_type === 'Head',
        shape: 'rounded',
        tooltip: 'Click to sign and submit PPMP',
        color: 'success',
        icon: 'pi pi-file-edit',
        label: 'Sign & Submit',
        function: async (event: Event, row: PPMPProjectJoin) => {
          this.submitSignature.data = row;
          this.submitSignature.show = true;
        }
      },
      {
        hidden: (args: PPMPProjectJoin) => args.status !== ProjectStatus.PENDING || this.userService.getUser()?.user_type !== 'Head',
        shape: 'rounded',
        tooltip: 'Click to sign and approve this PPMP',
        color: 'success',
        icon: 'pi pi-check',
        label: 'Sign & Approve',
        function: async (event: Event, row: PPMPProjectJoin) => {
          this.headSignature.data = row;
          this.headSignature.show = true;
        }
      },
      {
        hidden: (args: PPMPProjectJoin) => args.status !== ProjectStatus.PENDING || this.userService.getUser()?.user_type !== 'Head',
        shape: 'rounded',
        tooltip: 'Click to reject this PPMP',
        color: 'danger',
        icon: 'pi pi-times',
        label: 'Reject',
        function: async (event: Event, row: PPMPProjectJoin) => {
          this.rejectForm.data = row;
          this.rejectForm.title = "Reject PPMP";
          this.rejectForm.description = "Specify note for rejecting PPMP";
          this.rejectForm.view = false;
          this.rejectForm.show = true;
        }
      }
    ],
  };

  openPpmpDialog(isEdit: boolean, data?: PPMPProjectJoin): void {
    this.isEditMode = isEdit;
    
    if (isEdit && data) {
      // Prepare data for editing
      this.ppmpFormData = {
        project: data,
        items: [],
        schedules: []
      };
    } else {
      // Reset for new PPMP - using undefined instead of null
      this.ppmpFormData = {
        project: undefined,
        items: [],
        schedules: []
      };
    }
    
    // Make sure we have fund sources loaded before showing dialog
    if (!this.fundSources || this.fundSources.length === 0) {
      this.loadFundSourceData().then(() => {
        this.dialogVisible = true;
      });
    } else {
      this.dialogVisible = true;
    }
  }

  handleDialogClose(): void {
    this.dialogVisible = false;
  }

  async handleSavePpmp(formData: any): Promise<void> {
    this.dialogLoading = true;
    this.ppmpRequests.dataLoaded = false;
    
    try {
      console.log('Saving PPMP with data:', formData);
      
      if (this.isEditMode) {
        // Handle updating existing PPMP
        const ppmpData = await this.crudService.get(PPMP, formData.project.ppmp_id);
        await this.crudService.partial_update(PPMP, ppmpData!.id, {
          fiscal_year: formData.project.fiscal_year,
          status: ProjectStatus.DRAFT,
          prepared_by_id: this.user?.id,
          office_id: formData.project.office_id
        });

        await this.crudService.partial_update(PPMPProject, formData.project.id, {
          procurement_mode_id: formData.project.procurement_mode_id,
          project_title: formData.project.project_title,
          project_code: formData.project.project_code,
          project_description: formData.project.project_description,
          classifications: formData.project.classifications,
          user_budget_id: formData.project.user_budget_id,
          abc: formData.project.abc,
          contract_scope: formData.project.contract_scope
        });
        
        // Update items
        for (const item of formData.items) {
          if (item.id) {
            const itemDataToUpdate = { ...item };
            delete itemDataToUpdate.id; // Remove ID for update
            await this.crudService.partial_update(PPMPItem, item.id, itemDataToUpdate);
          } else {
            const newItemData = { ...item };
            delete newItemData.id; // Remove ID for create
            await this.crudService.create(PPMPItem, { ...newItemData, ppmp_project_id: formData.project.id });
          }
        }
        
        // Update schedules
        for (const schedule of formData.project.schedules || []) {
          if (schedule.id) {
            const scheduleDataToUpdate = { ...schedule };
            delete scheduleDataToUpdate.id; // Remove ID for update
            await this.crudService.partial_update(PPMPSchedule, schedule.id, scheduleDataToUpdate);
          } else {
            const newScheduleData = { ...schedule };
            delete newScheduleData.id; // Remove ID for create
            await this.crudService.create(PPMPSchedule, { ...newScheduleData, ppmp_id: formData.project.ppmp_id });
          }
        }
        
        this.messageService.add({
          severity: 'success',
          summary: 'Updated!',
          detail: 'PPMP has been updated.'
        });
      } else {
        // Handle creating new PPMP
        try {
          // Create PPMP first
          const ppmp = await this.crudService.create(PPMP, {
            fiscal_year: formData.project.fiscal_year,
            status: ProjectStatus.DRAFT,
            prepared_by_id: this.user?.id!,
            office_id: formData.project.office_id
          });

          // Create project linked to PPMP
          const savedProject = await this.crudService.create(PPMPProject, {
            ppmp_id: ppmp.id,
            procurement_mode_id: formData.project.procurement_mode_id,
            project_title: formData.project.project_title,
            project_code: formData.project.project_code || this.generateRandomCode(8),
            project_description: formData.project.project_description,
            classifications: formData.project.classifications,
            user_budget_id: formData.project.user_budget_id,
            abc: formData.project.abc,
            contract_scope: formData.project.contract_scope,
            status: ProjectStatus.DRAFT
          });

          // Create items
          for (const item of formData.items) {
            const itemData = { ...item };
            delete itemData.id; // Remove ID for create
            await this.crudService.create(PPMPItem, {
              ppmp_project_id: savedProject.id,
              quantity_required: itemData.quantity_required,
              unit_of_measurement: itemData.unit_of_measurement,
              estimated_unit_cost: itemData.estimated_unit_cost,
              estimated_total_cost: itemData.estimated_total_cost,
              classification: itemData.classification,
              technical_specification: itemData.technical_specification,
              scope_of_work: itemData.scope_of_work,
              terms_of_reference: itemData.terms_of_reference
            });
          }
          
          // Create schedules
          for (const schedule of formData.project.schedules || []) {
            const scheduleData = { ...schedule };
            delete scheduleData.id; // Remove ID for create
            await this.crudService.create(PPMPSchedule, {
              ppmp_id: ppmp.id,
              milestone: scheduleData.milestone,
              date: scheduleData.date
            });
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Created!',
            detail: 'PPMP has been created.'
          });
        } catch (createError) {
          console.error('Detailed create error:', createError);
          throw createError;
        }
      }
    } catch (error) {
      console.error('Error saving PPMP:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'There was an error processing your request: ' + (error || 'Unknown error')
      });
    } finally {
      await this.loadData();
      this.dialogLoading = false;
      this.dialogVisible = false;
      this.ppmpRequests.dataLoaded = true;
    }
  }
 
 
  async loadData() {
  const [
    ppmps, projects, items, offices, modes, processes,
  ] = await this.crudService.forJoin(PPMP, PPMPProject, PPMPItem, Office, ProcurementMode, ProcurementProcess);
  
  this.user = this.userService.getUser();
  this.procurementModeData = modes;
  this.procurementProcesses = processes;
  
  // Prepare dropdown options for dialog
  this.procurementModes = modes.map(mode => ({
    label: mode.mode_name,
    value: mode.id
  }));
  
  this.classifications = [
    { label: 'Goods', value: 'goods' },
    { label: 'Infrastructure', value: 'infrastructure' },
    { label: 'Consulting', value: 'consulting' }
  ];

  // Transform data for the table based on user role and type
  this.ppmpRequests.data = projects
    .filter(project => {
      const ppmp = ppmps.find(p => p.id === project.ppmp_id);
      if (!ppmp) return false;
      
      // Filter based on user type
      if (this.user?.user_type === 'User') {
        // Regular users see their office's PPMPs
        return ppmp.office_id === this.user?.officeId && ppmp.fiscal_year === this.selectedFiscalYear;
      } else if (this.user?.user_type === 'Head') {
        // Heads see PPMPs that have been signed by users (PENDING or APPROVED status)
        return (ppmp.status === ProjectStatus.PENDING || ppmp.status === ProjectStatus.APPROVED) && ppmp.fiscal_year === this.selectedFiscalYear;
      } else {
        return ppmp.fiscal_year === this.selectedFiscalYear; // Admin sees all for selected fiscal year
      }
    })
    .map(project => {
      const ppmp = ppmps.find(p => p.id === project.ppmp_id);
      const office = offices.find(o => o.id === ppmp?.office_id);
      const mode = modes.find(m => m.id === project.procurement_mode_id);
      const projectItems = items.filter(i => i.ppmp_project_id === project.id);
      const isRejected = ppmp?.status === ProjectStatus.REJECTED;
      
      // Make sure we have a valid status by providing DRAFT as fallback
      const status = ppmp?.status || ProjectStatus.DRAFT;
      
      return {
        ...project,
        ppmp_id: ppmp?.id || '',
        office: office?.name ?? 'N/A',
        mode_name: mode?.mode_name ?? 'N/A',
        status: status, // Ensure a non-undefined value
        status_extended: isRejected ? 'Rejected' : ppmp?.status ?? 'N/A',
        items_count: projectItems.length,
        totalAmount: projectItems.reduce((acc, item) => acc + (item.estimated_unit_cost * item.quantity_required), 0),
        fiscal_year: ppmp?.fiscal_year ?? this.selectedFiscalYear,
        creation_date: ppmp?.date_submitted,
        submission_date: ppmp?.date_submitted,
        approval_date: ppmp?.date_approved,
        remarks: ppmp?.remarks,
        user_signature: ppmp?.user_signature,
        head_signature: ppmp?.head_signature
      };
    })
    .sort((a, b) => {
      if (a.status_extended === 'Rejected' && b.status_extended !== 'Rejected') {
        return -1;
      } else if (a.status_extended !== 'Rejected' && b.status_extended === 'Rejected') {
        return 1;
      } else {
        return 0;
      }
    });

  // Initialize actions based on user type
  this.initializeTopActions();
  
  this.ppmpRequests.dataLoaded = true;
}

  async loadFundSourceData(): Promise<void> {
    if (!this.user?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User not logged in'
      });
      return;
    }

    try {
      // Step 1: Load all UserBudget records for the logged-in user
      const userBudgets = await this.crudService.getAll(UserBudget, {
        filter: { user_id: this.user.id }
      });
      console.log('UserBudgets for user:', userBudgets);

      if (!userBudgets || userBudgets.length === 0) {
        this.fundSources = [{ label: 'No Fund Source Available', value: '' }];
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No budget assigned to this user'
        });
        return;
      }

      // Step 2: Collect all budget_ids from UserBudget records
      const budgetIds = userBudgets.map(ub => ub.budget_id);
      console.log('Budget IDs:', budgetIds);

      // Step 3: Load all Budget records corresponding to the budget_ids
      const budgets: Budget[] = [];
      for (const budgetId of budgetIds) {
        const budgetRecords = await this.crudService.getAll(Budget, { filter: { id: budgetId } });
        if (budgetRecords.length > 0) {
          budgets.push(...budgetRecords); // Push all matching records
        }
      }
      console.log('Budgets:', budgets);

      if (budgets.length === 0) {
        this.fundSources = [{ label: 'No Fund Source Available', value: '' }];
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No budgets found for the given budget IDs'
        });
        return;
      }

      // Step 4: Collect all fund_ids from Budget records
      const fundIds = budgets.map(b => b.fund_id);
      console.log('Fund IDs:', fundIds);

      // Step 5: Load all FundSource records corresponding to the fund_ids
      const fundSourcesList: FundSource[] = [];
      for (const fundId of fundIds) {
        const fundSourceRecords = await this.crudService.getAll(FundSource, { filter: { id: fundId } });
        if (fundSourceRecords.length > 0) {
          fundSourcesList.push(...fundSourceRecords); // Push all matching records
        }
      }
      console.log('Fund Sources:', fundSourcesList);

      if (fundSourcesList.length === 0) {
        this.fundSources = [{ label: 'No Fund Source Available', value: '' }];
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'No fund sources found for the given fund IDs'
        });
        return;
      }

      // Step 6: Map fund sources to dropdown options, linking to the user_budget_id
      this.fundSources = userBudgets
        .map(userBudget => {
          const budget = budgets.find(b => b.id === userBudget.budget_id);
          const fundSource = fundSourcesList.find(fs => fs.id === budget?.fund_id);
          return fundSource
            ? { label: fundSource.source_name, value: userBudget.id }
            : null;
        })
        .filter((fs): fs is { label: string; value: string } => fs !== null);

      console.log('Mapped Fund Sources for dropdown:', this.fundSources);

      // Step 7: If no fund sources were mapped, show a message
      if (this.fundSources.length === 0) {
        this.fundSources = [{ label: 'No Fund Source Available', value: '' }];
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Failed to map fund sources'
        });
      }
    } catch (error) {
      console.error('Error loading fund sources:', error);
      this.fundSources = [{ label: 'Error loading fund sources', value: '' }];
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load fund sources'
      });
    }
  }

  // Helper function to generate random codes for PPMP
  private generateRandomCode(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

 
  initializeTopActions() {
    // Different actions depending on user role and type
    if (this.user?.user_type === 'User') {
      this.ppmpRequests.topActions = [
        {
          label: 'Create PPMP',
          only: ['DRAFT'],
          icon: 'pi pi-plus',
          tooltip: 'Click to create a new PPMP Project',
          function: async () => {
            this.openPpmpDialog(false);
          }
        },
        {
          label: 'Finalize All',
          icon: 'pi pi-file-edit',
          only: ['DRAFT'],
          color: 'success',
          tooltip: 'Click to sign and submit all eligible PPMPs',
          function: async () => {
            // Find all draft PPMPs with items
            this.eligiblePPMPs = this.ppmpRequests.data.filter(ppmp =>
              ppmp.status === ProjectStatus.DRAFT &&
              ppmp.items_count
            );
            
            if (this.eligiblePPMPs.length === 0) {
              this.messageService.add({
                severity: 'warn',
                summary: 'No Eligible PPMPs',
                detail: 'There are no draft PPMPs with items that can be finalized.'
              });
              return;
            }
            
            // Show PrimeNG dialog for confirmation
            this.finalizePPMPsCount = this.eligiblePPMPs.length;
            this.showFinalizeDialog = true;
          }
        },
        ...(this.ppmpRequests.data.length > 0 ? [{
          label: 'View Document',
          icon: 'pi pi-file-pdf',
          tooltip: 'View the consolidated PPMP document',
          function: async () => {
            // Navigate to the PPMP-docs component with appropriate parameters
            this.router.navigate(['/shared/ppmp-docs'], {
              queryParams: {
                fiscalYear: this.selectedFiscalYear,
                officeId: this.user?.officeId || undefined
              }
            });
          }
        }] : [])
      ];
    } else if (this.user?.user_type === 'Head') {
      this.ppmpRequests.topActions = [
        ...(this.ppmpRequests.data.length > 0 ? [{
          label: 'View Document',
          icon: 'pi pi-file-pdf',
          tooltip: 'View the consolidated PPMP document',
           function: async () => {
            // Navigate to the PPMP-docs component with appropriate parameters
            this.router.navigate(['/shared/ppmp-docs'], {
              queryParams: {
                fiscalYear: this.selectedFiscalYear,
                officeId: this.user?.officeId || undefined
              }
            });
          }
        }] : []),
        {
          label: 'Approve All',
          icon: 'pi pi-check',
          only: ['PENDING'],
          color: 'success',
          tooltip: 'Approve all pending PPMPs',
          function: async () => {
            // Find all pending PPMPs
            this.pendingPPMPs = this.ppmpRequests.data.filter(ppmp => 
              ppmp.status === ProjectStatus.PENDING &&
              ppmp.fiscal_year === this.selectedFiscalYear
            );
            
            if (this.pendingPPMPs.length === 0) {
              
              return;
            }
            
            // Show confirmation dialog
            this.pendingPPMPsCount = this.pendingPPMPs.length;
            this.showApproveAllDialog = true;
          }
        }
      ];

      // Update the steps to be more relevant for Head users
      this.ppmpRequests.steps = [
        {
          id: ProjectStatus.PENDING,
          label: 'For Approval',
          icon: 'pi pi-file-plus',
        },
        {
          id: ProjectStatus.APPROVED, 
          label: 'Approved',
          icon: 'pi pi-verified',
        },
      ];
    }
  }
  

  // Add new methods for document view and consolidation
  async consolidateAllPPMPs() {
    try {
      this.consolidationLoading = true;
      this.ppmpRequests.dataLoaded = false;
      
      // Get all pending PPMPs for the selected fiscal year
      const pendingPPMPs = this.ppmpRequests.data.filter(
        ppmp => ppmp.status === ProjectStatus.PENDING && 
                ppmp.fiscal_year === this.selectedFiscalYear
      );
      
      if (pendingPPMPs.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Information',
          detail: `No pending PPMPs found for fiscal year ${this.selectedFiscalYear}`
        });
        this.consolidationLoading = false;
        this.ppmpRequests.dataLoaded = true;
        return;
      }
      
      // Confirm before proceeding
      if (!confirm(`Are you sure you want to approve ${pendingPPMPs.length} PPMPs for fiscal year ${this.selectedFiscalYear}?`)) {
        this.consolidationLoading = false;
        this.ppmpRequests.dataLoaded = true;
        return;
      }
      
      // Process each PPMP - here we're not just setting status but also adding head signature
      for (const ppmp of pendingPPMPs) {
        await this.crudService.partial_update(PPMP, ppmp.ppmp_id!, {
          status: ProjectStatus.APPROVED,
          head_signature: 'Auto-approved via batch process',
          approved_by_id: this.user?.id,
          date_approved: new Date()
        });
      }
      
      // Reload data
      await this.loadData();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Successfully approved ${pendingPPMPs.length} PPMPs for fiscal year ${this.selectedFiscalYear}`
      });
    } catch (error) {
      console.error('Error approving PPMPs:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to approve PPMPs: ' + (error || 'Unknown error')
      });
    } finally {
      this.consolidationLoading = false;
      this.ppmpRequests.dataLoaded = true;
    }
  }

  async viewConsolidatedDocument() {
    try {
      // For user type = User, we'll show their signed documents
      // For user type = Head, we'll show documents that require or have their signature
      let filteredPPMPs;
      
      if (this.user?.user_type === 'User') {
        filteredPPMPs = this.ppmpRequests.data.filter(
          ppmp => (ppmp.status === ProjectStatus.PENDING || ppmp.status === ProjectStatus.APPROVED) && 
                  ppmp.fiscal_year === this.selectedFiscalYear &&
                  ppmp.user_signature // Must have user signature
        );
      } else if (this.user?.user_type === 'Head') {
        filteredPPMPs = this.ppmpRequests.data.filter(
          ppmp => ppmp.status === ProjectStatus.APPROVED && 
                  ppmp.fiscal_year === this.selectedFiscalYear &&
                  ppmp.head_signature // Must have head signature
        );
      } else {
        // For other user types or admin
        filteredPPMPs = this.ppmpRequests.data.filter(
          ppmp => ppmp.status === ProjectStatus.APPROVED && 
                  ppmp.fiscal_year === this.selectedFiscalYear
        );
      }
      
      if (filteredPPMPs.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Information',
          detail: `No documents found for fiscal year ${this.selectedFiscalYear}`
        });
        return;
      }
      
      // Generate document URL
      // Assuming you have an API endpoint that generates a PDF for the consolidated PPMP
      const documentUrl = `/api/ppmp/consolidated-document/${this.selectedFiscalYear}`;
      
      // Sanitize URL for iframe
      this.documentUrl = this.sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
      
      // Show the document viewer
      this.documentViewerVisible = true;
    } catch (error) {
      console.error('Error viewing consolidated document:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to view consolidated document: ' + (error || 'Unknown error')
      });
    }
  }

  onFiscalYearChange(event: any) {
    this.selectedFiscalYear = event.value;
    // Reload data filtered by the selected year
    this.loadData();
  }

  showFinalizeDialog: boolean = false;
  finalizePPMPsCount: number = 0;
  eligiblePPMPs: PPMPProjectJoin[] = [];
  showApproveAllDialog: boolean = false;
  pendingPPMPsCount: number = 0;
  pendingPPMPs: PPMPProjectJoin[] = [];

  proceedWithApproval() {
    this.showApproveAllDialog = false;
    
    // Use the signature modal for the first PPMP
    this.headSignature.title = `Approve ${this.pendingPPMPsCount} PPMPs`;
    this.headSignature.description = 'Your signature will be applied to all pending PPMPs.';
    this.headSignature.data = this.pendingPPMPs[0];
    
    // Override the submit function to handle all PPMPs
    const originalSubmit = this.headSignature.submit;
    this.headSignature.submit = async (signed) => {
      this.ppmpRequests.dataLoaded = false;
      
      if (!signed) {
        throw new Error('System Error: Data not found');
      }
      
      try {
        // Get the signature from the first PPMP
        const signature = signed.signature as string;
        
        // Apply the same signature to all pending PPMPs
        for (const ppmp of this.pendingPPMPs) {
          await this.crudService.partial_update(PPMP, ppmp.ppmp_id!, {
            'status': ProjectStatus.APPROVED,
            'head_signature': signature,
            'approved_by_id': this.user?.id,
            'date_approved': new Date()
          });
        }
        
        await this.loadData();
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: `All ${this.pendingPPMPsCount} PPMPs have been approved for fiscal year ${this.selectedFiscalYear}.`
        });
      } catch (error) {
        console.error('Error approving PPMPs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to approve PPMPs: ' + (error || 'Unknown error')
        });
      } finally {
        this.ppmpRequests.dataLoaded = true;
        // Restore the original submit function
        this.headSignature.submit = originalSubmit;
      }
    };
    
    // Show the signature modal
    this.headSignature.show = true;
  }

  // Cancel approval process
  cancelApproval() {
    this.showApproveAllDialog = false;
  }

  proceedWithFinalization() {
  this.showFinalizeDialog = false;
  
  // Use the signature modal for the first PPMP
  this.submitSignature.title = `Finalize ${this.finalizePPMPsCount} PPMPs`;
  this.submitSignature.description = 'Your signature will be applied to all eligible PPMPs.';
  this.submitSignature.data = this.eligiblePPMPs[0];
  
  // Override the submit function to handle all PPMPs
  const originalSubmit = this.submitSignature.submit;
  this.submitSignature.submit = async (signed) => {
    this.ppmpRequests.dataLoaded = false;
    
    if (!signed) {
      throw new Error('System Error: Data not found');
    }
    
    try {
      // Get the signature from the first PPMP
      const signature = signed.signature as string;
      
      // Apply the same signature to all eligible PPMPs
      for (const ppmp of this.eligiblePPMPs) {
        await this.crudService.partial_update(PPMP, ppmp.ppmp_id!, {
          'status': ProjectStatus.PENDING,
          'user_signature': signature,
          'date_submitted': new Date()
        });
      }
      
      await this.loadData();
      this.messageService.add({
        severity: 'success',
        summary: 'Success!',
        detail: `All ${this.finalizePPMPsCount} PPMPs have been finalized and submitted for approval.`
      });
    } catch (error) {
      console.error('Error finalizing PPMPs:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to finalize PPMPs: ' + (error || 'Unknown error')
      });
    } finally {
      this.ppmpRequests.dataLoaded = true;
      // Restore the original submit function
      this.submitSignature.submit = originalSubmit;
    }
  };
  
  // Show the signature modal
  this.submitSignature.show = true;
}

// Cancel finalization process
cancelFinalization() {
  this.showFinalizeDialog = false;
}
  
  ppmpDocumentDialog: boolean = false;
selectedYear: number = new Date().getFullYear();
  selectedPpmps: PPMPProjectJoin[] = [];
  
}