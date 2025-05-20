import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-reject-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="bg-gray-50 rounded-lg">
      <!-- Header -->
      <div class="bg-white px-6 py-4 rounded-t-lg border-b flex justify-between items-center">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Reject Delivery</h2>
          <p class="text-sm text-gray-600">Please provide a reason for rejection</p>
        </div>
        <button mat-icon-button (click)="closeDialog()" class="text-gray-500">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <mat-icon class="text-yellow-400">warning</mat-icon>
            </div>
            <div class="ml-3">
              <p class="text-sm text-yellow-700">
                This action cannot be undone. The supplier will be notified about the rejection.
              </p>
            </div>
          </div>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Rejection Reason</mat-label>
          <textarea matInput 
                    [(ngModel)]="reason" 
                    placeholder="Explain why this delivery is being rejected..."
                    rows="4"
                    class="resize-none"></textarea>
          <mat-hint align="end">{{reason.length}}/500 characters</mat-hint>
        </mat-form-field>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 bg-white rounded-b-lg border-t">
        <div class="flex justify-end gap-3">
          <button mat-button 
                  (click)="closeDialog()"
                  class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            Cancel
          </button>
          <button mat-raised-button 
                  color="warn"
                  [disabled]="!isValid()"
                  (click)="submitRejection()"
                  class="px-4 py-2 rounded-lg">
            Reject Delivery
          </button>
        </div>
      </div>
    </div>
  `
})
export class RejectModalComponent {
  reason = '';
  
  constructor(public dialogRef: MatDialogRef<RejectModalComponent>) {}

  isValid(): boolean {
    return this.reason.trim().length >= 10 && this.reason.length <= 500;
  }

  submitRejection() {
    if (this.isValid()) {
      this.dialogRef.close(this.reason.trim());
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}