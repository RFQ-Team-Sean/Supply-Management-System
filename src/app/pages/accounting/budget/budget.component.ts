import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MultiTableComponent, MultiTableData } from 'src/app/components/multi-table/multi-table.component';
import { Budget, PPMPProject, UserBudget, Users } from 'src/app/schema/schema';
import { CrudService } from 'src/app/services/crud.service';
import { DynamicFormComponent, DynamicFormData } from 'src/app/components/dynamic-form/dynamic-form.component';
import { Validators } from '@angular/forms';

interface UserBudgetExtended extends UserBudget {
  user: string;
  budget_name: string;
  fiscal_year: number;
  remaining_budget: number;
}

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  providers: [MessageService, ConfirmationService, CurrencyPipe],
  standalone: true,
  imports: [CommonModule,
    MultiTableComponent, DynamicFormComponent],
})
export class BudgetComponent implements OnInit {

  constructor(
    private crudService: CrudService,
    private currencyPipe: CurrencyPipe,

  ) { }

  ngOnInit(): void {
    this.loadData();
    this.crudService.live(UserBudget).subscribe(()=>{
      this.loadData();
    })
  }

  userBudgets: MultiTableData<UserBudgetExtended> = {
    title: 'Budget Allocation Management',
    description: 'Manage end-user budget allocations and track expenditure.',
    type: 'default',
    columns: {
      user: 'End-User',
      budget_name: 'Budget',
      fiscal_year: 'Fiscal Year',
      allocated_amount: "Allocated Budget",
      used_amount: "Used Budget",
      remaining_budget: "Remaining Budget",
    },
    formatters: {
      allocated_amount: (value) => this.currencyPipe.transform(value?.toString(), 'PHP', 'symbol', '1.2-2') ?? '',
      used_amount: (value) => this.currencyPipe.transform(value?.toString(), 'PHP', 'symbol', '1.2-2') ?? '',
      remaining_budget: (value) => this.currencyPipe.transform(value?.toString(), 'PHP', 'symbol', '1.2-2') ?? '',
    },
    data: [],
    topActions: [
      {
        label: 'Add Allocation',
        icon: 'pi pi-plus',
        tooltip: 'Click to add allocation',
        function: async () => {
          // TODO: Implement adding new procurement process
          this.userBudgetForm.data = {}
          this.userBudgetForm.title=  "Add Allocation",
          this.userBudgetForm.description=   "Allocate New Budget to a User",
          this.userBudgetForm.show = true;
        }
      }
    ],
    rowActions: [
      {
        shape: 'rounded',
        tooltip: 'Click to edit this allocation',
        icon: 'pi pi-pencil',
        function: async (event: Event, row: UserBudgetExtended) => {
          // TODO: Implement deleting procurement process
          this.userBudgetForm.title = 'Edit allocation';
          this.userBudgetForm.description = 'Edit existing allocation on this user';
          this.userBudgetForm.data = row as UserBudget;
          this.userBudgetForm.show = true;
        }
      },
      {
        shape: 'rounded',
        tooltip: 'Click to delete allocation',
        icon: 'pi pi-trash',
        confirmation: 'Are you sure you want to delete this allocation?',
        color: 'danger',
        function: async (event: Event, row: UserBudgetExtended) => {
          // TODO: Implement deleting procurement process
          this.userBudgets.dataLoaded = false;
          await this.crudService.delete(UserBudget, row.id)
          await this.loadData();
          this.crudService.toast({
            severity: 'warn',
            summary: 'Allocation Deleted',
            detail: 'Allocation has been deleted'
          })
          this.userBudgets.dataLoaded = true;
        }
      },
    ],
  }

