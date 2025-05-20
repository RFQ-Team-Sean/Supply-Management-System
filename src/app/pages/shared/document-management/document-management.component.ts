import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from 'src/app/services/crud.service';
import { MessageService } from 'primeng/api';
import { Document, ProcurementProcess, Entity, Users } from 'src/app/schema/schema';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    DialogModule,
    ToastModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    CalendarModule,
    FileUploadModule,
  ],
  templateUrl: './document-management.component.html',
  styleUrl: './document-management.component.scss',
  providers: [MessageService],
})
export class DocumentManagementComponent implements OnInit {
  searchQuery = '';
  displayDialog = false;
  documents: Document[] = [];
  filteredDocuments: Document[] = [];
  procurementProcessOptions: ProcurementProcess[] = [];
  entityOptions: Entity[] = [];
  recordOptions: any[] = [];
  usersOptions: Users[] = [];

  newDocument: Document = {
    id: '0',
    procurement_process_id: '',
    entity_id: 0,
    record_id: '0',
    file_path: '',
    uploaded_by: 0,
    upload_date: new Date(),
  };

  constructor(
    private crudService: CrudService,
    private messageService: MessageService
  ) {}

  async ngOnInit() {
    await this.loadDocuments();
    await this.loadDropdownData();
  }

  async loadDocuments() {
    this.documents = await this.crudService.getAll(Document);
    this.filteredDocuments = [...this.documents];
  }

  async loadDropdownData() {
    this.procurementProcessOptions = await this.crudService.getAll(ProcurementProcess);
    this.entityOptions = await this.crudService.getAll(Entity);
    this.usersOptions = await this.crudService.getAll(Users);
  }

  async submitDocument() {
    if (!this.newDocument.procurement_process_id || !this.newDocument.entity_id || !this.newDocument.record_id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
      });
      return;
    }

    await this.crudService.create(Document, this.newDocument);
    await this.loadDocuments();
    this.displayDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Document added successfully.',
    });
  }

  async deleteDocument(document: Document) {
    await this.crudService.delete(Document, document.id.toString());
    await this.loadDocuments();
    this.messageService.add({
      severity: 'success',
      summary: 'Deleted',
      detail: 'Document deleted successfully.',
    });
  }

  async updateRecordOptions() {
    if (!this.newDocument.entity_id) {
      this.recordOptions = [];
      return;
    }

    const allRecords = await this.crudService.getAll(Document);
    this.recordOptions = allRecords.filter(record => record.entity_id === this.newDocument.entity_id);
  }

  filterDocuments() {
    this.filteredDocuments = this.documents.filter(doc =>
      doc.file_path.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  showDialog() {
    this.displayDialog = true;
  }
 
  getProcurementProcessName(id: string): string {
    return this.procurementProcessOptions.find(proc => proc.id === id)?.name || 'Unknown';
  }

  getEntityName(id: number): string {
    return this.entityOptions.find(ent => ent.id === id)?.name || 'Unknown';
  }

  getRecordName(id: number): string {
    return this.recordOptions.find(rec => rec.id === id)?.name || 'Unknown';
  }
  getUploadedByName(id: number): string {
    return this.usersOptions.find(user => user.id === id.toString())?.fullname || 'Unknown';
  }

  viewDocument(document: Document) {
    window.open(document.file_path, '_blank');
  }

  onFileUpload(event: any) {
    if (event.files.length > 0) {
      const file = event.files[0];
      this.newDocument.file_path = file.name;
    }
  }
}
