import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { MatButtonModule } from '@angular/material/button';

import { IftaLabelModule } from 'primeng/iftalabel';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { LottieAnimationComponent } from '../../ui-components/lottie-animation/lottie-animation.component';
import { MessageService } from 'primeng/api';
import { UserService } from 'src/app/services/user.service';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    IftaLabelModule,
    PasswordModule,
    InputTextModule,
    FluidModule,
    CommonModule,
    LottieAnimationComponent,
    ToastModule,
    TooltipModule,
    DialogModule,
    InputOtpModule,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  constructor(private router: Router,
    private userService: UserService,
    private messageService: MessageService) { }


  form = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  get f() {
    return this.form.controls;
  }

  display: boolean = false;  // To control modal visibility
  otp: string = '';  // To bind the OTP input value

  showDialog() {
    this.display = true;
  }

  onSubmit() {
    console.log("Entered OTP: ", this.otp);
    // Add logic to verify OTP here
    this.display = false;
  }

  async submit() {
    // console.log(this.form.value);
    if (this.form.valid) {
      try {
        this.messageService.add({ severity: 'secondary', summary: 'Loading...', sticky: true, closable: false });
        await this.userService.login(this.form.get('username')?.value!, this.form.get('password')?.value!);
        this.messageService.clear()
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Redirecting, please wait...', closable: false });
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1300)
      } catch (e: any) {
        this.messageService.clear()
        this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: e.message });
      }


    } else {
      this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: 'Please make sure username and password is valid.' });
    }
  }
}