  userBudgetForm: DynamicFormData<Partial<UserBudget>> = {
    show: false,
    title: "Add Allocation",
    description: "Allocate new budget to a user",
    data: {},
    submit: async (value) => {
      this.userBudgets.dataLoaded = false;
      if (value.id) {
        await this.crudService.partial_update(UserBudget, value.id, value as Omit<UserBudget, 'id'>) // await this.loadData();
      } else {

        await this.crudService.create(UserBudget, {
          ...value as Omit<UserBudget, 'id'>,
          used_amount: 0,
          date_allocated: new Date()
        })
      }
      await this.loadData();
      if(value.id){
        this.crudService.toast({
          severity: 'success',
          summary: 'Allocation Edited',
          detail: 'Allocation has been edited'
        })
      }else{
        this.crudService.toast({
          severity: 'success',
          summary: 'Allocation Added',
          detail: 'New allocation has been added'
        })
      }
      this.userBudgets.dataLoaded = true;
    },
    formfields: []
  };

  async loadData() {
    const [users,budgets,userbudgets,projects] = await this.crudService.forJoin(Users,Budget, UserBudget, PPMPProject);

    for(let budget of budgets){
      budget.used_amount = userbudgets.filter(u=>u.budget_id == budget.id).reduce((acc,b)=> acc += b.allocated_amount,0)
    }
    this.userBudgets.data = userbudgets.filter(ub=> {
      const user = users.find(u=>u.id == ub.user_id);
      const budget = budgets.find(b=>b.id == ub.budget_id);
      return user && budget
    }).map(ub=>{
      const user = users.find(u=>u.id == ub.user_id)!;
      const budget = budgets.find(b=>b.id == ub.budget_id)!;
      ub.used_amount = projects.filter(p=>p.user_budget_id == ub.id).reduce((acc,p)=> acc += p.abc ??0 ,0);
      return {
        ...ub,
        user: user.fullname,
        budget_name: budget.budget_name,
        fiscal_year: budget.fiscal_year,
        remaining_budget: ub.allocated_amount - ub.used_amount ,
      }
    })
    this.userBudgets.dataLoaded = true;
    const buildForm = () => {
      this.userBudgetForm.rebuild = buildForm
      const currentUserBudget = userbudgets.find(u=>u.id == this.userBudgetForm.data.id);
      const currentBudget = budgets.find(b=>b.id == this.userBudgetForm.data.budget_id)
      const remaining_budget =  (currentBudget?.allocated_budget??0) - (currentBudget?.used_amount??0) + (currentUserBudget && currentUserBudget?.budget_id ==  currentBudget?.id ? this.userBudgetForm.data.allocated_amount ?? 0:0);
      const prompt = this.userBudgetForm.data.budget_id ?  ` (${this.currencyPipe.transform(remaining_budget, 'PHP', 'symbol', '1.2-2')} remaining)` : ''
      this.userBudgetForm.formfields  = [
        {
           id: 'user_id',
           label: 'User',
           placeholder: 'Select User',
           type: 'select',
           options: users.filter(u=> {
             return u.role == 'enduser'
           }).map(u=>{
             return {
               'label':u.fullname,
               'value': u.id,
             }
           }),
           validators: [
             {
               'message': 'User is required.',
               'validator': Validators.required,
               'name': 'required'
             }
           ]
         },
        {
           id: 'budget_id',
           label: `Budget ${prompt}`,
           placeholder: 'Select Budget',
           type: 'select',
           options: budgets.filter(b=> {
             const user = users.find(u=> u.id == this.userBudgetForm.data.user_id) ;
             return b.office_id == user?.officeId
           }).map(b=>{
             return {
               'label':b.budget_name,
               'value': b.id,
             }
           }),
           validators: [
             {
               'message': 'Budget is required.',
               'validator': Validators.required,
               'name': 'required'
               
             }
           ]
         },
         {
           id: 'allocated_amount',
           label: 'Allocated Amount',
           placeholder: 'Input allocated amount',
           disabled: !this.userBudgetForm.data.budget_id,
           type: 'currency',
           validators: [
             {
               'message': 'Allocated amount is required.',
               'validator': Validators.required,
               'name': 'required',
             },
             {
               'message': 'Allocated amount should be greater than 0.',
               'validator': Validators.min(0.001),
               'name':'min'
              },
              {
                'message': `Allocated amount is greater than remaining budget`,
                'validator': Validators.max(remaining_budget),
                'name':'max'
              },
           ]
         },
         
      ]
    }
    buildForm()
  }
}
