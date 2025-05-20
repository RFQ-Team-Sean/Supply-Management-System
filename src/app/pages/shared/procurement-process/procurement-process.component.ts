import { Component, OnInit } from '@angular/core';
import { MultiTableComponent, MultiTableData } from 'src/app/components/multi-table/multi-table.component';
import {  ProcurementMode, ProcurementProcess } from 'src/app/schema/schema';
import { CrudService } from 'src/app/services/crud.service';
import {DividerModule} from 'primeng/divider'
import { DynamicFormComponent, DynamicFormData } from 'src/app/components/dynamic-form/dynamic-form.component';
import { Validators } from '@angular/forms';
@Component({
  selector: 'app-procurement-process',
  standalone: true,
  imports: [MultiTableComponent, DividerModule,DynamicFormComponent],
  templateUrl: './procurement-process.component.html',
  styleUrl: './procurement-process.component.scss'
})
export class ProcurementProcessComponent implements OnInit {

  selectedMode:ProcurementMode;
  selectedProcess:ProcurementProcess;

  procurementMethod: MultiTableData<ProcurementMode> = {
    title: 'Procurement Mode',
    description: 'View and manage the procurement mode.',
    type: 'default',
    columns: {
      mode_name: 'Mode',
      method: 'Method'
    },
    data: [],
    searchFields: ['mode_name','method'],
    topActions: [
      {
        label: 'Add Method',
        icon: 'pi pi-plus',
        tooltip: 'Click to add method',
        function: async  () => {
          // TODO: Implement adding new procurement process
          this.modeForm.title = 'Add Procurement Method';
          this.modeForm.description = 'Add new procurement method.';
          this.modeForm.data = {};
          this.modeForm.show = true;
        }
      }
    ],
    rowActions : [
      {
        shape: 'rounded',
        tooltip: 'Click to edit method',
        icon: 'pi pi-pencil',
        function: async (event:Event,row: ProcurementMode) => {
          // TODO: Implement editing procurement process
          this.modeForm.title = 'Edit Procurement Method';
          this.modeForm.description = 'Edit exisiting procurement method.';
          this.modeForm.data = row,
          this.modeForm.show = true;
        }
      },
      {
        shape: 'rounded',
        icon: 'pi pi-trash',
        tooltip: 'Click to delete mode',
        confirmation: 'Are you sure you want to delete this method?',
        color:'danger',
        function: async (event:Event, row: ProcurementMode) => {
          this.procurementMethod.dataLoaded = false;
          // TODO: Implement deleting procurement process
          await this.crudService.delete(ProcurementMode, row.id)
          await this.loadData();
          this.procurementMethod.dataLoaded = true;
          this.crudService.toast({
            severity:'warn',
            summary:'Mode Deleted',
            detail: "Procurement Mode has been deleted."
          })
        }
      }
    ]
  }
  procurementProcess: MultiTableData<ProcurementProcess, 'procurement_mode_id'> = {
    title: 'Procurement Process',
    description: 'View and manage the procurement process.',
    type: 'sequence',
    columns: { 
      name: 'Name',
    },
    data: [],
    tabField: 'procurement_mode_id', 
    tabs:[
      {
        id:'Public',
        label:'Public'
      },
      {
        id:'Alternative',
        label:'Alternative'
      },
    ],
    activeTab: 0,
    searchFields: ['name'],
    topActions: [
      {
        label: 'Add Process',
        icon: 'pi pi-plus',
        tooltip: 'Click to add process',
        function: async () => {
          // TODO: Implement adding new procurement process
          this.processForm.data = {};
          this.processForm.show = true;
          this.processForm.title = 'Add Procurement Process';
          this.processForm.description = 'Add new procurement process';
        }
      }
    ],
    rowActions : [
      {
        shape: 'rounded',
        icon: 'pi pi-pencil',
        tooltip: 'Click to edit process',
        function: async (event:Event,row: ProcurementProcess) => {
          this.processForm.title = 'Edit Procurement Process';
          this.processForm.description = 'Edit existing procurement process';
          this.processForm.data = row;
          this.processForm.show = true;
        }
      },
      {
        shape: 'rounded',
        icon: 'pi pi-trash',
        tooltip: 'Click to delete process',
        confirmation: 'Are you sure you want to delete this process?',
        color:'danger',
        function: async(event:Event, row: ProcurementProcess) => {
          // TODO: Implement deleting procurement process
          this.procurementProcess.dataLoaded = false;
          await this.crudService.delete(ProcurementProcess, row.id)
          await this.loadData();
          this.crudService.toast({
            severity:'warn',
            summary:'Process Deleted',
            detail: "Procurement Process has been deleted."
          })
          this.procurementProcess.dataLoaded = true;
        }
      }
    ],
    dragEvent: async (event)=>{
      this.procurementProcess.dataLoaded = false;
      const item_1 = this.procurementProcess.data[event.dragIndex!]
      const item_2 = this.procurementProcess.data[event.dropIndex!]

      await this.crudService.partial_update(ProcurementProcess, item_1.id,{
        process_order: item_2.process_order,
      })
      await this.crudService.partial_update(ProcurementProcess, item_2.id,{
        process_order: item_1.process_order,
      })
      await this.loadData();
      this.crudService.toast({
        severity:'warn',
        summary:'Sequence Swapped',
        detail: "Procurement sequence has been swapped."
      })
      this.procurementProcess.dataLoaded = true;
      
    }
  }

