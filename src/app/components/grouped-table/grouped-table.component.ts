import { Component, Input, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
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
import { LottieAnimationComponent } from 'src/app/pages/ui-components/lottie-animation/lottie-animation.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
/**
 * Top action configuration
 * @param icon: A string for icon
 * @param function: A function to trigger when button is pressed
 * @param color: (Optional) An enum representing color
 * @param label: (Optional) A string to display as label
 * @param tooltip: (Optional) A string to display when hovered
 */
interface TopAction<T> {
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
  function?: (event:Event,args:T)=>void
  disabled?:(args:T)=>boolean,
  hidden?:(args:T)=>boolean,
  color?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast',
  label?:string,
  tooltip?:string;
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
interface Tab<T, K extends keyof T>{
  id:T[K],
  label:string,
  actions?: RowAction<T>[]
  tooltip?:string,
  icon?:string,
  function?:(event:Event,id:T[K])=>void
}
/**
 * Contains Data for Grouped Table
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
export interface GroupedTableData<T,G extends keyof T,K extends keyof T>{
  title:string,
  description:string,
  columns: {[K in keyof Partial<T>]:string},
  activeTab:number,
  tabField:K,
  tabs?: [Tab<T, K>, Tab<T, K>] | Tab<T, K>[];
  childrenField: G,
  data: T[],
  formatters?:{[K in keyof Partial<T>]:(value:T[keyof T])=>string},
  topAction?:TopAction<T>,
  actions?: RowAction<T>[],
  searchFields?:(keyof T)[],
  dataLoaded?:boolean,
}


@Component({
  selector: 'grouped-table',
  standalone: true,
  imports: [
    CommonModule,FormsModule,MaterialModule,
    LottieAnimationComponent,ButtonModule,IconFieldModule,InputIcon,InputTextModule,TableModule,ToastModule,FluidModule,TooltipModule,DialogModule,ConfirmPopupModule],
  providers:[MessageService,ConfirmationService],
  templateUrl: './grouped-table.component.html',
  styleUrl: './grouped-table.component.scss'
})
export class GroupedTableComponent<T,G extends keyof T,K extends keyof T> {
  @Input() config:GroupedTableData<T,G,K>;

  searchValue:string='';

  getColumnNames():string[]{
    if(this.config){
      const table_names = Object.values(this.config.columns) as string[];
      return table_names;
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }
  
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

  hasActions(){
    if(this.config){
      if(this.config.tabs){
        const step = this.config.tabs[this.config.activeTab]
        return  step.actions?.length
      }else{
        return  this.config.actions?.length;
      }
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

  isActiveStep(tabId:T[K]){
    if(this.config){
      if(this.config.tabs){
        return this.config.activeTab == this.config.tabs.findIndex(s=>s.id == tabId);
      }else{
        return false;
      }
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }

  filteredData():T[]{
    if(this.config){
      const tabs = this.config.tabs;
      if(tabs){
        return this.config.data.filter(d=>d[this.config.tabField as keyof T] == tabs[this.config.activeTab].id);
      }else{
        return this.config.data;
      }
    }else{
      throw new Error('Progress Table config has not been loaded')
    }
  }
}
