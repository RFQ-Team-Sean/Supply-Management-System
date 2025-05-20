import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem, MenuItemCommandEvent, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { FluidModule } from 'primeng/fluid';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SkeletonModule } from 'primeng/skeleton';
import { LottieAnimationComponent } from 'src/app/pages/ui-components/lottie-animation/lottie-animation.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { StyleClassModule } from 'primeng/styleclass';
import { CrudService } from 'src/app/services/crud.service';
/**
 * Top action configuration
 * @param icon: A string for icon
 * @param function: A function to trigger when button is pressed
 * @param color: (Optional) An enum representing color
 * @param label: (Optional) A string to display as label
 * @param tooltip: (Optional) A string to display when hovered
 */
interface TopAction<K>{
  hidden?: boolean,
  only?: K[],
  icon:string,
  function: ()=>void
  color?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast',
  label?:string,
  tooltip?:string;
}
/**
 * Row action configuration
 * @param icon: A string for icon
 * @param shape: A string representing buttons shape
 * @param function: A function to trigger when button is pressed
 * @param disabled: (Optional) A function => boolean to lock button
 * @param hidden: (Optional) A function => boolean to hide button
 * @param color: (Optional) An enum representing color
 * @param label: (Optional) A string to display as label
 * @param tooltip: (Optional) A string to display when hovered
 */
interface RowAction<T> {
  icon:string,
  shape:'rounded'|'default',
  function?:  ((event:Event,args:T)=>Promise<void>) | ((event:Event,args:T)=>void)
  confirmation?: string,
  disabled?:(args:T)=>boolean,
  hidden?:(args:T)=>boolean,
  color?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast',
  label?:string,
  tooltip?:string,
  onError?: ()=>void,
}
/**
 * Step configuration
 * @param id : A string representing the filter value for  datarows
 * @param label: A string to display as step label
 * @param actions: List of RowAction per step
 * @param tooltip: (Optional) A string to display when hovered
 * @param icon: (Optional) A string for icon
 * @param function: (Optional) Custom function to call when pressed
 */
interface Step<T, K extends keyof T>{
  id:T[K],
  label:string,
  tooltip?:string,
  icon?:string,
  function?:(event:Event,id:T[K])=>void
}
/**
 * Contains Data for Progress Table
 * 
 * Usage (TS):
 * ```ts
 * this.config:ProgressTableData<User,'verified'> = {
 *  title: 'My Table',
 *  description: 'This is an example table',
 *  columns: {
 *    'name' : 'Name',
 *    'id'   : 'User ID'
 *  },
 *  activeStep: 0,
 *  stepField: 'verified',
 *  steps: [
 *    id:'unverified',
 *    label:'Unverified',
 *    actions: [
 *      {
 *        icon: 'pi pi-spinner pi-spin',
 *        shape: 'default',
 *        label: 'Waiting...',
 *        disabled: true,
 *      }
 *    ]
 *    
 *  ],
 *  data: this.data,
 * }
 * // Additional data processing
 * this.config.dataLoaded = true
 * ```
 * @param title: A string representing table name
 * @param description: A string representing table description
 * @param columns: A map of strings to map real fields to names
 * @param activeStep: A number representing default step
 * @param stepField: A key representing the field to filter
 * @param steps: An array of step configurations
 * @param data: an array of data to display
 * @param formatters: (Optional) A map of strings to map real fields to function formatters
 * @param searchFields: (Optional) an array of keys to filter using search
 * @param topAction: (Optional) an TopAction object which represent top action button
 * @param dataLoaded: (Defaults false) a boolean to toggle loading indicator on table
 * Usage (HTML)
 * ```html
 * <app-progress-table [config]="config" />
 * ```
 * 
 */
export interface ProgressTableData<T, K extends keyof T>{
  title:string,
  description:string,
  columns: {[K in keyof Partial<T>]:string},
  activeStep:number,
  stepField:K,
  steps: [Step<T, K>, Step<T, K>] | [Step<T, K>, Step<T, K>, Step<T, K>];
  data: T[],
  formatters?:{[K in keyof Partial<T>]:(value:T[keyof T])=>string},
  topActions?:TopAction<T[K]>[],
  rowActions?: RowAction<T>[]
  searchFields?:(keyof T)[],
  rowHighlight?: (row:T)=>string,
  dataLoaded?:boolean,
}


@Component({
  selector: 'app-progress-table',
  standalone: true,
  imports: [
    CommonModule,FormsModule,MaterialModule, SkeletonModule, MenuModule, ConfirmDialogModule, StyleClassModule,
    LottieAnimationComponent,ButtonModule,IconFieldModule,InputIcon,InputTextModule,StepperModule,TableModule,ToastModule,FluidModule,TooltipModule,DialogModule,ConfirmPopupModule],
  providers:[MessageService,ConfirmationService],
  templateUrl: './progress-table.component.html',
  styleUrl: './progress-table.component.scss'
})
export class ProgressTableComponent<T,K extends keyof T> {
  @Input() config:ProgressTableData<T,K>;
  moreItems: MenuItem[]  = [];
  confirmMode: 'dialog'| 'popup';
  searchValue:string='';

