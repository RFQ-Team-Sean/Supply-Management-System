import { ProgressBarModule } from 'primeng/progressbar';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

@NgModule({ 
  imports: [  
    // ... existing imports
    ProgressBarModule,
    ReactiveFormsModule
  ],
  // ... rest of the module definition
})
export class StockTransferModule { } 