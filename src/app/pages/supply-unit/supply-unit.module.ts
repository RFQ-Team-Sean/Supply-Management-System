import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { ToastModule } from 'primeng/toast';

// Routes
import { SupplyUnitRoutes } from './supply-unit.routes';

// Components
import { UploadDeliveryReceiptComponent } from './upload-delivery-receipt/upload-delivery-receipt.component';
import { StockingComponent } from './stocking/stocking.component';
import { RsmiComponent } from './rsmi/rsmi.component';
import { IcsComponent } from './ics/ics.component';
import { ParComponent } from './par/par.component';
import { SupplyDashboardComponent } from './supply-dashboard/supply-dashboard.component';
import { DeliveryComponent } from './delivery/delivery.component';
import { PriceQuotationComponent } from '../shared/price-quotation/price-quotation.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { IarComponent } from './iar/iar.component';
import { RpciComponent } from './rpci/rpci.component';
import { RPCPPEComponent } from './rpcppe/rpcppe.component';
import { IIRUPComponent } from './iirup/iirup.component';
import { RLSDDPComponent } from './rlsddp/rlsddp.component';
import { PTRComponent } from './ptr/ptr.component';
import { ReturnsComponent } from './returns/returns.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(SupplyUnitRoutes),
        FormsModule,
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        TableModule,
        DialogModule,
        InputTextModule,
        DropdownModule,
        MessageModule,
        MessagesModule,
        ToastModule,
        // Import standalone components
        UploadDeliveryReceiptComponent,
        StockingComponent,
        RsmiComponent,
        IcsComponent,
        ParComponent,
        SupplyDashboardComponent,
        DeliveryComponent,
        PriceQuotationComponent,
        SuppliersComponent,
        IarComponent,
        RpciComponent,
        RPCPPEComponent,
        IIRUPComponent,
        RLSDDPComponent,
        PTRComponent,
        ReturnsComponent
    ]
})
export class SupplyUnitModule { } 