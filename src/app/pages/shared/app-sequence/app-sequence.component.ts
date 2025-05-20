import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MessageService, ConfirmationService } from 'primeng/api'
import { PROCUREMENT_DATA } from '../app-shared/procurement-data'
import { SignatureInfo } from '../app-shared/procurement.interface'
import { ButtonModule } from 'primeng/button'
import { TableModule } from 'primeng/table'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { DialogModule } from 'primeng/dialog'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextModule } from 'primeng/inputtext'
import { ToastModule } from 'primeng/toast'
import { MatCardModule } from '@angular/material/card'
import { IconField } from 'primeng/iconfield'
import { InputIcon } from 'primeng/inputicon'

export class AppSequenceApprover {
  id!: string
  name!: string
  approver_role!: string
  approval_order!: number
  title!: string
}

@Component({
  selector: 'app-sequence',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    MatCardModule,
    ReactiveFormsModule,
    IconField,
    InputIcon
  ],
  templateUrl: './app-sequence.component.html',
  styleUrls: ['./app-sequence.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class AppSequenceComponent implements OnInit {
  sequences: AppSequenceApprover[] = []
  approverForm!: FormGroup
  approverDialog = false
  isEditMode = false
  currentApproverId: string | null = null
  submitted = false

  committeeMembers: SignatureInfo[] = PROCUREMENT_DATA.metadata.committeeMembers

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initializeForm()
    this.loadApprovers()
  }

  initializeForm(): void {
    this.approverForm = this.formBuilder.group({
      name: ['', Validators.required],
      approver_role: ['', Validators.required],
      approval_order: [1, [Validators.required, Validators.min(1)]],
      title: ['', Validators.required],
    })
  }

  loadApprovers(): void {
    this.sequences = this.committeeMembers.map((member, index) => ({
      id: (index + 1).toString(),
      name: member.name,
      approver_role: member.role,
      approval_order: index + 1,
      title: member.position,
    }))
  }

  openNewApproverDialog(): void {
    this.approverForm.reset()
    this.approverForm.patchValue({ approval_order: this.getNextOrder() })
    this.isEditMode = false
    this.approverDialog = true
  }

  getNextOrder(): number {
    return this.sequences.length > 0 ? this.sequences[this.sequences.length - 1].approval_order + 1 : 1
  }

  saveApprover(): void {
    this.submitted = true
    if (this.approverForm.invalid) return

    const formValue = this.approverForm.value
    const newApprover: AppSequenceApprover = {
      id: this.isEditMode && this.currentApproverId ? this.currentApproverId : Math.random().toString(),
      name: formValue.name,
      approver_role: formValue.approver_role,
      approval_order: formValue.approval_order,
      title: formValue.title,
    }

    if (this.isEditMode) {
      const index = this.sequences.findIndex(a => a.id === this.currentApproverId)
      if (index !== -1) this.sequences[index] = newApprover
    } else {
      this.sequences.push(newApprover)
    }

    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Approver saved successfully!' })
    this.hideDialog()
  }

  editApprover(approver: AppSequenceApprover): void {
    this.approverForm.patchValue({
      name: approver.name,
      approver_role: approver.approver_role,
      approval_order: approver.approval_order,
      title: approver.title,
    })
    this.isEditMode = true
    this.currentApproverId = approver.id
    this.approverDialog = true
  }

  deleteApprover(approver: AppSequenceApprover): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this approver?',
      accept: () => {
        this.sequences = this.sequences.filter(a => a.id !== approver.id)
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Approver deleted' })
      },
    })
  }

  hideDialog(): void {
    this.approverDialog = false
    this.submitted = false
    this.approverForm.reset()
  }
}
