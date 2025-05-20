
import 'reflect-metadata'

function TableName(tableName: string) {
  return function (target: Function) {
    Reflect.defineMetadata('table', tableName, target);
  };
}

@TableName('ObligationRequest')
export class ObligationRequest {
    id?: string;
    serialNo: string = '';
    entityName: string = '';
    date: string = '';
    fundSourceId: string = ''; // Fund Cluster
    requestingOffice: string = '';
    payee: string = '';
    address: string = '';
    responsibilityCenter: string = '';
    items: Array<{
        particulars: string;
        mfoPap: string;
        uacsObjectCode: string;
        amount: number;
    }>;
    supportingDocs: string[] = []; // Changed from boolean to string[]
    status: 'Pending' | 'Approved' | 'Rejected' = 'Pending';
    obligationAmount?: number;
    payableNotYetDue?: number;
    payableDue: number = 0;
    paymentAmount: number = 0;
    balanceObligation?: number;
    balancePayable?: number;
    obligationReferences: { date: string; particulars: string; refNo: string }[] = [];
    requestDate: Date = new Date();
    accountCode: string = '';
    contractId?: string;

    get totalAmount(): number {
        return this.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    }
}

@TableName('Document')
export class Document {
  id: string
  procurement_process_id: string
  entity_id: number
  record_id: string
  file_path: string
  uploaded_by: number
  upload_date: Date
}
