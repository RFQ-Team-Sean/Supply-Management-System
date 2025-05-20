import { RPCPPE } from './schema';
import { IIRUP } from './schema';
import { PTR } from './schema';
import { PAR } from './schema';
import { RLSDDP } from './schema';
import { ICS } from './schema';
import { IAR } from './schema';
import { RPCI } from './schema';

export const RPCPPEData: RPCPPE[] = [
    {
        id: 'RPCPPE-2024-001',
        rpcppeNo: 'RPCPPE-2024-001',
        entityName: 'Department of Science and Technology',
        fundCluster: '101',
        accountableOfficer: 'John Doe',
        designation: 'IT Manager',
        accountabilityDate: new Date('2024-01-01'),
        date: new Date(),
        items: [
            {
                id: 'ITEM-001',
                rpcppeId: 'RPCPPE-2024-001',
                article: 'Desktop Computer',
                description: 'Intel i7, 16GB RAM',
                propertyNo: 'PC-2024-001',
                quantity: 1,
                unitValue: 45000,
                totalValue: 45000,
                shortageQty: 0,
                shortageValue: 0,
                remarks: 'Good condition'
            },
            {
                id: 'ITEM-002',
                rpcppeId: 'RPCPPE-2024-001',
                article: 'Office Chair',
                description: 'Ergonomic Mesh Chair',
                propertyNo: 'FUR-2024-001',
                quantity: 2,
                unitValue: 5000,
                totalValue: 10000,
                shortageQty: 1,
                shortageValue: 5000,
                remarks: 'Extra unit found'
            }
        ],
        totalValue: 55000,
        remarks: 'Initial count for 2024',
        status: 'draft'
    }
];

export const IIRUPData: IIRUP[] = [
    {
        id: 'IIRUP-2024-001',
        iirupNo: 'IIRUP-2024-001',
        entityName: 'Department of Science and Technology',
        fundCluster: '101',
        department: 'IT Department',
        accountableOfficer: 'John Smith',
        designation: 'IT Manager',
        date: new Date(),
        items: [
            {
                id: 'ITEM-001',
                iirupId: 'IIRUP-2024-001',
                dateAcquired: new Date('2023-01-15'),
                article: 'Desktop Computer',
                propertyNo: 'PC-2023-001',
                quantity: 1,
                unitCost: 45000,
                totalCost: 45000,
                remarks: 'Beyond repair',
                disposalType: 'Sale',
                appraisedValue: 5000,
                salesAmount: 4500
            },
            {
                id: 'ITEM-002',
                iirupId: 'IIRUP-2024-001',
                dateAcquired: new Date('2023-02-20'),
                article: 'Office Chair',
                propertyNo: 'FUR-2023-005',
                quantity: 2,
                unitCost: 2500,
                totalCost: 5000,
                remarks: 'Broken',
                disposalType: 'Transfer',
                appraisedValue: 500,
                salesAmount: 0
            }
        ],
        totalValue: 50000,
        disposalType: 'Sale',
        remarks: 'Items for immediate disposal',
        status: 'draft'
    }
];

export const PTRData: PTR[] = [
    {
        id: 'PTR-2024-001',
        ptrNo: 'PTR-2024-001',
        entityName: 'Department of Science and Technology',
        fundCluster: '101',
        fromOfficer: 'John Smith',
        fromDepartment: 'College of Information Technology',
        fromFundCluster: '101',
        toOfficer: 'Jane Doe',
        toDepartment: 'College of Engineering',
        toFundCluster: '101',
        date: new Date(),
        transferType: 'Relocate',
        items: [
            {
                id: 'ITEM-001',
                ptrId: 'PTR-2024-001',
                dateAcquired: new Date('2024-01-15'),
                propertyNo: 'PC-2024-001',
                description: 'Desktop Computer - Intel i7, 16GB RAM, 512GB SSD',
                amount: 45000,
                condition: 'Good'
            },
            {
                id: 'ITEM-002',
                ptrId: 'PTR-2024-001',
                dateAcquired: new Date('2024-01-20'),
                propertyNo: 'FUR-2024-001',
                description: 'Executive Office Chair - Ergonomic Design',
                amount: 8500,
                condition: 'Excellent'
            }
        ],
        totalValue: 53500,
        transferReason: 'Departmental restructuring',
        remarks: 'Equipment transfer for new HR tech setup',
        status: 'draft'
    }
];

