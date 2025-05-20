import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import {  Validators } from '@angular/forms';
import { Approvals, Approver, Notification, Office, PPMPItem, PPMPProject, ProcurementMode, ProcurementProcess, PurchaseRequest, Users } from 'src/app/schema/schema';
import { CrudService } from 'src/app/services/crud.service';
import { DynamicFormComponent, DynamicFormData } from 'src/app/components/dynamic-form/dynamic-form.component';
import { UserService } from 'src/app/services/user.service';
import { ProgressTableComponent, ProgressTableData } from 'src/app/components/progress-table/progress-table.component';
import { SignatureModalComponent, SignatureModalData } from 'src/app/components/signature-modal/signature-modal.component';
import { ToastModule } from 'primeng/toast';

interface PurchaseRequestJoin extends PurchaseRequest {
  office: string;
  totalAmount: number;
  project_description: string;
  project_name:string;
  project_code:string;
  approve_signature?:string;
  remarks?:string;
  status_extended:'Rejected' | 'Draft'| 'Pending' |  string
}

@Component({
  selector: 'app-pr-shared',
  templateUrl: './pr-shared.component.html',
  styleUrls: ['./pr-shared.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ProgressTableComponent,
    DynamicFormComponent,
    SignatureModalComponent,
    ToastModule
  ],
  providers: [CurrencyPipe, DatePipe]
})
export class PrSharedComponent implements OnInit {

  user?: Users;

  constructor(
    private crudService: CrudService,
    private router: Router,
    private userService: UserService,
    private currencyPipe: CurrencyPipe,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.loadData();
    this.crudService.live(PurchaseRequest).subscribe(()=>{
      this.loadData();
    })
  }

  selfSignature: SignatureModalData<Partial<PurchaseRequestJoin>> = {
    title:'Finalize Purchase Request',
    description: 'You can always set your signature on your profile.',
    id:'signature',
    data: {},
    show: false,
    submit: async (signed)=>{
      this.prRequests.dataLoaded = false;
      const approvers = await this.crudService.getAll(Approver, {
        filter: {
          'entity_id' : '2'
        },
        sort: {
          'approval_order': 'asc'
        }
      });
      if(!signed){
        throw new Error('System Error: Data not found');
      }
      
      if(approvers.length){
        this.crudService.create(Notification, {
          'created_at': new Date(),
          'is_read':false,
          'type':'info',
          'user_id': approvers[0].user_id,
          'message': `Purchase Request (${signed.prNo}) is requesting for approval`
        })
      }

      await this.crudService.partial_update(PurchaseRequest, signed.id!, {
        'status': 'Pending',
        'signature': signed.signature,
        'current_approver_level': signed.current_approver_level! +1
      })
      
      await this.loadData();
      this.prRequests.dataLoaded = true;
      this.crudService.toast({
        severity: 'success',
        summary: 'Submitted!',
        detail: 'Purchase request has been submitted for approval.'
      });
    }
  }

  approvalSignature: SignatureModalData<Partial<PurchaseRequestJoin>> = {
    title:'Add Signature',
    description: 'You can always set your signature on your profile.',
    id:'approve_signature',
    data: {},
    show: false,
    submit: async (signed)=>{
      this.prRequests.dataLoaded = false;
      const approvers = await this.crudService.getAll(Approver, {
        filter: {
          'entity_id' : '2'
        },
        sort: {
          'approval_order': 'asc'
        }
      });
      const approver =approvers.find(a=>a.user_id == this.user?.id && a.entity_id =='2');
      const lastApprover = signed.current_approver_level! ==  approvers.filter(a=>a.entity_id =='2').length;
      if(!approver || !signed){
        throw new Error('System Error: Approver | Data not found');
      }
     await this.crudService.create(Approvals, {
        approver_id: approver.id,
        document_id: signed.id!,
        approval_status: 'Approved',
        signature: signed.approve_signature,
        timestamp: new Date(),
        entity_id: '2'
      })
      
      if(lastApprover){
        this.crudService.create(Notification, {
          'created_at': new Date(),
          'is_read':false,
          'type':'info',
          'user_id': signed.user_id,
          'message': `Purchase Request (${signed.prNo}) has been approved and can now under-go procurement.`
        })
        await this.crudService.partial_update(PurchaseRequest, signed.id!, {
          'current_approver_level': signed.current_approver_level! + 1,
          'current_procurement_level': 1,
          'status': 'Approved'
        })
        
      }else{
        this.crudService.create(Notification, {
          'created_at': new Date(),
          'is_read':false,
          'type':'info',
          'user_id': approvers[signed.current_approver_level!].user_id,
          'message': `Purchase Request (${signed.prNo}) needs approval`
        });
        this.crudService.create(Notification, {
          'created_at': new Date(),
          'is_read':false,
          'type':'info',
          'user_id': signed.user_id,
          'message': `Purchase Request (${signed.prNo}) has been approved by ${approver.name}`
        })
        await this.crudService.partial_update(PurchaseRequest, signed.id!, {
          'current_approver_level': signed.current_approver_level! + 1,
        });
        
      }
      
      await this.loadData();
      this.prRequests.dataLoaded = true;
      this.crudService.toast({
        severity: 'success',
        summary: 'Approved!',
        detail: 'Purchase request has been approved.'
      });
    }
  }

