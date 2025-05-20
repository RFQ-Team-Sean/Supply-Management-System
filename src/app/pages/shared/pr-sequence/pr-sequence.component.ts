import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Validators,
} from '@angular/forms';

import { MessageService, ConfirmationService } from 'primeng/api';
import { MultiTableComponent, MultiTableData } from 'src/app/components/multi-table/multi-table.component';
import { Approver, Users } from 'src/app/schema/schema';
import { CrudService } from 'src/app/services/crud.service';
import { DynamicFormComponent, DynamicFormData } from 'src/app/components/dynamic-form/dynamic-form.component';
@Component({
  selector: 'app-pr-sequence',
  standalone: true,
  imports: [
    // Angular
    CommonModule,
    MultiTableComponent,
    DynamicFormComponent,
  ],
  templateUrl: './pr-sequence.component.html',
  providers: [ConfirmationService]
})
export class PrSequenceComponent implements OnInit {
 
  constructor(
    private crudService:CrudService,
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.crudService.live(Approver, Users).subscribe(()=>{
      this.loadData();
    })
  }

  approvalSequence: MultiTableData<Approver & {approver:string; role:string}> = {
      title: 'Purchase Request Approval Sequence',
      description: 'Configure and manage approval workflows for purchase requests.',
      type: 'sequence',
      columns: { 
        name: 'Name',
        approver: "Approver's Name",
        role: "Role",
      },
      data: [],
      activeTab: 0,
      searchFields: ['name'],
      topActions: [
        {
          label: 'Add Approver',
          icon: 'pi pi-plus',
          tooltip: 'Click to add approver',
          function: async () => {
            // TODO: Implement adding new procurement process
            this.approverForm.title = 'Add Approval Sequence';
            this.approverForm.description = 'Add new approval sequence';
            this.approverForm.data = {};
            this.approverForm.show = true;
          }
        }
      ],
      rowActions : [
        {
          shape: 'rounded',
          tooltip: 'Click to edit approver',
          icon: 'pi pi-pencil',
          function: async (event:Event,row:Approver & {approver:string}) => {
            this.approverForm.title = 'Edit Approval Sequence';
            this.approverForm.description = 'Edit existing approval sequence';
            this.approverForm.data = row as Approver;
            this.approverForm.show = true;
          }
        },
        {
          shape: 'rounded',
          tooltip: 'Click to delete approver',
          icon: 'pi pi-trash',
          confirmation: 'Are you sure you want to delete this approver?',
          color:'danger',
          function: async(event:Event, row: Approver & {approver:string}) => {
            // TODO: Implement deleting procurement process
            this.approvalSequence.dataLoaded = false;
            await this.crudService.delete(Approver, row.id)
            await this.loadData();
            this.crudService.toast({
              severity:'warn',
              summary:'Approver Deleted',
              detail: "Approver has been deleted"
            })
            this.approvalSequence.dataLoaded = true;
          }
        }
      ],
      dragEvent: async (event)=>{
        this.approvalSequence.dataLoaded = false;
        const item_1 = this.approvalSequence.data[event.dragIndex!]
        const item_2 = this.approvalSequence.data[event.dropIndex!]
        console.log('?', item_1, item_2);
  
        await this.crudService.partial_update(Approver, item_1.id,{
          approval_order: item_2.approval_order,
        })
        await this.crudService.partial_update(Approver, item_2.id,{
          approval_order: item_1.approval_order,
        })
        await this.loadData();
        this.crudService.toast({
          severity:'warn',
          summary:'Sequence Swapped',
          detail: "Approver Sequence has been swapped"
        })
        this.approvalSequence.dataLoaded = true;
        
      }
    }

    approverForm: DynamicFormData<Partial<Approver>> = {
      show: false,
      title: "Add Approver",
      description: "Add new approver",
      data: {},
      submit: async (value)=>{
        this.approvalSequence.dataLoaded = false;
        if(value.id){
          await this.crudService.partial_update(Approver,value.id,value as Omit<Approver,'id'>) // await this.loadData();
        }else{
          await this.crudService.create(Approver, {
            ...value as Omit<Approver,'id'>,
            entity_id: '2',
            approval_order: this.approvalSequence.data.length + 1
          }) 
        }
        await this.loadData();
        if(value.id){
          this.crudService.toast({
            severity:'success',
            summary:'Approver Edited',
            detail: "Approver has been edited."
          })
        }else{
          this.crudService.toast({
            severity:'success',
            summary:'Approver Added',
            detail: "Approver has been added."
          })
        }
        this.approvalSequence.dataLoaded = true;
      },
      formfields: []
    };

    async loadData(){
      const approvers = await this.crudService.getAll(Approver);
      const users = await this.crudService.getAll(Users);
      this.approvalSequence.data = approvers.filter(a=>{
        const user = users.find(u=>u.id == a.user_id);  
        return a.entity_id == '2' && user
      }).map(a=> {
        const user = users.find(u=>u.id == a.user_id)!;
        return {
          ...a,
          approver: user.fullname,
          role: user.role
        }
      }).sort((a,b)=> a.approval_order - b.approval_order);

      this.approvalSequence.dataLoaded = true;

      const build = () =>{
        this.approverForm.rebuild = build;
        this.approverForm.formfields = [
          {
            id: 'user_id',
            label: 'User',
            placeholder: 'Select Approver',
            type: 'select',
            options: users.filter(user=>(user.role != 'enduser') && ( this.approverForm.data.user_id == user.id || !approvers.map(a=>a.user_id).includes(user.id))).map(u=> ({'label': u.fullname, 'value':u.id})),
            validators: [
              {
                'message':'Approver is required.',
                'validator': Validators.required,
                'name':'required'
              }
            ]
          },
          {
            id: 'name',
            label: 'Approval Name',
            placeholder: 'Enter approval name',
            type: 'input',
            validators: [
              {
                'message':'Approval name is required.',
                'validator': Validators.required,
                'name':'required'
              }
            ]
          },
        ] 
      }
      build();
    }
}
