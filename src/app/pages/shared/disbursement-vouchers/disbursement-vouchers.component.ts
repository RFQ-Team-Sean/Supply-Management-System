import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DeliveryReceiptService } from 'src/app/services/delivery-receipt.service';
import { DisbursementVoucher, DisbursementVoucherService } from 'src/app/services/disbursement-voucher.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { PdfGeneratorService } from 'src/app/services/pdf-generator.service';
import { ProgressTableComponent, ProgressTableData } from 'src/app/components/progress-table/progress-table.component';

@Component({
  selector: 'app-disbursement-vouchers',
  standalone: true,
  imports:  [ConfirmPopupModule, ProgressTableComponent, CommonModule,ToastModule,DialogModule],
  providers:[MessageService, ConfirmationService,CurrencyPipe],
  
  templateUrl: './disbursement-vouchers.component.html',
  styleUrl: './disbursement-vouchers.component.scss'
})
export class DisbursementVouchersComponent {
    disbursementVouchers:DisbursementVoucher[]=[];
    showDisbursementModal:boolean = false;
  
    constructor(
      private router:Router,
      private confirmationService:ConfirmationService,
      private currencyPipe:CurrencyPipe,
      private messageService:MessageService,
      private pdfService:PdfGeneratorService,
      private deliveryReceiptService:DeliveryReceiptService,
      private disbursementVoucherService:DisbursementVoucherService){}
  
    ngOnInit(): void {
      this.fetchItems();
    }

    async confirmToAccounting(event: Event,voucher:DisbursementVoucher):Promise<void>{
      try{
        this.confirmationService.confirm({
          target: event.target as EventTarget,
          message: 'Are you sure you want to submit this voucher to accounting?',
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
              this.disbursementVoucherService.sendToAccounting(voucher.voucherNo);
              this.messageService.add({ severity: 'success', summary: 'Success', detail: `Successfully submitted voucher to accounting.` });
              await this.fetchItems();
          },
          reject: () => {
              
          }
        });
      }catch(e:any){
        alert(e.message)
      }
    }

    printVoucher(voucher:DisbursementVoucher):void{
      try{
        const blob = this.pdfService.generateDisbursementVoucher(voucher);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `disbursement-voucher-${voucher.voucherNo}.pdf`;
        link.click();
      }catch(e:any){
        alert(e.message)
      }
    }
  
  
    progressTable: ProgressTableData<DisbursementVoucher,'status'> = {
      title: 'Disbursement Vouchers',
      description: 'Track disbursement vouchers in this section.',
      columns: {
        voucherNo:'Voucher Number',
        deliveryReceiptNo: 'DR Number',
        supplierName: 'Supplier Name',
        totalAmountDue: 'Total Ammount'
      },
      formatters:{
        totalAmountDue: (value)=>this.currencyPipe.transform(value?.toString(), 'PHP', 'symbol', '1.2-2') ?? ''
      },
      activeStep:0,
      stepField:'status',
      steps: [
       {
        id:'pending',
        label:'Pending',
        icon:'pi pi-inbox',
       },
       {
        id:'processing',
        label:'Processing',
        icon:'pi pi-spinner-dotted pi-spin',
        
       },
       {
        id:'recorded',
        label:'Recorded',
        icon:'pi pi-verified',
       },
      ],
      data:[],
      rowActions: [
        // Pending
        {
          hidden: (voucher: DisbursementVoucher)=> voucher.status !='pending',
          icon:'pi pi-print',
          shape:'rounded',
          function: (event:Event, voucher:DisbursementVoucher)=>this.printVoucher(voucher)
        },
        {
          hidden: (voucher: DisbursementVoucher)=> voucher.status !='pending',
          icon:'pi pi-arrow-right',
          shape:'rounded',
          confirmation: 'Are you sure you want to confirm this to accounting?',
          function:  (event:Event, voucher:DisbursementVoucher)=>this.confirmToAccounting(event,voucher)
        },
        // Processing
        {
          hidden: (voucher: DisbursementVoucher)=> voucher.status !='processing',
          icon:'pi pi-spinner',
          shape:'rounded'
        }
      ]
    }

    async fetchItems(){
      const receiptWithItems = await this.deliveryReceiptService.getAllDRItems();
      this.disbursementVouchers = await this.disbursementVoucherService.generateDisbursementVouchers(receiptWithItems);
      this.progressTable.data = this.disbursementVouchers;
      this.progressTable.dataLoaded = true;
    }
}
