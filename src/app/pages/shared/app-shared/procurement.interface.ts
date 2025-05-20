// models/procurement.interface.ts

export interface ProcurementItem {
    id: number;
    code: string;
    program: string;
    endUser: string;
    procurementMode: string;
    advertisementDate: Date;
    submissionDate: Date;
    awardDate: Date;
    signingDate: Date;
    fundSource: string;
    totalBudget: number;
    mooe: number;
    co: number;
    remarks: string;
    category: string;
    subCategory: string;
  }
  
  export interface SignatureInfo {
    name: string;
    position: string;
    role: string;
  }
  
  export interface DocumentMetadata {
    fiscalYear: number;
    quarter: number;
    preparedBy: SignatureInfo;
    approvedBy: SignatureInfo;
    committeeMembers: SignatureInfo[];
    dateApproved: Date;
    fundingSource: string;
  }
  
  export interface ProcurementCategory {
    name: string;
    code: string;
    fund: string;
    items: ProcurementItem[];
  }
  
  export interface TotalCalculations {
    totalBudget: number;
    totalMOOE: number;
    totalCO: number;
  }