export const PARData: PAR[] = [
    {
        id: 'PAR-2024-001',
        parNo: 'PAR-2024-001',
        entityName: 'Department of Science and Technology',
        fundCluster: '101',
        receivedBy: 'John Smith',
        receivedFrom: 'Jane Doe',
        date: new Date(),
        items: [
            {
                id: 'ITEM-001',
                parId: 'PAR-2024-001',
                propertyNo: 'PC-2024-001',
                description: 'Desktop Computer - Intel i7, 16GB RAM',
                quantity: 1,
                unit: 'unit'
            },
            {
                id: 'ITEM-002',
                parId: 'PAR-2024-001',
                propertyNo: 'FUR-2024-001',
                description: 'Executive Office Chair',
                quantity: 2,
                unit: 'pcs'
            }
        ],
        status: 'draft'
    }
];

export const RLSDDPData: RLSDDP[] = [
    {
        id: 'RLSDDP-2024-001',
        rlsddpNo: 'RLSDDP-2024-001',
        entityName: 'Department of Science and Technology',
        fundCluster: '101',
        department: 'IT Department',
        accountableOfficer: 'John Smith',
        designation: 'IT Manager',
        date: new Date(),
        parNo: 'PAR-2024-001',
        policeNotified: true,
        policeStation: 'Central Police Station',
        policeNotificationDate: new Date('2024-02-15'),
        propertyStatus: 'Damaged',
        items: [
            {
                id: 'ITEM-001',
                rlsddpId: 'RLSDDP-2024-001',
                propertyNo: 'PC-2023-015',
                description: 'Laptop Computer - Damaged by water spillage',
                dateAcquired: new Date('2023-06-15'),
                acquisitionCost: 65000,
                propertyStatus: 'Damaged',
                remarks: 'Beyond economical repair'
            },
            {
                id: 'ITEM-002',
                rlsddpId: 'RLSDDP-2024-001',
                propertyNo: 'PR-2023-008',
                description: 'Network Printer - Lost during office relocation',
                dateAcquired: new Date('2023-03-20'),
                acquisitionCost: 35000,
                propertyStatus: 'Lost',
                remarks: 'Investigation ongoing'
            }
        ],
        circumstances: 'Items were damaged during the recent office renovation.',
        totalValue: 100000,
        govtIdNo: 'ID-12345',
        govtIdDateIssued: new Date('2023-01-01'),
        status: 'draft'
    }
];

export const ICSData: ICS[] = [
    {
        ics_no: 'ICS-2024-001',
        entity_name: 'Department of Science and Technology',
        fund_cluster: 'FC-2024-001',
        date: new Date('2024-01-15'),
        inventory_item_no: 'INV-2024-001',
        quantity: 2,
        unit: 'pcs',
        unit_cost: 15000,
        description: 'Desktop Monitor - 27" 4K Display',
        estimated_useful_life: '5 years',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-15')
    },
    {
        ics_no: 'ICS-2024-002',
        entity_name: 'Department of Education',
        fund_cluster: 'FC-2024-002',
        date: new Date('2024-02-01'),
        inventory_item_no: 'INV-2024-002',
        quantity: 5,
        unit: 'units',
        unit_cost: 2500,
        description: 'Office Chair - Ergonomic Mesh Design',
        estimated_useful_life: '3 years',
        created_at: new Date('2024-02-01'),
        updated_at: new Date('2024-02-01')
    }
];

export const IARData: IAR[] = [
    {
        id: 'IAR-2024-001',
        iar_no: 'IAR-2024-001',
        po_no: 'PO-2024-001',
        supplier: 'Tech Solutions Inc.',
        date: new Date('2024-01-15'),
        invoice_no: 'INV-2024-001',
        total_amount: 75000,
        status: 'Completed',
        remarks: 'All items received in good condition',
        created_at: new Date('2024-01-15')
    },
    {
        id: 'IAR-2024-002',
        iar_no: 'IAR-2024-002',
        po_no: 'PO-2024-002',
        supplier: 'Office Essentials Co.',
        date: new Date('2024-02-01'),
        invoice_no: 'INV-2024-015',
        total_amount: 25000,
        status: 'Pending Inspection',
        remarks: 'Partial delivery received',
        created_at: new Date('2024-02-01')
    }
]; 

export const RPCIData: RPCI[] = [
    {
        id: 'RPCI-2024-001',
        rpci_no: 'RPCI-2024-001',
        fund_cluster: '101',
        date: new Date('2024-01-15'),
        department: 'Information Technology Department',
        accountable_officer: 'John Smith',
        total_value: 500000,
        status: 'Completed',
        remarks: 'Annual inventory count completed',
        created_at: new Date('2024-01-15')
    },
    {
        id: 'RPCI-2024-002',
        rpci_no: 'RPCI-2024-002',
        fund_cluster: '102',
        date: new Date('2024-02-01'),
        department: 'Human Resources Department',
        accountable_officer: 'Jane Doe',
        total_value: 250000,
        status: 'In Progress',
        remarks: 'Mid-year inventory count',
        created_at: new Date('2024-02-01')
    }
];