  rejectForm: DynamicFormData<Partial<PurchaseRequestJoin>> = {
    show: false,
    title: "Reject Purchase Request",
    description: "Specify note for rejecting request",
    data: {},
    formfields: [
      {
        id:'remarks',
        label : 'Remarks',
        placeholder: 'Enter notes for rejecting request',
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
      this.prRequests.dataLoaded = false;
      const approver = (await this.crudService.getAll(Approver,{
        filter: {
          'user_id': this.user?.id
        }
      }))[0];
      if(!approver || !value){
        throw new Error('System Error: Approver | Data not found');
      }
      await this.crudService.create(Approvals, {
        approver_id: approver.id,
        document_id: value.id!,
        approval_status: 'Rejected',
        remarks: value.remarks,
        timestamp: new Date(),
        entity_id: '2'
      })
      this.crudService.create(Notification, {
        'created_at': new Date(),
        'is_read':false,
        'type':'warning',
        'user_id': value.user_id,
        'message': `Purchase Request (${value.prNo}) has been rejected`
      })
      await this.crudService.partial_update(PurchaseRequest, value.id!, {
        'current_approver_level': 0,
        'status': 'Draft'
      })
     
      await this.loadData();
      this.prRequests.dataLoaded = true;
      this.crudService.toast({
        severity: 'warn',
        summary: 'Rejected!',
        detail: 'Purchase request has been rejected back to the requisition office.'
      });
    }
  }

  prForm: DynamicFormData<Partial<PurchaseRequestJoin>> = {
    show: false,
    title: "Create Purchase Request",
    description: "Create new purchase request",
    data: {},
    rows: [1,2,1],
    onError: ()=>{
      this.prRequests.dataLoaded = true;
      this.crudService.toast({
        severity: 'error',
        summary: 'Failed',
        detail: 'Unable to create puchase request.'
      });
    },
    submit: async (value) => {
      this.prRequests.dataLoaded = false;
      if (value.id) {
        await this.crudService.partial_update(PurchaseRequest, value.id, value as Omit<PurchaseRequest, 'id'>) // await this.loadData();
       
      } else {
        const projects = await this.crudService.getAll(PPMPProject);
        const project = projects.find(p=>p.id == value.project_id)
        await this.crudService.create(PurchaseRequest, {
          ...value as Omit<PurchaseRequest, 'id'>,
          user_id: this.user!.id,
          prNo: 'PR' +'-'  + project?.project_code,
          request_date: new Date(),
          current_approver_level: 0,
          office_id: this.user?.officeId!,
          status: 'Draft',
        }) // await this.loadData();
      }
      await this.loadData();
      this.prRequests.dataLoaded = true;
      if(value.id){
        this.crudService.toast({
          severity: 'success',
          summary: 'Edited!',
          detail: 'Puchase request has been edited.'
        });
      }else{
        this.crudService.toast({
          severity: 'success',
          summary: 'Drafted!',
          detail: 'Purchase request has been drafted.'
        });
      }
    },
    formfields: []
  };


  prRequests: ProgressTableData<PurchaseRequestJoin, 'status'> = {
    title: 'Purchase Requests',
    description: 'Create, view and track purchase requests in this section.',
    columns: {
      prNo: 'PR No.',
      project_name: 'Project Title',
      office: 'Requisitioning Office',
      request_date: "Request Date",
      totalAmount: "Total Amount",
      status_extended: 'Status'
    },
    formatters: {
      totalAmount: (value) => this.currencyPipe.transform(value?.toString(), 'PHP', 'symbol', '1.2-2') ?? '',
      request_date: (value) => this.datePipe.transform(value?.toString(), 'longDate') ?? ''
    },
    data: [],
    rowHighlight: (row)=>{
      return row.status_extended == 'Rejected' ? '!bg-gradient-to-r from-orange-50 to-transparent': ''
    },
    steps: [
      {
        id: 'Draft',
        label: 'Draft',
        icon: 'pi pi-inbox',
      },
      {
        id: 'Pending',
        label: 'Pending',
        icon: 'pi pi-spinner-dotted pi-spin',
      },
      {
        id: 'Approved',
        label: 'Approved',
        icon: 'pi pi-verified',
      },
    ],
    activeStep: 0,
    topActions: [
      {
        label: 'Create Purchase Request',
        icon: 'pi pi-plus',
        tooltip: 'Click to draft purchase request',
        function: async () => {
          // TODO: Implement adding new procurement process
          this.prForm.show = true;
          this.prForm.data = {};
        }
      }
    ],
    stepField: 'status',
    rowActions: [
      {
        hidden: (args: PurchaseRequestJoin) => args.status != 'Draft' || !args.remarks,
        shape: 'rounded',
        tooltip: 'Click to view rejection remarks',
        icon: 'pi pi-inbox',
        label: 'Notice',
        function: async (event: Event, row: PurchaseRequestJoin) => {
          // TODO: Implement deleting procurement process
          this.rejectForm.data = row;
          this.rejectForm.title = 'Rejection Notice';
          this.rejectForm.description = 'This purchase has been rejected due following reason'
          this.rejectForm.view = true;
          this.rejectForm.show = true;
        }
      },
      {
        hidden: (args: PurchaseRequestJoin) => args.status != 'Draft',
        shape: 'rounded',
        tooltip: 'Click to delete purchase request',
        icon: 'pi pi-trash',
        label: 'Delete',
        confirmation: 'Are you sure you want to delete this purchase request?',
        color: 'danger',
        function: async (event: Event, row: PurchaseRequestJoin) => {
          // TODO: Implement deleting procurement process
          this.prRequests.dataLoaded = false;
          await this.crudService.delete(PurchaseRequest, row.id)
          await this.loadData();
          this.prRequests.dataLoaded = true;
          this.crudService.toast({
            severity: 'warn',
            summary: 'Deleted!',
            detail: 'Purchase request has been deleted.'
          });
        }
      },
      {
        shape: 'rounded',
        tooltip: 'Click to view purchase request',
        icon: 'pi pi-eye',
        label: 'View',
        function: async (event: Event, row: PurchaseRequestJoin) => {
          // TODO: Implement deleting procurement process
          this.router.navigate(['/inspection/purchase-request'], {
            queryParams: {
              id: row.id,
              view: 'true'
            }
          });
        }
      },
      {
        hidden: (args: PurchaseRequestJoin) => args.status != 'Draft',
        shape: 'rounded',
        tooltip: 'Click to finalize purchase request',
        color: 'success',
        icon: 'pi pi-arrow-right',
        label: 'Finalize',
        function: async (event: Event, row: PurchaseRequestJoin) => {
          this.selfSignature.data = row;
          this.selfSignature.show = true;
        }
      },
      
    ],
  }
  async loadData() {
    this.user = this.userService.getUser();
    const prs = await this.crudService.joined({
      'PurchaseRequest': 
        {
          'PPMPProject': 
            {
              'PPMPItem': true,
              'ProcurementMode':true,
            },
          'Office': true,
        }
    })

    const [
      approvers, approvals,processes ,items
    ] = await this.crudService.forJoin(Approver, Approvals, ProcurementProcess ,PPMPItem)

    const projects = await this.crudService.joined({
      'PPMPProject': {
        'PPMP': true,
      }
    })

    for(let approval of approvals){
      approval.timestamp = new Date(approval.timestamp);
    }

    this.prRequests.data = prs.filter(pr => {
      // Filter if not end user
      const currentApprover = approvers.find(o=>(o.user_id == this.user?.id && o.entity_id == '2' ));
      return ( 
      (
        (this.user?.role == 'enduser' &&(pr.Office?.id == this.user?.officeId)) || 
        (currentApprover && (currentApprover.approval_order <= pr.current_approver_level) &&  this.user?.role != 'enduser')
      ) 
      && pr.PPMPProject)
    }).map(pr => {

      const currentApprover = approvers.find(o=>(o.user_id == this.user?.id && o.entity_id == '2' ));
      const isApproved = (pr.status == 'Pending' && (pr.current_approver_level > (currentApprover?.approval_order ?? 0) )&& this.user?.role != 'enduser') || pr.status == 'Approved';
      const rejection = approvals.sort((a,b)=> a.timestamp.getTime() - b.timestamp.getTime()).find(a=>a.document_id == pr.id && a.approval_status == 'Rejected' && a.entity_id == '2')

      const process = processes.filter(p=>p.procurement_mode_id == pr.PPMPProject?.ProcurementMode?.method);
      const currentLevel = process[pr.current_procurement_level!]?.name ? 'For ' + process[pr.current_procurement_level!]?.name : null
      const isRejected = pr.status == 'Draft' && rejection
      return {
        ...pr,
        status: isApproved ? 'Approved': pr.status,
        status_extended: isApproved ? currentLevel ?? 'Approved': isRejected ?'Rejected' :pr.status,
        request_date: new Date(pr.request_date),
        office: pr.Office?.name ?? 'N/A',
        remarks: isRejected ? rejection?.remarks : '',
        project_name: pr.PPMPProject?.project_title ?? 'N/A',
        project_code: pr.PPMPProject?.project_code ?? 'N/A',
        project_description: pr.PPMPProject?.project_description ?? 'N/A',
        totalAmount: pr.PPMPProject!.PPMPItem!.reduce((acc, item) => acc + (item.estimated_unit_cost * item.quantity_required), 0),
      }
    }).sort((a,b)=> {
      if(a.status_extended == 'Rejected' && b.status_extended != 'Rejected'){
        return -1
      }else if (a.status_extended != 'Rejected' && b.status_extended == 'Rejected'){
        return 1
      }else{
        return 0;
      }
    })
   

    // get current approval of purchase request

    if(this.user?.role !='enduser'){
      this.prRequests.description = 'View and approve purchase request from this section'
      this.prRequests.topActions = [],
      this.prRequests.steps = [
        {
          id: 'Pending',
          label: 'For Approval',
          icon: 'pi pi-inbox',
        },
        {
          id: 'Approved',
          label: 'Approved',
          icon: 'pi pi-verified',
        },
      ]
      
      this.prRequests.rowActions! = [
        {
          shape: 'rounded',
          tooltip: 'Click to view purchase request',
          icon: 'pi pi-eye',
          function: async (event: Event, row: PurchaseRequestJoin) => {
            // TODO: Implement deleting procurement process
            this.router.navigate(['/inspection/purchase-request'], {
              queryParams: {
                id: row.id,
                view: 'true'
              }
            });
          }
        },
        {
          hidden: (args: PurchaseRequestJoin) => args.status != 'Pending',
          shape: 'rounded',
          tooltip: 'Click to reject this purchase request.',
          color: 'danger',
          icon: 'pi pi-times',
          function: async (event: Event, row: PurchaseRequestJoin) => {
            this.rejectForm.data = row;
            this.rejectForm.title= "Reject Purchase Request";
            this.rejectForm.description= "Specify note for rejecting request";
            this.rejectForm.show = true;
          }
        },
        {
          hidden: (args: PurchaseRequestJoin) => args.status != 'Pending',
          shape: 'rounded',
          tooltip: 'Click to approve this purchase request',
          color: 'success',
          icon: 'pi pi-check',
          function: async (event: Event, row: PurchaseRequestJoin) => {
            this.approvalSignature.data = row;
            this.approvalSignature.show = true;
          }
        },
      ]
    }
    
    
    const buildForm = () => {
      this.prForm.rebuild = buildForm
      const project = projects.find(p=>p.id == this.prForm.data.project_id)
      const _items  = items.filter(i => i.ppmp_project_id == project?.id);
      this.prForm.data.totalAmount = _items.reduce((acc, item) => acc + (item.estimated_unit_cost * item.quantity_required), 0);
      this.prForm.data.project_description = project?.project_description
      this.prForm.data.project_code = project?.project_code
      this.prForm.formfields = [
        {
          id: 'project_id',
          label: 'Project',
          placeholder: 'Select Project',
          type: 'select',
          options: projects.filter(pr=> {
            return pr?.PPMP?.office_id == this.user?.officeId && !prs.map(p=>p.project_id).includes(pr.id)
          }).map(p=>{
            return {
              'label':p.project_title,
              'value': p.id,
            }
          }),
          validators: [
            {
              'message': 'Project is required.',
              'validator': Validators.required,
              'name':'required'
            }
          ]
        },
        {
          id: 'project_code',
          label: 'Project Code',
          readonly:true,
          disabled: !project,
          placeholder: 'Select a project to display code',
          type: 'input',
          validators: []
        },
        {
          id: 'totalAmount',
          label: 'Total Amount',
          readonly:true,
          disabled: !project,
          placeholder: 'Select a project for Total Amount',
          type: 'currency',
          validators: []
        },
        {
          id: 'project_description',
          label: 'Project Description',
          readonly:true,
          disabled: !project,
          placeholder: 'Select a project for description',
          type: 'textarea',
          validators: []
        },
      ]
    }
    buildForm();

    // Check if there are rejected purchase request

    if(this.prRequests.data.filter(pr=>pr.status_extended == 'Rejected').length >0){
      this.crudService.toast({
        severity: 'warn',
        summary: 'Notice!',
        detail: 'A purchase request has been rejected and needs review.'
      });
    }
    
    this.prRequests.dataLoaded = true;
  }
}