  modeForm: DynamicFormData<Partial<ProcurementMode>>  = {
    show: false,
    title: "Add Procurement Mode",
    description: "Add new procurement mode",
    data: {},
    submit: async (value)=>{
      this.procurementMethod.dataLoaded = false;
      if(value.id){
        await this.crudService.partial_update(ProcurementMode,value.id,value as Omit<ProcurementMode,'id'>) // await this.loadData();
      }else{
        await this.crudService.create(ProcurementMode, value as Omit<ProcurementMode,'id'>) // await this.loadData();
      }
      await this.loadData();
      if(value.id){
        this.crudService.toast({
          severity:'success',
          summary:'Mode Edited',
          detail: "Procurement Mode has been edited."
        })
      }else{
        this.crudService.toast({
          severity:'success',
          summary:'Mode Added',
          detail: "Procurement Mode has been added."
        })
      }
      this.procurementMethod.dataLoaded = true;
    },
    formfields: []
  };
  processForm: DynamicFormData<Partial<ProcurementProcess>> = {
    show: false,
    title: "Add Procurement Process",
    description: "Add new procurement process",
    data: {},
    submit: async (value)=>{
      this.procurementProcess.dataLoaded = false;
      if(value.id){
        await this.crudService.partial_update(ProcurementProcess,value.id,value as Omit<ProcurementProcess,'id'>) // await this.loadData();
      }else{
        await this.crudService.create(ProcurementProcess, {
          ...value as Omit<ProcurementProcess,'id'>,
          procurement_mode_id: this.procurementProcess.tabs?.[this.procurementProcess.activeTab!].id!,
          process_order: this.procurementProcess.data.length + 1
        }) // await this.loadData();
      }
      await this.loadData();
      if(value.id){
        this.crudService.toast({
          severity:'success',
          summary:'Process Edited',
          detail: "Procurement Process has been edited."
        })
      }else{
        this.crudService.toast({
          severity:'success',
          summary:'Process Added',
          detail: "Procurement Process has been added."
        })
      }
      this.procurementProcess.dataLoaded = true;
    },
    formfields: []
  };

  constructor(private crudService:CrudService){}

  ngOnInit(): void {
    this.loadData();
  }
  async loadData(){   
    this.procurementMethod.data = await this.crudService.getAll(ProcurementMode);
    this.procurementMethod.dataLoaded = true;
    this.procurementProcess.data = await this.crudService.getAll(ProcurementProcess);
    this.procurementProcess.data =  this.procurementProcess.data.sort((a,b)=> a.process_order - b.process_order);
    this.procurementProcess.dataLoaded = true;

    this.crudService.live(ProcurementMode).subscribe(async()=>{
      this.procurementMethod.data = await this.crudService.getAll(ProcurementMode);
    })

    this.crudService.live(ProcurementProcess).subscribe(async ()=>{
      this.procurementProcess.data = await this.crudService.getAll(ProcurementProcess);
      this.procurementProcess.data =  this.procurementProcess.data.sort((a,b)=> a.process_order - b.process_order);
      this.procurementProcess.dataLoaded = true;
    })

    this.modeForm.formfields = [
      {
        id: 'method',
        label: 'Method',
        placeholder: 'Select method',
        type: 'select',
        options: [
          {
            'label': 'Public',
            'value': 'Public'
          },
          {
            'label': 'Alternative',
            'value': 'Alternative'
          },
        ],
        validators: [
          {
            'message':'Method type is required.',
            'validator': Validators.required,
            'name':'required'
          }
        ]
      },
      {
        id: 'mode_name',
        label: 'Mode Name',
        placeholder: 'Input Mode Name',
        type: 'input',
        validators: [
          {
            'message':'Mode name is required.',
            'validator': Validators.required,
            'name':'required'
          }
        ]
      },
    ]

    this.processForm.formfields = [
      {
        'id':'name',
        'label':'Process Name',
        'placeholder':'Enter Process Name',
        'type':'input',
        'validators':[
          {
            'message':'Process Name is required',
            'validator':Validators.required,
            'name':'required',
          }
        ]
      }
    ]

  
  }
}