  constructor(private confirmationService:ConfirmationService, private crudService:CrudService){}

  
  formatValue(field: keyof T,row:T){
    if(this.config){
      if(!this.config.formatters) return row[field];
      if(field in this.config.formatters){
        return this.config.formatters[field]!(row[field])
      }else{
        return row[field];
      }
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }

  getColumnNames():string[]{
    if(this.config){
      const table_names = Object.values(this.config.columns) as string[];
      return table_names;
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }

  getRowActions(row: T): RowAction<T>[] {
    let actions: RowAction<T>[] = [];
    
    if (this.config) {
      actions = (this.config.rowActions ?? []).filter(a=>!a.hidden || !a.hidden(row));
    }
  
    // If more than 3 actions, return only the last 2
    if (actions.length > 3) {
      return actions.slice(-2);
    }
    
    return actions;
  }

  private menuItemsCache = new Map<T, MenuItem[]>();

  getMenuItems(row: T): MenuItem[] {
    // Return cached items if available
    if (this.menuItemsCache.has(row)) {
      return this.menuItemsCache.get(row)!;
    }

    let actions: RowAction<T>[] = [];

    if (this.config) {
      actions = (this.config.rowActions ?? []).filter(a => !a.hidden?.(row));
    }

    if (actions.length > 3) {
      actions = actions.slice(0,-2);
    }else{
      actions = [];
    }

    const menuItems = actions.map(action => {
      return {
        label: action.label,
        icon: action.icon,
        tooltip: action.tooltip,
        disabled: action.disabled ? action.disabled(row) : false,
        visible: action.hidden ? !action.hidden(row) : true,
        styleClass: this.getSeverityClass(action.color ?? 'primary'),
        command: async (event: MenuItemCommandEvent) => {
          if (action.function) {
            if (action.confirmation) {
              this.confirmDialog(event.originalEvent!, row, action);
            } else {
              try{
                await action.function(event.originalEvent!, row);
              }catch(e){
                this.crudService.console(e)
                if(action.onError){
                  action.onError();
                }else{
                  this.crudService.toast({
                    'severity':'error',
                    'summary': 'Failed',
                    'detail': 'Something went wrong.'
                  })
                }
              }
            }
          }
        }
      } as MenuItem;
    });

    // Cache the result
    this.menuItemsCache.set(row, menuItems);
    return menuItems;
  }

  private getSeverityClass(severity?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast'): string {
    switch (severity) {
      case 'danger':
        return 'p-menuitem-danger';
      case 'success':
        return 'p-menuitem-success';
      case 'secondary':
        return 'p-menuitem-secondary';
      case 'info':
        return 'p-menuitem-info';
      case 'warn':
        return 'p-menuitem-warning';
      case 'help':
        return 'p-menuitem-help';
      case 'primary':
        return '';
      case 'contrast':
        return 'p-menuitem-contrast';
      default:
        return ''; // No special styling
    }
}

  getFieldNames(): string[]{
    if(this.config){
      if(this.config.searchFields){
        return this.config.searchFields as string[];
      }
      const table_names = Object.keys(this.config.columns);
      return table_names;
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }
  
  getFields(): (keyof T)[]{
    if(this.config){
      const table_names = Object.keys(this.config.columns)  as  (keyof T)[];
      return table_names;
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }

  hasActions(){
    if(this.config){
      return  this.config.rowActions?.length
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }

  confirm(event: Event, data:T ,rowAction:RowAction<T>) {
    this.confirmMode = 'popup';
    setTimeout(()=>{
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: rowAction.confirmation,
        icon: 'pi pi-exclamation-triangle',
        rejectButtonProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true
        },
        acceptButtonProps: {
          label: 'Confirm'
        },
        accept: async () => {
          if(rowAction.function){
            try{
              await rowAction.function(event,data);
            }catch(e){
              this.crudService.console(e)
              if(rowAction.onError){
                rowAction.onError();
              }else{
                this.crudService.toast({
                  'severity':'error',
                  'summary': 'Failed',
                  'detail': 'Something went wrong.'
                })
              }
            }
          }
        },
        reject: () => {
  
        }
      });
    },100)
  }

  confirmDialog(event:Event, data:T ,rowAction:RowAction<T>){
    this.confirmMode = 'dialog';
    setTimeout(()=>{
        this.confirmationService.confirm({
          target: event.target as EventTarget,
          message: rowAction.confirmation,
          header: 'Confirmation',
          closable: true,
          closeOnEscape: true,
          icon: 'pi pi-exclamation-triangle',
          rejectButtonProps: {
              label: 'Cancel',
              severity: 'secondary',
              outlined: true,
          },
          acceptButtonProps: {
              label: 'Confirm',
          },
          accept:async () => {
            if(rowAction.function){
              try{
                await rowAction.function(event,data);
              }catch(e){
                this.crudService.console(e)
                if(rowAction.onError){
                  rowAction.onError()
                }else{
                  this.crudService.toast(
                    {
                      'severity': 'error',
                      'summary': 'Failed',
                      'detail': 'Something went wrong.'
                    }
                  )
                }
              }
            }
          },
          reject: () => {

          },
      });
    },100)
  }

  async triggerRowAction(event:Event, row:T,rowAction:RowAction<T>){
    try{
      await  rowAction.function!(event,row)
    }catch(e){
      this.crudService.console(e)
      if(rowAction.onError){
        rowAction.onError();
      }else{
        this.crudService.toast({
          'severity':'error',
          'summary': 'Failed',
          'detail': 'Something went wrong.'
        })
      }
    }
  }

  isActiveStep(stepId:T[K]){
    if(this.config){
      return this.config.activeStep == this.config.steps.findIndex(s=>s.id == stepId);
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }
  

  filteredData():T[]{
    if(this.config){
      const steps = this.config.steps;
      return this.config.data.filter(d=>d[this.config.stepField as keyof T] == steps[this.config.activeStep].id);
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }

  nextStep(){
    if(this.config){
      this.config.activeStep++;
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }
  prevStep(){
    if(this.config){
      this.config.activeStep--;
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }

}
