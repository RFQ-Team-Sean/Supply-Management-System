import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { PPMPProject, PPMPItem, PPMPSchedule, ProcurementMode, ProcurementProcess } from 'src/app/schema/schema';
import { MessageService } from 'primeng/api';
import { User, UserService } from 'src/app/services/user.service';

// PrimeNG Imports
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { DatePickerModule } from 'primeng/datepicker';


export interface PPMPFormData {
  project?: PPMPProject;
  items?: PPMPItem[];
  schedules?: PPMPSchedule[];
}

@Component({
  selector: 'app-ppmp-dialog',
  templateUrl: './ppmp-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    DialogModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    MultiSelectModule,
    TextareaModule,
    FileUploadModule,
    ProgressBarModule,
    BadgeModule,
    DatePickerModule
  ]
})
export class PpmpDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() ppmpData: PPMPFormData | null = null;
  @Input() procurementModes: any[] = [];
  @Input() procurementModeData: ProcurementMode[] = [];
  @Input() procurementProcess: ProcurementProcess[] = [];
  @Input() classifications: any[] = [];
  @Input() fundSources: any[] = [];
  @Input() selectedYear: number = new Date().getFullYear();
  @Input() submitted: boolean = false;
  @Input() loading: boolean = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() savePpmp = new EventEmitter<any>();
  @Output() cancelPpmp = new EventEmitter<void>();

  ppmpForm!: FormGroup;
  itemClassificationOptions: any[] = [];
  currentUser?: User;
  totalSize: string = '0';
  totalSizePercent: number = 0;
  private uploadedFiles: Map<number, File[]> = new Map();

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageService: MessageService
  ) {
    this.currentUser = this.userService.getUser();
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(): void {
    if (this.ppmpForm && this.ppmpData && this.isEditMode) {
      this.loadFormData();
    }
  }

  initializeForm(): void {
    if (!this.currentUser) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please log in to create a PPMP'
      });
      return;
    }

    const ppmpId = uuidv4();
    const projectId = uuidv4();

    console.log('submit', this.ppmpForm)

    this.ppmpForm = this.formBuilder.group({
      id: [ppmpId],
      office_id: [this.currentUser.officeId, [Validators.required]],
      app_id: [`APP-${this.selectedYear}-${Math.floor(100 + Math.random() * 900)}`],
      approvals_id: [uuidv4()],
      current_approver_id: [this.currentUser?.id?.toString() || '1'],
      project: this.formBuilder.group({
        id: [projectId],
        ppmp_id: [ppmpId],
        office_id: [this.currentUser.officeId, [Validators.required]],
        procurement_mode_id: ['', [Validators.required]],
        prepared_by: [this.currentUser.id, [Validators.required]],
        project_title: ['', [Validators.required]],
        project_code: [''],
        classifications: [[], [Validators.required, Validators.minLength(1)]],
        project_description: ['', [Validators.required]],
        contract_scope: [''],
        fiscal_year: [this.selectedYear, [Validators.required]],
        user_budget_id: ['', [Validators.required]],
        abc: [0],
        schedules: this.formBuilder.array([])
      }),
      items: this.formBuilder.array([])
    });

    this.getModeProcesses();
    this.addItem();
    this.ppmpForm.get('project.prepared_by')?.disable();
    this.ppmpForm.get('project.classifications')?.valueChanges.subscribe((values: string[]) => {
      this.updateItemClassifications(values);
    });
    this.items.valueChanges.subscribe(() => {
      this.updateTotalProjectABC();
    });

    // If we're in edit mode and have data, load it
    if (this.isEditMode && this.ppmpData) {
      this.loadFormData();
    }
  }

  loadFormData(): void {
    if (!this.ppmpData || !this.ppmpForm) return;

    // Clear existing items & schedules
    while (this.items.length !== 0) {
      this.items.removeAt(0);
    }
    while (this.schedules.length !== 0) {
      this.schedules.removeAt(0);
    }

    // Patch project data
    this.ppmpForm.patchValue({
      project: {
        ...this.ppmpData.project,
      }
    });

    // Add items
    this.ppmpData.items?.forEach(item => {
      const itemForm = this.createItemFormGroup();
      itemForm.patchValue(item);
      this.items.push(itemForm);
    });

    // Add schedules
    this.ppmpData.schedules?.forEach(schedule => {
      const scheduleForm = this.createScheduleFormGroup('');
      scheduleForm.patchValue(schedule);
      this.schedules.push(scheduleForm);
    });
  }

  get items(): FormArray {
    return this.ppmpForm.get('items') as FormArray;
  }

  get schedules(): FormArray {
    return this.ppmpForm.get('project.schedules') as FormArray;
  }

  createItemFormGroup(): FormGroup {
    return this.formBuilder.group({
      id: [uuidv4()],
      ppmp_project_id: [this.ppmpForm.get('project.id')?.value || ''],
      technical_specification: [''],
      scope_of_work: [''],
      terms_of_reference: [''],
      classification: ['', [Validators.required]],
      quantity_required: [1, [Validators.required, Validators.min(1)]],
      unit_of_measurement: ['', [Validators.required]],
      estimated_unit_cost: [0, [Validators.required, Validators.min(0)]],
      estimated_total_cost: [{ value: 0, disabled: true }]
    });
  }

  createScheduleFormGroup(milestone: string): FormGroup {
    return this.formBuilder.group({
      id: [uuidv4()],
      ppmp_id: [this.ppmpForm.get('id')?.value || ''],
      milestone: [milestone, [Validators.required]],
      date: [new Date(), [Validators.required]]
    });
  }

  addItem(): void {
    const itemForm = this.createItemFormGroup();
    this.items.push(itemForm);
    
    // Subscribe to changes for total calculation
    itemForm.get('quantity_required')?.valueChanges.subscribe(() => this.calculateItemTotal(this.items.length - 1));
    itemForm.get('estimated_unit_cost')?.valueChanges.subscribe(() => this.calculateItemTotal(this.items.length - 1));
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  addSchedule(): void {
    this.schedules.push(this.createScheduleFormGroup(''));
  }

  removeSchedule(index: number): void {
    this.schedules.removeAt(index);
  }

  calculateItemTotal(index: number): void {
    const itemGroup = this.items.at(index);
    const quantity = itemGroup.get('quantity_required')?.value || 0;
    const unitCost = itemGroup.get('estimated_unit_cost')?.value || 0;
    const total = quantity * unitCost;
    itemGroup.patchValue({ estimated_total_cost: total }, { emitEvent: false });
  }

  updateTotalProjectABC(): void {
    let total = 0;
    
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items.at(i);
      const quantity = item.get('quantity_required')?.value || 0;
      const unitCost = item.get('estimated_unit_cost')?.value || 0;
      total += quantity * unitCost;
    }
    
    this.ppmpForm.get('project.abc')?.setValue(total);
  }

  getModeProcesses(): void {
    this.schedules.clear();
    const id = this.ppmpForm.get('project.procurement_mode_id')?.value;
    const mode = this.procurementModeData.find(mode => mode.id == id);
    const modeProcesses = this.procurementProcess.filter(p => p.procurement_mode_id == mode?.method);
    for (let process of modeProcesses) {
      this.schedules.push(this.createScheduleFormGroup(process.name));
    }
  }

  updateItemClassifications(projectClassifications: string[]): void {
    if (!projectClassifications) return;

    // If only one classification is selected, set it for all items
    if (projectClassifications.length === 1) {
      this.itemClassificationOptions = [{
        label: projectClassifications[0].charAt(0).toUpperCase() + projectClassifications[0].slice(1),
        value: projectClassifications[0]
      }];
      
      // Update all items to use this classification
      this.items.controls.forEach(item => {
        item.patchValue({
          classification: projectClassifications[0]
        });
        item.get('classification')?.disable();
      });
    } else {
      // Multiple classifications selected, allow choice from selected ones
      this.itemClassificationOptions = projectClassifications.map(c => ({
        label: c.charAt(0).toUpperCase() + c.slice(1),
        value: c
      }));
      
      // Enable classification selection for all items
      this.items.controls.forEach(item => {
        item.get('classification')?.enable();
      });
    }
  }

  onSubmit(): void {
    if (this.ppmpForm.invalid) {
      Object.keys(this.ppmpForm.controls).forEach(key => {
        const control = this.ppmpForm.get(key);
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(k => {
            control.get(k)?.markAsDirty();
            control.get(k)?.markAsTouched();
          });
        } else {
          control?.markAsDirty();
          control?.markAsTouched();
        }
      });
      return;
    }

    // Get form values and emit to parent
    const formValue = this.ppmpForm.getRawValue();
    this.savePpmp.emit(formValue);
  }

  close(): void {
    this.visibleChange.emit(false);
    this.cancelPpmp.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.ppmpForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched || this.submitted)) : false;
  }

  // File upload methods
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];  
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onSelectedFiles(event: any, itemIndex?: number): void {
    const files = event.files;
    let size = 0;
    
    for (const file of files) {
      size += file.size;
    }
    
    this.totalSize = this.formatSize(size);
    this.totalSizePercent = (size / 1000000) * 100; // 1MB = 1000000B
    
    // Store files for specific item if index is provided
    if (itemIndex !== undefined) {
      this.uploadedFiles.set(itemIndex, files);
    }
  }

  uploadEvent(uploadCallback: Function, itemIndex?: number): void {
    // Execute the PrimeNG upload callback
    uploadCallback();
    
    // Show success message
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: 'Files Uploaded' 
    });
    
    // In a real application, you would actually upload the files to your server here
    // and store the returned file URLs/paths with the item
    if (itemIndex !== undefined && this.uploadedFiles.has(itemIndex)) {
      const files = this.uploadedFiles.get(itemIndex);
      const itemForm = this.items.at(itemIndex);
      
      // Update the appropriate field based on classification
      const classification = itemForm.get('classification')?.value;
      if (classification === 'goods') {
        itemForm.patchValue({ technical_specification: files?.map(f => f.name).join(', ') });
      } else if (classification === 'infrastructure') {
        itemForm.patchValue({ scope_of_work: files?.map(f => f.name).join(', ') });
      } else if (classification === 'consulting') {
        itemForm.patchValue({ terms_of_reference: files?.map(f => f.name).join(', ') });
      }
    }
  }

  choose(event: any, chooseCallback: Function): void {
    chooseCallback();
  }

  onTemplateUpload(): void {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'File Uploaded' });
  }

  removeUploadedFileCallback(index: number): void {
    this.messageService.add({ severity: 'info', summary: 'Removed', detail: 'File removed from uploaded list' });
  }

  getFutureYears(): any[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      years.push({ label: year.toString(), value: year });
    }
    return years;
  }
}