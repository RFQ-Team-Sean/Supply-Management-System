import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule,ValidatorFn } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { StyleClassModule } from 'primeng/styleclass';
import { TextareaModule } from 'primeng/textarea';
import { CrudService } from 'src/app/services/crud.service';

interface Validation {
  validator: ValidatorFn,
  name: 'required' | 'min'| 'max'| 'maxLength',
  message:string
}

interface FieldOption {
  value:string;
  label:string;
}

interface ButtonDecoration {
  label:string;
  icon:string;
}

interface FormField <T> {
  id: keyof T;
  label:string;
  placeholder:string;
  validators:Validation[],
  type: 'input'| 'date'| 'currency'| 'number' | 'otp' | 'file' | 'select' | 'textarea'
  disabled?:boolean;
  readonly?:boolean;
  options?: FieldOption[],
}

export interface DynamicFormData <T> {
  title:string;
  description:string;
  data: T;
  formfields: FormField<T>[],
  submit:((value:T) => Promise<void>) | ((value:T) => void);
  columns?: number,
  show?:boolean;
  rows?:number[];
  rebuild?: ()=>void;
  view?:boolean;
  onError?:()=>void;
  cancelDecoration?:ButtonDecoration;
  submitDecoration?:ButtonDecoration;
}

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    InputMaskModule,
    FileUploadModule,
    ButtonModule,
    SelectModule,
    TooltipModule,
    StyleClassModule,
    TextareaModule
  ],
  providers:[],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent<T> implements OnInit {
  @Input() config: DynamicFormData<T>;
  form: FormGroup;
  constructor(private crudService:CrudService){}
  ngOnInit(){
    if(this.config.rebuild){
      this.config.rebuild();
    }
    this.rebuildForm();
  }

  rebuildForm() {
    // Clear the current form controls
    this.form = new FormGroup({});
    
    // Rebuild the form controls based on the current config data
    this.config.formfields.forEach(field => {
        if (this.config.data[field.id]) {
            if (field.type === 'select') {
                const selected = field.options?.find(s => s.value === this.config.data[field.id]);
                const control = new FormControl(selected!, [...field.validators.map(v => v.validator)]);
                this.form.addControl(field.id.toString(), control);
                
                // Enable or disable based on the options
                if (!field.disabled) {
                  if (field.options?.length) {
                      this.form.controls[field.id.toString()].enable();
                  } else {
                      this.form.controls[field.id.toString()].disable();
                  }
                }else{
                  this.form.controls[field.id.toString()].disable();
                }
            } else {
                const control = new FormControl(this.config.data[field.id], [...field.validators.map(v => v.validator)]);
                this.form.addControl(field.id.toString(), control);
                if (field.disabled) {
                  this.form.controls[field.id.toString()].disable();
                }else{
                  this.form.controls[field.id.toString()].enable();
                }
            }
        } else {
            const control = new FormControl('', [...field.validators.map(v => v.validator)]);
            this.form.addControl(field.id.toString(), control);

            // For select fields, check if they need to be disabled

            if (field.disabled) {
                this.form.controls[field.id.toString()].disable();
            } else {
              if (field.type === 'select') {
                if (field.options?.length) {
                    this.form.controls[field.id.toString()].enable();
                } else {
                    this.form.controls[field.id.toString()].disable();
                }
              }
            }
        }
        
       
    });
  }

  isFormValid(): boolean {
    let isValid = true;

    // Loop through all controls in the FormGroup
    for (const controlName in this.form.controls) {
      if (this.form.controls.hasOwnProperty(controlName)) {
        const control = this.form.get(controlName);

        // Check if control exists and evaluate its validity
        if (control) {
          // For disabled controls, we need to check their value and validators manually
          const value = control.value; // Works even if disabled
          const hasErrors = control.errors; // Validators still apply to disabled controls

          // If the control has validators and no value, mark as invalid
          if (hasErrors || !value) {
            isValid = false;
          }
        }
      }
    }

    return isValid;
  }

  onClose(){
    this.config.view = false;
  }

  onSelect(event:SelectChangeEvent, field:FormField<T>){
    this.config.data[field.id] = event.value.value;
    if(this.config.rebuild){
      this.config.rebuild();
    }
    this.rebuildForm();
    
  }

  isRequired(field:FormField<T>){
    return field.validators?.some(validator => validator.validator.name === 'required')
  }
  
  async onSubmit(){
    if(this.form.invalid){
      Object.keys(this.form.controls).forEach(controlName => {
        this.form.controls[controlName].markAsTouched();
      });
      this.crudService.toast({ severity: 'error', summary: 'Form is invalid!', detail: `Please check your form is its valid.` });
      return;
    }
    this.config.show = false;
    try{
      const value = this.form.value;
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          const field = value[key];
          if (field && typeof field === 'object' && 'value' in field && 'label' in field) {
            value[key] = field.value;
          }
        }
      }
      await this.config.submit(
        {
          ...this.config.data,
          ...value
        }
      );
    }catch(e){
      this.crudService.console(e)
      if(this.config.onError){
        this.config.onError();
      }else{
        this.crudService.toast({
          'severity': 'error',
          'summary': 'Failed',
          'detail': 'Something went wrong.'
        })
      }
    }
    
  }

  getStartIndex(rowIndex: number): number {
    return this.config.rows!.slice(0, rowIndex).reduce((sum, count) => sum + count, 0);
  }

  getFieldsForRow(rowIndex: number, rowCount: number): any[] {
    const start = this.getStartIndex(rowIndex);
    const end = Math.min(start + rowCount, this.config.formfields.length);
    return this.config.formfields.slice(start, end);
  }

}
