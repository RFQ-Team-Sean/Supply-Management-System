import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CrudService } from 'src/app/services/crud.service';
import { Approver, Users, Entity } from 'src/app/schema/schema';
import { Table, TableModule, TableRowReorderEvent } from 'primeng/table';
import { CommonModule } from '@angular/common';

// PrimeNG and Angular Material Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MatCard, MatCardContent, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';

// Import dummy data

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-ppmp-sequence',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    DropdownModule,
    ToastModule,
    MatCard,
    MatCardContent,
    MatCardTitle,
    MatCardSubtitle,
    IconField,
    InputIcon
  ],
  templateUrl: './ppmp-sequence.component.html',
  providers: [MessageService, ConfirmationService],
})
export class PpmpSequenceComponent implements OnInit {
  @ViewChild('dt') dt!: Table;
  
  sequences: any[] = [];
  users: Users[] = [];
  entities: Entity[] = [];
  approverForm!: FormGroup;
  approverDialog = false;
  isEditMode = false;
  currentApproverId: string | null = null;
  submitted = false;
  loading = false;
  deleteDialogVisible = false;
  approverToDelete: Approver | null = null;
  
  // Reordering variables
  reorderConfirmVisible = false;
  draggedApprover: any = null;
  newPosition: number = 0;
  
  // Dropdown options
  userOptions: DropdownOption[] = [];
  entityOptions: DropdownOption[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private crudService: CrudService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.initializeData();
  }

  initializeForm(): void {
    this.approverForm = this.formBuilder.group({
      user_id: ['', Validators.required],
      name: ['', Validators.required],
      approval_order: [1, [Validators.required, Validators.min(1)]],
      entity_id: ['1', Validators.required] // Default to PPMP entity
    });
  }

