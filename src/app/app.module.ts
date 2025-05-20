import { NgModule } from '@angular/core';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextarea } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  imports: [
    ConfirmPopupModule,
    ToastModule,
    DialogModule,
    TableModule,
    ButtonModule,
    InputTextarea,
    TagModule,
    CalendarModule,
    InputTextModule
  ],
})
export class AppModule { } 