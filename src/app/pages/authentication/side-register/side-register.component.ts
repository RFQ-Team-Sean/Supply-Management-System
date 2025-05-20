import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
import { CrudService } from 'src/app/services/crud.service';
import { Users, SupplierDetails } from 'src/app/schema/schema';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [
    RouterModule, 
    MaterialModule, 
    FormsModule, 
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [MessageService],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  hidePassword = true;
  isSupplier = false;
  currentStep = 1;
  isSubmitting = false;
  
  constructor(
    private router: Router,
    private crudService: CrudService,
    private messageService: MessageService
  ) {}

  // Regular user form
  userForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  // Supplier form
  supplierForm = new FormGroup({
    companyName: new FormControl('', [Validators.required]),
    tinNumber: new FormControl('', [Validators.required]),
    secNumber: new FormControl(''),
    dtiNumber: new FormControl(''),
    mayorsPermit: new FormControl('', [Validators.required]),
    address: new FormControl('', [Validators.required]),
    contactPerson: new FormControl('', [Validators.required]),
    contactNumber: new FormControl('', [
      Validators.required,
      Validators.pattern('^[0-9]{11}$')
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  toggleSupplier() {
    this.isSupplier = !this.isSupplier;
  }

  async submit() {
    if (this.isSubmitting) return;

    try {
      this.isSubmitting = true;

      if (this.isSupplier && this.supplierForm.valid) {
        const formValue = this.supplierForm.value;

        // Create user account first with proper typing
        const userData: Omit<Users, 'id'> = {
          fullname: formValue.contactPerson ?? '',
          username: formValue.email ?? '',
          password: formValue.password ?? '',
          user_type: 'User',
          role: 'supplier',
          profile: '',
          officeId: '',
          position: '',
          isAdmin: false
        };

        // Create user
        const createdUser = await this.crudService.create(Users, userData);

        if (createdUser && createdUser.id) {
          // Create supplier details with proper typing
          const supplierData: Omit<SupplierDetails, 'id'> = {
            User_id: createdUser.id,
            contact_person: formValue.contactPerson ?? '',
            contact_number: formValue.contactNumber ?? '',
            email: formValue.email ?? '',
            address: formValue.address ?? '',
            tin_number: formValue.tinNumber ?? '',
            sec_number: formValue.secNumber ?? '',
            dti_number: formValue.dtiNumber ?? '',
            mayors_permit: formValue.mayorsPermit ?? '',
            name: formValue.companyName ?? ''
          };

          await this.crudService.create(SupplierDetails, supplierData);

          // Show success message with more details
          this.messageService.add({
            severity: 'success',
            summary: 'Registration Successful',
            detail: `Welcome ${formValue.companyName}! Your supplier account has been created successfully.`,
            life: 5000 // Show for 5 seconds
          });

          // Add another notification about redirection
          setTimeout(() => {
            this.messageService.add({
              severity: 'info',
              summary: 'Redirecting',
              detail: 'You will be redirected to the login page shortly.',
              life: 3000
            });
          }, 1000);

          // Redirect after messages
          setTimeout(() => {
            this.router.navigate(['/authentication/login']);
          }, 3000);
        }
      } else if (!this.isSupplier && this.userForm.valid) {
        const formValue = this.userForm.value;
        
        // Create regular user with proper typing
        const userData: Omit<Users, 'id'> = {
          fullname: formValue.name ?? '',
          username: formValue.email ?? '',
          password: formValue.password ?? '',
          user_type: 'User',
          role: 'enduser',
          profile: '',
          officeId: '',
          position: '',
          isAdmin: false
        };

        await this.crudService.create(Users, userData);

        // Show success message with more details
        this.messageService.add({
          severity: 'success',
          summary: 'Registration Successful',
          detail: `Welcome ${formValue.name}! Your account has been created successfully.`,
          life: 5000
        });

        // Add notification about redirection
        setTimeout(() => {
          this.messageService.add({
            severity: 'info',
            summary: 'Redirecting',
            detail: 'You will be redirected to the login page shortly.',
            life: 3000
          });
        }, 1000);

        // Redirect after messages
        setTimeout(() => {
          this.router.navigate(['/authentication/login']);
        }, 3000);
      }
    } catch (error: any) {
      // Show detailed error message
      this.messageService.add({
        severity: 'error',
        summary: 'Registration Failed',
        detail: error.message || 'There was a problem creating your account. Please try again.',
        life: 5000
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  nextStep() {
    if (this.isValidCompanyInfo()) {
      this.currentStep = 2;
    }
  }

  previousStep() {
    this.currentStep = 1;
  }

  private isValidCompanyInfo(): boolean {
    const controls = ['companyName', 'tinNumber', 'mayorsPermit', 'address'];
    return controls.every(control => 
      this.supplierForm.get(control)?.valid
    );
  }
}

