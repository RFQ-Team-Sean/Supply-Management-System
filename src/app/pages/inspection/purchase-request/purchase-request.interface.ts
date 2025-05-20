//purchase-request.interface
export interface Signatory {
    name: string;
    designation: string;
}

export interface PurchaseRequestItem {
    unit: string;
    description: string;
    qty: number;
    unitCost: number;
    totalCost: number;
    itemNo: string; 
}

export interface PurchaseRequest {  
    coaInfo?: {
        annexNo: string;
        circularNo: string;
    };
    id: string;
    prNo: string;
    saiNo?: string;
    alobsNo?: string;
    date: Date;
    saiDate?: Date | null;  
    alobsDate?: Date | null;  
    requisitioningOffice: string;
    items: PurchaseRequestItem[];
    totalAmount: number;
    purpose: string;
    status: PurchaseRequestStatus;
    requestedBy: Signatory;
    recommendedBy: Signatory;
    approvedBy: Signatory;
    certification?: Signatory;
    ppmpId?: string;
    appId?: string;
}
// Add this just above your PurchaseRequest interface
// export interface PurchaseRequestBase {
//     id: string;
//     prNo: string;
//     saiNo?: string;
//     alobsNo?: string;
//     date: Date;
//     saiDate?: Date | null;
//     alobsDate?: Date | null;
//     requisitioningOffice: string;
//     items: PurchaseRequestItem[];
//     totalAmount: number;
//     purpose: string;
//     status: PurchaseRequestStatus;
//     requestedBy: Signatory;
//     recommendedBy: Signatory;
//     approvedBy: Signatory;
//     certification?: Signatory;
//     ppmpId?: string;
//     appId?: string;
// }

// And then modify your PurchaseRequest interface
// export interface PurchaseRequest extends PurchaseRequest {
//     coaInfo?: {
//         annexNo: string;
//         circularNo: string;
//     };
// }

export enum PurchaseRequestStatus {
    Pending = 'pending',
    Approved = 'approved',
    Rejected = 'rejected'
}