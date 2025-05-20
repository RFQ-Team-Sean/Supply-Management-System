import { Component, Input } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { LottieAnimationComponent } from 'src/app/pages/ui-components/lottie-animation/lottie-animation.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { SkeletonModule } from 'primeng/skeleton';
import { MenuModule } from 'primeng/menu';
import { CrudService } from 'src/app/services/crud.service';


interface Tab<T, K extends keyof T> {
  id: T[K],
  label: string,
  tooltip?: string,
  icon?: string,
  function?: (event: Event, id: T[K]) => void
}

interface RowAction<T> {
  icon: string,
  shape: 'rounded' | 'default',
  function?: ((event: Event, args: T) => void)|((event: Event, args: T) => Promise<void>),
  confirmation?: string,
  disabled?: (args: T) => boolean,
  hidden?: (args: T) => boolean,
  color?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast',
  label?: string,
  tooltip?: string,
  onError?:()=>void
}
interface TopAction{
  icon: string,
  function: () => void
  color?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast',
  label?: string,
  tooltip?: string;
}
export interface MultiTableData<T, K extends keyof T | undefined = undefined> {
  title: string,
  type: 'default' | 'sequence',
  description: string,
  columns: { [K in keyof Partial<T>]: string },
  data: T[],
  tabField?: K,
  tabs?: Tab<T, Exclude<K, undefined>>[],
  activeTab?: number,
  dragEvent?: (event: TableRowReorderEvent) => void;
  formatters?: { [K in keyof Partial<T>]: (value: T[keyof T]) => string },
  searchFields?: (keyof T)[],
  topActions?: TopAction[],
  rowActions?: RowAction<T>[],
  rowHighlight?: (row:T)=>string,
  dataLoaded?: boolean
  
}

@Component({
  selector: 'app-multi-table',
  standalone: true,
  imports: [
    MaterialModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    CommonModule,
    ConfirmDialogModule,
    DropdownModule,
    InputSwitchModule,
    TabViewModule,
    LottieAnimationComponent,
    TooltipModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    TabsModule,
    ConfirmPopupModule,
    SkeletonModule,
    MenuModule,
    TableModule,],
  templateUrl: './multi-table.component.html',
  styleUrl: './multi-table.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class MultiTableComponent<T, K extends keyof T | undefined = undefined> {
  @Input() config?: MultiTableData<T, K>;

  confirmMode: 'dialog'|'popup'

  constructor(private confirmationService: ConfirmationService, private crudService:CrudService) { }

  getColumnNames(): string[] {
    if (this.config) {
      const table_names = Object.values(this.config.columns) as string[];
      return table_names;
    } else {
      return []
    }
  }

  getSearchFields(): string[] {
    if (this.config) {
      if (this.config.searchFields) {
        return this.config.searchFields as string[];
      }
      const table_names = Object.keys(this.config.columns);
      return table_names;
    } else {
      return []
    }
  }

  getFields(): (keyof T)[] {
    if (this.config) {
      const table_names = Object.keys(this.config.columns) as (keyof T)[];
      return table_names;
    } else {
      return []
    }
  }
  formatValue(field: keyof T, row: T) {
    if (this.config) {
      if (!this.config.formatters) return row[field];
      if (field in this.config.formatters) {
        return this.config.formatters[field]!(row[field])
      } else {
        return row[field];
      }
    } else {
      throw new Error('Progress Table config has not been loaded')
    }
  }

  hasActions() {
    if (this.config) {
      return this.config.rowActions?.length;
    } else {
      return false;
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
          command: async  (event: MenuItemCommandEvent) => {
            if (action.function) {
              if (action.confirmation) {
                this.confirmDialog(event.originalEvent!, row, action);
              } else {
                try{
                  await action.function(event.originalEvent!, row);
                }catch(e){
                  this.crudService.console(e)
                  if(action.onError){
                    action.onError()
                  }else{
                    this.crudService.toast({
                      'severity':'error',
                      'summary':'Failed',
                      'detail':'Something went wrong.',
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
  

  filteredData(): T[] {
    if (this.config) {
      const tabs = this.config.tabs;
      if (tabs) {
        return this.config.data.filter(d => d[this.config?.tabField as keyof T] == tabs[this.config?.activeTab!].id);
      } else {
        return this.config.data;
      }
    } else {
      return []
    }
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

  onRowOrder(event: TableRowReorderEvent) {
    if (this.config) {
      const rows = this.filteredData();
      const realDragIndex = this.config.data.findIndex(d => d == rows[event.dragIndex!])
      const realDropIndex = this.config.data.findIndex(d => d == rows[event.dropIndex!])
      this.config?.dragEvent!({ dragIndex: realDragIndex, dropIndex: realDropIndex });
    } else {
      throw new Error('Config is not initialized')
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
                  'summary':'Failed',
                  'detail':'Something went wrong.',
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
          accept:async() => {
            if(rowAction.function){
              try{
                await rowAction.function(event,data);
              }catch(e){
                this.crudService.console(e)
                if(rowAction.onError){
                  rowAction.onError()
                }else{
                  this.crudService.toast({
                    'severity':'error',
                    'summary':'Failed',
                    'detail':'Something went wrong.',
                  })
                }
              }
            }
          },
          reject: () => {

          },
      });
    },100)
  }


  changeTab(tab: number) {
    this.config!.activeTab = tab;
  }

}