  async initializeData(): Promise<void> {
    try {

      
      try {
        const users = await this.crudService.getAll<Users>(Users);
        
        const entities = await this.crudService.getAll<Entity>(Entity);
        
        const approvers = await this.crudService.getAll<Approver>(Approver);
     
      } catch (error) {
        console.warn('Error checking if data exists:', error);
      }
      
    
      await this.loadApprovers();
    } catch (error) {
      console.error('Failed to initialize data:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Initialization Error', 
        detail: 'Failed to initialize data' 
      });
    }
  }

  async loadApprovers(): Promise<void> {
    this.loading = true;
    try {
      // Load users from CrudService
      const loadedUsers = await this.crudService.getAll<Users>(Users);
      this.users = loadedUsers;
      
      // Load entities from CrudService, filter for PPMP
      const loadedEntities = await this.crudService.getAll<Entity>(Entity);
      this.entities = loadedEntities.filter(entity => entity.name === 'PPMP');

      // Create dropdown options
      this.userOptions = this.users.map(user => ({
        label: user.fullname,
        value: user.id
      }));
      
      this.entityOptions = this.entities.map(entity => ({
        label: entity.name,
        value: entity.id.toString()
      }));

      // Load sequences from CrudService
      const loadedSequences = await this.crudService.getAll<Approver>(Approver);
      const ppmpSequences = loadedSequences.filter(seq => seq.entity_id === '1');
      
      // Sort sequences by approval_order
      const sortedSequences = [...ppmpSequences].sort((a, b) => a.approval_order - b.approval_order);
      
      // Map sequences to display format
      this.sequences = sortedSequences.map(sequence => {
        const user = this.users.find(user => user.id === sequence.user_id);
        const entity = this.entities.find(entity => entity.id.toString() === sequence.entity_id);
        
        return {
          ...sequence,
          user_fullname: user ? user.fullname : 'Unknown User',
          user_role: user ? user.role : 'Unknown Role',
          entity_name: entity ? entity.name : 'Unknown Entity'
        };
      });
      
     
     
    } catch (error) {
      console.error('Error loading approvers:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Data Load Error', 
        detail: 'Failed to load approvers' 
      });
    } finally {
      this.loading = false;
    }
  }

  openNewApproverDialog(): void {
    this.isEditMode = false;
    this.currentApproverId = null;
    this.approverForm.reset();
    this.approverForm.patchValue({ 
      approval_order: this.getNextOrder(),
      entity_id: '1'
    });
    this.approverDialog = true;
    this.submitted = false;
  }

  getNextOrder(): number {
    return this.sequences.length > 0 ? Math.max(...this.sequences.map(s => s.approval_order)) + 1 : 1;
  }

  async saveApprover(): Promise<void> {
    this.submitted = true;
    
    if (this.approverForm.invalid) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Validation Error', 
        detail: 'Please fill in all required fields.' 
      });
      return;
    }

    this.loading = true;
    try {
      if (this.isEditMode && this.currentApproverId) {
        const updateData = { 
          user_id: this.approverForm.value.user_id,
          name: this.approverForm.value.name,
          approval_order: this.approverForm.value.approval_order,
          entity_id: this.approverForm.value.entity_id
        };
        
        await this.crudService.update<Approver>(Approver, this.currentApproverId, updateData as any);
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Approver updated successfully' 
        });
      } else {
        const newId = this.generateUniqueId();
        const newApproverData = {
          id: newId,
          user_id: this.approverForm.value.user_id,
          name: this.approverForm.value.name,
          approval_order: this.approverForm.value.approval_order,
          entity_id: this.approverForm.value.entity_id
        };
        
        const { id, ...dataWithoutId } = newApproverData;
        await this.crudService.create<Approver>(Approver, dataWithoutId as any);
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'New approver created successfully' 
        });
      }
      
      await this.loadApprovers();
      this.hideDialog();
    } catch (error) {
      console.error('Operation failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `Operation failed: ${error}` 
      });
    } finally {
      this.loading = false;
    }
  }

  editApprover(approver: any): void {
    this.approverForm.patchValue({
      user_id: approver.user_id,
      name: approver.name,
      approval_order: approver.approval_order,
      entity_id: approver.entity_id
    });
    
    this.isEditMode = true;
    this.currentApproverId = approver.id;
    this.approverDialog = true;
    this.submitted = false;
  }

  deleteApprover(approver: any): void {
    this.approverToDelete = approver;
    this.deleteDialogVisible = true;
  }




  async confirmDeleteAction(): Promise<void> {
    if (!this.approverToDelete) return;
    
    this.loading = true;
    try {
      const idToDelete = this.approverToDelete.id;
      const deletedOrderNumber = this.approverToDelete.approval_order;
      
      await this.crudService.delete<Approver>(Approver, idToDelete);
      
      const allApprovers = await this.crudService.getAll<Approver>(Approver);
      const ppmpApprovers = allApprovers.filter(a => a.entity_id === '1');
      
      for (const approver of ppmpApprovers) {
        if (approver.approval_order > deletedOrderNumber) {
          const updatedApprover = { ...approver, approval_order: approver.approval_order - 1 };
          await this.crudService.update<Approver>(Approver, approver.id, updatedApprover as any);
        }
      }
      
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Success', 
        detail: 'Approver deleted successfully' 
      });
      
      await this.loadApprovers();
    } catch (error) {
      console.error('Delete failed:', error);
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: `Failed to delete approver: ${error}` 
      });
    } finally {
      this.loading = false;
      this.deleteDialogVisible = false;
      this.approverToDelete = null;
    }
  }
  
    // Fixed onRowReorder to ensure correct modal data
  async onRowReorder(event: TableRowReorderEvent): Promise<void> {
    const dragIndex = event.dragIndex ?? 0;
    const dropIndex = event.dropIndex ?? 0;

    if (dragIndex === dropIndex) return;

    // Ensure the sequences array is in sync with localStorage before proceeding
    await this.loadApprovers();

    // Debug: Log the current state of sequences
    console.log('Sequences before drag:', this.sequences.map(s => ({
      id: s.id,
      name: s.name,
      approval_order: s.approval_order
    })));

    // Capture the dragged approver from the updated sequences
    this.draggedApprover = { ...this.sequences[dragIndex] };
    this.newPosition = dropIndex + 1; // Adjusting for 1-based approval_order

    // Debug: Log the drag and drop details
    console.log(`Dragging from index ${dragIndex} (Level ${this.draggedApprover.approval_order}) to index ${dropIndex} (Level ${this.newPosition})`);
    console.log('Dragged Approver:', this.draggedApprover);

    // Show the confirmation dialog
    this.reorderConfirmVisible = true;
  }

  cancelReorder(): void {
    this.reorderConfirmVisible = false;
    this.draggedApprover = null;
    this.newPosition = 0;
    // Reload to ensure the table reflects the original state
    this.loadApprovers();
  }

  confirmReorder(): void {
    if (this.draggedApprover && this.newPosition) {
      this.executeReorder(
        this.draggedApprover.id,
        this.draggedApprover.approval_order,
        this.newPosition
      );
    }
  }

  // Fixed executeReorder to ensure saving works
  async executeReorder(approverIdToMove: string, fromOrder: number, toOrder: number): Promise<void> {
    this.loading = true;

    try {
      // Fetch all approvers directly from localStorage to ensure we're working with the latest data
      const allApprovers = await this.crudService.getAll<Approver>(Approver);
      let ppmpApprovers = allApprovers
        .filter(a => a.entity_id === '1')
        .sort((a, b) => a.approval_order - b.approval_order);

      // Debug: Log the current state of approvers
      console.log('Before reordering:', ppmpApprovers.map(a => ({
        id: a.id,
        name: a.name,
        approval_order: a.approval_order
      })));

      // Find the approver to move
      const approverToMove = ppmpApprovers.find(a => a.id === approverIdToMove);
      if (!approverToMove) throw new Error('Approver not found');

      // Remove the approver from its current position
      ppmpApprovers = ppmpApprovers.filter(a => a.id !== approverIdToMove);

      // Insert the approver at the new position (adjusting for 0-based index)
      const newIndex = toOrder - 1; // Convert toOrder (1-based) to 0-based index
      ppmpApprovers.splice(newIndex, 0, approverToMove);

      // Reassign approval_order values sequentially starting from 1
      ppmpApprovers = ppmpApprovers.map((approver, index) => ({
        ...approver,
        approval_order: index + 1
      }));

      // Debug: Log the new order before saving
      console.log('After reordering (before saving):', ppmpApprovers.map(a => ({
        id: a.id,
        name: a.name,
        approval_order: a.approval_order
      })));

      // Update all approvers in the database
      for (const approver of ppmpApprovers) {
        const updatedApprover = {
          user_id: approver.user_id,
          name: approver.name,
          approval_order: approver.approval_order,
          entity_id: approver.entity_id
        };
        await this.crudService.update<Approver>(Approver, approver.id, updatedApprover as any);
      }

      // Verify the data was saved by fetching it again
      const savedApprovers = await this.crudService.getAll<Approver>(Approver);
      const savedPPMPApprovers = savedApprovers
        .filter(a => a.entity_id === '1')
        .sort((a, b) => a.approval_order - b.approval_order);

      console.log('After saving:', savedPPMPApprovers.map(a => ({
        id: a.id,
        name: a.name,
        approval_order: a.approval_order
      })));

      this.messageService.add({
        severity: 'success',
        summary: 'Reordered',
        detail: 'Approval sequence reordered successfully'
      });

      // Reload the table to reflect the new order
      await this.loadApprovers();
    } catch (error) {
      console.error('Reordering failed:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to reorder approval sequence: ' + (error)
      });
      await this.loadApprovers();
    } finally {
      this.loading = false;
      this.reorderConfirmVisible = false;
      this.draggedApprover = null;
      this.newPosition = 0;
    }
  }
  
  hideDialog(): void {
    this.approverDialog = false;
    this.submitted = false;
    this.approverForm.reset();
  }



  generateUniqueId(): string {
    const year = new Date().getFullYear();
    const existingIds = this.sequences.map(s => s.id);
    let sequence = 1;
    
    existingIds.forEach(id => {
      if (id.startsWith(`APR-${year}-`)) {
        const seqStr = id.split('-')[2];
        const seqNum = parseInt(seqStr, 10);
        if (!isNaN(seqNum) && seqNum >= sequence) {
          sequence = seqNum + 1;
        }
      }
    });
    
    const paddedSequence = sequence.toString().padStart(3, '0');
    return `APR-${year}-${paddedSequence}`;
  }
}