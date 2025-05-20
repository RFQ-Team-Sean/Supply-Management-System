import { PPMP, PPMPItem, PPMPProject, PPMPSchedule, ProcurementMode, ProcurementProcess, 
  Users, Department, Building, Office, Entity, Approver, ConferenceEvent, Invitation, 
  PurchaseRequest, FundSource, Budget, UserBudget, VendorInfo, Document, APP, 
  PaymentTerm, ObligationRequest, Contract, SupplierDetails } from "./schema";


export const APPData: APP[] = [
  {
    id: 'APP-2025-001',
    fund_source: 'FS-2025-001', // General Appropriations Act (GAA)
    prepared_by: '3', // Alice Johnson
    approvals_id: 'APR-2025-003', // Budget Approver
    fiscal_year: 2025,
    date_prepared: new Date('2024-10-15'),
    date_approved: new Date('2024-11-01'),
    total_quantity_required: 15,
    total_estimated_cost: 10000000,
  },
  {
    id: 'APP-2025-002',
    fund_source: 'FS-2025-002', // Special Purpose Funds (SPF)
    prepared_by: '2', // Jane Smith (SuperAdmin)
    approvals_id: 'APR-2025-002', // BAC Approver
    fiscal_year: 2025,
    date_prepared: new Date('2024-09-20'),
    date_approved: new Date('2024-10-05'),
    total_quantity_required: 8,
    total_estimated_cost: 5000000,
  },
  {
    id: 'APP-2025-003',
    fund_source: 'FS-2025-003', // Local Government Support Fund (LGSF)
    prepared_by: '1', // John Doe (Accounting)
    approvals_id: 'APR-2025-001', // Department Head Approver
    fiscal_year: 2025,
    date_prepared: new Date('2024-10-05'),
    date_approved: new Date('2024-13-05'), // Not yet approved
    total_quantity_required: 20,
    total_estimated_cost: 15000000,
  },
  {
    id: 'APP-2025-004',
    fund_source: 'FS-2025-001', // General Appropriations Act (GAA)
    prepared_by: '4', // Bob Brown (BAC User)
    approvals_id: 'APR-2025-002', // BAC Approver
    fiscal_year: 2025,
    date_prepared: new Date('2024-10-25'),
    date_approved: new Date('2024-11-15'),
    total_quantity_required: 5,
    total_estimated_cost: 374200,
  },
];
// PPMP Items
export const PPMPItemData: PPMPItem[] = [
    {
      id: 'ITEM-2025-001',
      ppmp_project_id: 'PROJ-2025-006',
      technical_specification: 'Enterprise-grade network switches and routers',
      quantity_required: 10,
      unit_of_measurement: 'sets',
      estimated_unit_cost: 200000,
      estimated_total_cost: 2000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-002',
      ppmp_project_id: 'PROJ-2025-002',
      technical_specification: 'Complete renovation package including furniture and fixtures',
      quantity_required: 1,
      unit_of_measurement: 'lot',
      estimated_unit_cost: 500000,
      estimated_total_cost: 500000,
      classification: 'infrastructure',
    },
    {
      id: 'ITEM-2025-005',
      ppmp_project_id: 'PROJ-2025-004',
      technical_specification: 'Smart Interactive Boards with AI Integration',
      quantity_required: 15,
      unit_of_measurement: 'units',
      estimated_unit_cost: 50000,
      estimated_total_cost: 750000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-006',
      ppmp_project_id: 'PROJ-2025-004',
      technical_specification: 'Campus-wide High-Speed Networking Upgrade',
      quantity_required: 1,
      unit_of_measurement: 'lot',
      estimated_unit_cost: 1500000,
      estimated_total_cost: 1500000,
      classification: 'infrastructure',
    },
    {
      id: 'ITEM-2025-007',
      ppmp_project_id: 'PROJ-2025-004',
      technical_specification: 'Consulting Services for AI-driven Student Monitoring',
      quantity_required: 1,
      unit_of_measurement: 'service',
      estimated_unit_cost: 750000,
      estimated_total_cost: 750000,
      classification: 'consulting',
    },
    {
      id: 'ITEM-2025-008',
      ppmp_project_id: 'PROJ-2025-005',
      technical_specification: 'MRI Machines - High Precision',
      quantity_required: 3,
      unit_of_measurement: 'units',
      estimated_unit_cost: 1200000,
      estimated_total_cost: 3600000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-009',
      ppmp_project_id: 'PROJ-2025-005',
      technical_specification: 'Renovation of Patient Wards',
      quantity_required: 1,
      unit_of_measurement: 'lot',
      estimated_unit_cost: 1400000,
      estimated_total_cost: 1400000,
      classification: 'infrastructure',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-003',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'E-book Licenses for Academic Use',
      quantity_required: 500,
      unit_of_measurement: 'licenses',
      estimated_unit_cost: 2000,
      estimated_total_cost: 1000000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-004',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: 'Consultancy for AI-powered Library Recommendations',
      quantity_required: 1,
      unit_of_measurement: 'service',
      estimated_unit_cost: 1000000,
      estimated_total_cost: 1000000,
      classification: 'consulting',
    },
    {
      id: 'ITEM-2025-005',
      ppmp_project_id: 'PROJ-2025-001',
      technical_specification: ' for AI-powered Library Recommendations',
      quantity_required: 1,
      unit_of_measurement: 'service',
      estimated_unit_cost: 1000000,
      estimated_total_cost: 1000000,
      classification: 'consulting',
    },
    {
      id: 'ITEM-2025-010',
      ppmp_project_id: 'PROJ-2025-007',
      technical_specification: 'AI-powered Traffic Cameras',
      quantity_required: 50,
      unit_of_measurement: 'units',
      estimated_unit_cost: 50000,
      estimated_total_cost: 2500000,
      classification: 'goods',
    },
    {
      id: 'ITEM-2025-011',
      ppmp_project_id: 'PROJ-2025-007',
      technical_specification: 'Smart Traffic Intersections Upgrade',
      quantity_required: 5,
      unit_of_measurement: 'lots',
      estimated_unit_cost: 500000,
      estimated_total_cost: 2500000,
      classification: 'infrastructure',
    },
];
    

export const PPMPData: PPMP[] = [
  {
    id: 'PPMP-2025-001',
    fiscal_year: 2025,
    status: 'DRAFT',
    head_signature: undefined,  // Changed from null to undefined
    user_signature: undefined,  // Changed from null to undefined
    prepared_by_id: '3',  // Alice Johnson (from UsersData)
    office_id: '550e8400e29b41d4a716446655440015',  // Faculty's Office - CBA (from OfficeData)
    approved_by_id: undefined,  // Changed from null to undefined
    date_submitted: undefined,  // Changed from null to undefined
    date_approved: undefined,  // Changed from null to undefined
    remarks: 'IT and Research-related projects for 2025',
    PPMPProjects: [],  // Empty array; will be populated via ppmp_id in PPMPProjectData
    Office: undefined,
    PreparedBy: undefined,
    ApprovedBy: undefined,
  },
  {
    id: 'PPMP-2025-002',
    fiscal_year: 2025,
    status: 'PENDING',
    head_signature: 'head_signature_base64_example',  // Example signature (already a string, no change needed)
    user_signature: 'user_signature_base64_example',  // Example signature (already a string, no change needed)
    prepared_by_id: '6',  // Diana Green (from UsersData)
    office_id: '550e8400e29b41d4a716446655440015',  // Faculty's Office - CBA (from OfficeData)
    approved_by_id: '1',  // John Doe (from UsersData)
    date_submitted: new Date('2025-01-15'),
    date_approved: undefined,  // Changed from null to undefined
    remarks: 'Infrastructure and facility improvement projects for 2025',
    PPMPProjects: [],
    Office: undefined,
    PreparedBy: undefined,
    ApprovedBy: undefined,
  },
];

export const PPMPProjectData: PPMPProject[] = [
  {
    id: 'PROJ-2025-001',
    ppmp_id: 'PPMP-2025-001',  // Links to first PPMP
    procurement_mode_id: 'limited_source_bidding',  // From ProcurementModeData
    project_title: 'IT Infrastructure Upgrade 2025',
    project_code: 'IT-2025-001',
    classifications: ['goods'],
    project_description: 'Upgrade of campus-wide IT network infrastructure',
    contract_scope: 'Procurement and installation of enterprise-grade network switches and routers.',
    user_budget_id: 'UB-2025-001',  // From UserBudgetData
    abc: 2000000,
    status: 'DRAFT',
    app_id: 'APP-2025-001', // Added missing app_id referencing APPData
  },
  {
    id: 'PROJ-2025-002',
    ppmp_id: 'PPMP-2025-001',  // Links to first PPMP
    procurement_mode_id: 'negotiated_procurement',  // From ProcurementModeData
    project_title: 'Research Program Development 2025',
    project_code: 'RPD-2025-001',
    classifications: ['consulting'],
    project_description: 'Development of research programs and methodologies',
    contract_scope: 'Engagement of a consultancy firm to design and implement comprehensive research programs including training sessions for staff.',
    user_budget_id: 'UB-2025-001',  // From UserBudgetData
    abc: 1500000,
    status: 'DRAFT',
    app_id: 'APP-2025-002', // Added missing app_id referencing APPData
  },
  {
    id: 'PROJ-2025-004',
    ppmp_id: 'PPMP-2025-001',  // Links to first PPMP
    procurement_mode_id: 'public_bidding',  // From ProcurementModeData
    project_title: 'Smart Campus Development',
    project_code: 'SCD-2025-001',
    classifications: ['infrastructure', 'goods', 'consulting'],
    project_description: 'Implementation of smart classroom technology, campus-wide networking, and AI-driven student monitoring.',
    contract_scope: 'Procurement of smart boards, networking equipment, and consultancy for AI integration.',
    user_budget_id: 'UB-2025-001',  // From UserBudgetData
    abc: 3000000,
    status: 'DRAFT',
    app_id: 'APP-2025-003', // Added missing app_id referencing APPData
  },
  {
    id: 'PROJ-2025-005',
    ppmp_id: 'PPMP-2025-002',  // Links to second PPMP
    procurement_mode_id: 'direct_contracting',  // From ProcurementModeData
    project_title: 'Hospital Modernization Program',
    project_code: 'HMP-2025-001',
    classifications: ['goods', 'infrastructure'],
    project_description: 'Upgrading hospital facilities and medical equipment for better patient care.',
    contract_scope: 'Procurement of MRI machines, hospital beds, and renovation of patient wards.',
    user_budget_id: 'UB-2025-001',  // From UserBudgetData
    abc: 5000000,
    status: 'PENDING',
    app_id: 'APP-2025-004', // Added missing app_id referencing APPData
  },
  {
    id: 'PROJ-2025-006',
    ppmp_id: 'PPMP-2025-002',  // Links to second PPMP
    procurement_mode_id: 'limited_source_bidding',  // From ProcurementModeData
    project_title: 'Digital Library Expansion',
    project_code: 'DLE-2025-001',
    classifications: ['goods', 'consulting'],
    project_description: 'Expansion of digital library resources, including e-books and research databases.',
    contract_scope: 'Procurement of e-book licenses, research database access, and consultancy for AI-powered library recommendations.',
    user_budget_id: 'UB-2025-001',  // From UserBudgetData
    abc: 2000000,
    status: 'DRAFT',
    app_id: 'APP-2025-001', // Added app_id referencing APPData
  },
  {
    id: 'PROJ-2025-007',
    ppmp_id: 'PPMP-2025-002',  // Links to second PPMP
    procurement_mode_id: 'public_bidding',  // From ProcurementModeData
    project_title: 'Smart Traffic Management System',
    project_code: 'STMS-2025-001',
    classifications: ['infrastructure', 'goods', 'consulting'],
    project_description: 'Deployment of smart traffic lights, AI-driven congestion analysis, and infrastructure upgrades.',
    contract_scope: 'Procurement of AI-powered traffic cameras, construction of smart intersections, and consultancy for predictive traffic analytics.',
    user_budget_id: 'UB-2025-003',  // From UserBudgetData
    abc: 4500000,
    status: 'DRAFT',
    app_id: 'APP-2025-002', // Added app_id referencing APPData
  },
];
  
// PPMP Schedules
export const PPMPScheduleData: PPMPSchedule[] = [
  { id: 'SCH-2025-001', ppmp_id: '3', milestone: 'Supplier Selection', date: new Date('2025-02-15') },
  { id: 'SCH-2025-002', ppmp_id: '3', milestone: 'Installation', date: new Date('2025-06-30') },
  { id: 'SCH-2025-003', ppmp_id: '4', milestone: 'Consultant Hiring', date: new Date('2025-03-20') },
  { id: 'SCH-2025-004', ppmp_id: '4', milestone: 'Program Launch', date: new Date('2025-09-15') },
  { id: 'SCH-2025-005', ppmp_id: '6',  milestone: 'Procurement Start', date: new Date('2025-02-10') },
  { id: 'SCH-2025-006', ppmp_id: '6',  milestone: 'Installation Phase', date: new Date('2025-05-01') },
  { id: 'SCH-2025-007', ppmp_id: '6',  milestone: 'Training & Implementation', date: new Date('2025-07-15') },
  { id: 'SCH-2025-008', ppmp_id: '7',  milestone: 'Supplier Selection', date: new Date('2025-03-05') },
  { id: 'SCH-2025-009', ppmp_id: '7',  milestone: 'Equipment Delivery', date: new Date('2025-06-20') },
  { id: 'SCH-2025-010', ppmp_id: '7',  milestone: 'Ward Renovation Completion', date: new Date('2025-09-15') },
  { id: 'SCH-2025-011', ppmp_id: '8',  milestone: 'License Procurement', date: new Date('2025-02-15') },
  { id: 'SCH-2025-012', ppmp_id: '8',  milestone: 'Database Integration', date: new Date('2025-06-10') },
  { id: 'SCH-2025-013', ppmp_id: '8',  milestone: 'AI System Implementation', date: new Date('2025-09-01') },
  { id: 'SCH-2025-014', ppmp_id: '9',  milestone: 'System Design Approval', date: new Date('2025-01-10') },
  { id: 'SCH-2025-015', ppmp_id: '9',  milestone: 'Equipment Procurement', date: new Date('2025-04-15') },
  { id: 'SCH-2025-016', ppmp_id: '9',  milestone: 'Deployment & Testing', date: new Date('2025-09-30') },
];
  



// Sample Vendor Information Data
export const VendorInfoData: VendorInfo[] = [
  {
    id:'1',
    companyName: 'ACME Supplies Corp.',
    tin: '123-456-789-000',
    address: '123 Business District, Davao City',
    telFax: '(082) 123-4567',
    email: 'info@acmesupplies.com'
  },
  {
    id:'2',
    companyName: 'TechPro Solutions Inc.',
    tin: '234-567-890-001',
    address: '456 Tech Park, Davao City',
    telFax: '(082) 234-5678',
    email: 'sales@techprosolutions.com'
  },
  {
    id:'3',
    companyName: 'MediEquip Distributors',
    tin: '345-678-901-002',
    address: '789 Health Avenue, Davao City',
    telFax: '(082) 345-6789',
    email: 'contact@mediequip.com'
  },
  {
    id:'4',
    companyName: 'EduTech Innovations',
    tin: '456-789-012-003',
    address: '890 Academic Boulevard, Davao City',
    telFax: '(082) 456-7890',
    email: 'service@edutech.com'
  }
];

export const ProcurementModeData:ProcurementMode[]=[
    { "id": "public_bidding", "mode_name": "Public Bidding", "method": "Public" },
    { "id": "limited_source_bidding", "mode_name": "Limited Source Bidding", "method": "Alternative" },
    { "id": "direct_contracting", "mode_name": "Direct Contracting", "method": "Alternative" },
    { "id": "repeat_order", "mode_name": "Repeat Order", "method": "Alternative" },
    { "id": "shopping", "mode_name": "Shopping", "method": "Public" },
    { "id": "negotiated_procurement", "mode_name": "Negotiated Procurement", "method": "Alternative" }
]
export const ProcurementProcessData: ProcurementProcess[] = [

  { "id": "process_1", "name": "Pre-Procurement Conference", "process_order": 1, "procurement_mode_id": "Public" },
  { "id": "process_2", "name": "Invitation to Bid", "process_order": 2, "procurement_mode_id": "Public" },
  { "id": "process_2.5", "name": "Posting / Publication ", "process_order": 3, "procurement_mode_id": "Public" },
  { "id": "process_3", "name": "Pre-bid Conference", "process_order": 4, "procurement_mode_id": "Public" },
  { "id": "process_4", "name": "Opening of Bids // Bidding", "process_order": 5, "procurement_mode_id": "Public" },
  { "id": "process_6", "name": "Post Qualification", "process_order": 6, "procurement_mode_id": "Public" },
  { "id": "process_7", "name": "Resolution to Award", "process_order": 7, "procurement_mode_id": "Public" },
  { "id": "process_8", "name": "Notice of Award (NOA)", "process_order": 8, "procurement_mode_id": "Public" },
  { "id": "process_9", "name": "Contract", "process_order": 9, "procurement_mode_id": "Public" },
  { "id": "process_10", "name": "Notice to Proceed (NTP)", "process_order": 10, "procurement_mode_id": "Public" },
  { "id": "process_11", "name": "Posting of Award", "process_order": 11, "procurement_mode_id": "Public" },
  { "id": "process_12", "name": "Delivery", "process_order": 12, "procurement_mode_id": "Public" },
  { "id": "process_13", "name": "Inspection and Acceptance", "process_order": 13, "procurement_mode_id": "Public" },
  { "id": "process_14", "name": "Obligation Request and Status", "process_order": 14, "procurement_mode_id": "Public" },
  { "id": "process_15", "name": "Disbursement Voucher (DV)", "process_order": 15, "procurement_mode_id": "Public" },
  { "id": "process_16", "name": "CHECK / ADA", "process_order": 16, "procurement_mode_id": "Public" },
  { "id": "process_17", "name": "Certificate of Completion", "process_order": 17, "procurement_mode_id": "Public" },

  

  { "id": "process_21", "name": "Posting", "process_order": 1, "procurement_mode_id": "Alternative" },
  { "id": "process_22", "name": "Price Quotation", "process_order": 2, "procurement_mode_id": "Alternative" },
  { "id": "process_23", "name": "Resolution to Award", "process_order": 3, "procurement_mode_id": "Alternative" },
  { "id": "process_24", "name": "Abstract of Quotations", "process_order": 4, "procurement_mode_id": "Alternative" },
  { "id": "process_25", "name": "Notice of Award (NOA)", "process_order": 5, "procurement_mode_id": "Alternative" },
  { "id": "process_26", "name": "Purchase Order", "process_order": 6, "procurement_mode_id": "Alternative" },
  { "id": "process_27", "name": "Posting of Award", "process_order": 7, "procurement_mode_id": "Alternative" },
  { "id": "process_28", "name": "Notice to Proceed (NTP)", "process_order": 8, "procurement_mode_id": "Alternative" },
  { "id": "process_29", "name": "Delivery", "process_order": 9, "procurement_mode_id": "Alternative" },
  { "id": "process_30", "name": "Inspection & Acceptance", "process_order": 10, "procurement_mode_id": "Alternative" },
  { "id": "process_31", "name": "Issuance to End User", "process_order": 11, "procurement_mode_id": "Alternative" },
  { "id": "process_32", "name": "Obligation Request and Status (ORS)", "process_order": 12, "procurement_mode_id": "Alternative" },
  { "id": "process_33", "name": "Disbursement Voucher", "process_order": 13, "procurement_mode_id": "Alternative" },
  { "id": "process_34", "name": "Check/ADA", "process_order": 14, "procurement_mode_id": "Alternative" },
  { "id": "process_35", "name": "Certifiate of Completion", "process_order": 15, "procurement_mode_id": "Alternative" }
]




// USERS
export const UsersData: Users[] = [
  {
    id: "1",
    fullname: "John Doe",
    username: "accounting",
    password: "test123",
    user_type: "Admin",
    role: "accounting",
    position: "Accounting Head",
    isAdmin: true,
    profile: "profile-pic-url-1",
    officeId: "550e8400e29b41d4a716446655440010"
  },
  {
    id: "1.5",
    fullname: "Anton Doe",
    username: "budget",
    password: "test123",
    user_type: "Admin",
    role: "accounting",
    position: "Accounting Head",
    isAdmin: true,
    profile: "profile-pic-url-1",
    officeId: "550e8400e29b41d4a716446655440010"
  },
  {
    id: "2",
    fullname: "Jane Smith",
    username: "superadmin",
    password: "test123",
    user_type: "SuperAdmin",
    role: "superadmin",
    position: "Superadmin Head",
    isAdmin: true,
    profile: "profile-pic-url-2",
    officeId: "550e8400e29b41d4a716446655440011"
  },
  {
    id: "3",
    fullname: "Alice Johnson",
    username: "supply",
    password: "test123",
    user_type: "Admin",
    position: "Supply Head",
    role: "supply",
    isAdmin: true,
    profile: "profile-pic-url-3",
    officeId: "550e8400e29b41d4a716446655440012"
  },
  {
    id: "4",
    fullname: "Bob Brown",
    username: "bac",
    password: "test123",
    user_type: "User",
    position: "BAC User",
    role: "bac",
    isAdmin: true,
    profile: "profile-pic-url-4",
    officeId: "550e8400e29b41d4a716446655440013"
  },
  {
    id: "5",
    fullname: "Charlie White",
    username: "inspection",
    password: "test123",
    user_type: "Admin",
    role: "inspection",
    position: "Inspection Head",
    isAdmin: true,
    profile: "profile-pic-url-5",
    officeId: "550e8400e29b41d4a716446655440014"
  },
  {
    id: "6",
    fullname: "Diana Green",
    username: "enduser",
    password: "test123",
    user_type: "User",
    position: "BUCS Faculty III",
    role: "enduser",
    isAdmin: true,
    profile: "profile-pic-url-6",
    officeId: "550e8400e29b41d4a716446655440015"
  },
  {
    id: "7",
    fullname: "Joshua Corda",
    username: "enduser2",
    password: "test123",
    user_type: "User",
    position: "BUCS Faculty II",
    role: "enduser",
    isAdmin: true,
    profile: "profile-pic-url-6",
    officeId: "550e8400e29b41d4a716446655440010"
  },
  {
    id: "8",
    fullname: "Joshua Corda",
    username: "supplier",
    password: "test123",
    user_type: "User",
    position: "BUCS Faculty II",
    role: "supplier",
    isAdmin: true,
    profile: "profile-pic-url-6",
    officeId: "550e8400e29b41d4a716446655440016"
  },
  {
    id: "9",
    fullname: "Jose Corda",
    username: "supplier2",
    password: "test123",
    user_type: "User",
    position: "BUCS Faculty III",
    role: "supplier",
    isAdmin: true,
    profile: "profile-pic-url-6",
    officeId: "550e8400e29b41d4a716446655440016"
  },
  {
    id: "10",
    fullname: "Juan Dela Cruz",
    username: "supplier3",
    password: "test123",
    user_type: "User",
    position: "BUCS Faculty I",
    role: "supplier",
    isAdmin: true,
    profile: "profile-pic-url-6",
    officeId: "550e8400e29b41d4a716446655440016"
  },
];

export const supplierDetailsList: SupplierDetails[] = [
  {
    id: 'SUPP-001',
    User_id: UsersData[8].id,
    name: 'ABC Office Supplies',
    contact_person: UsersData[8].fullname,
    contact_number: '+639123456789',
    email: 'juan@abcofficesupplies.com',
    address: '123 Main St, Makati City',
    tin_number: '123-456-789-000',
    sec_number: 'SEC-12345',
    dti_number: 'DTI-67890',
    mayors_permit: 'MP-54321'
  },
  {
    id: 'SUPP-002',
    User_id: UsersData[9].id,
    name: 'XYZ Electronics',
    contact_person: UsersData[9].fullname,
    contact_number: '+639234567890',
    email: 'maria@xyzelectronics.com',
    address: '456 Park Avenue, Quezon City',
    tin_number: '987-654-321-000',
    sec_number: 'SEC-98765',
    dti_number: 'DTI-43210',
    mayors_permit: 'MP-12345'
  },
  {
    id: 'SUPP-003',
    User_id: UsersData[10].id,
    name: 'Premier Furniture',
    contact_person: UsersData[10].fullname,
    contact_number: '+639345678901',
    email: 'pedro@premierfurniture.com',
    address: '789 Tree Lane, Pasig City',
    tin_number: '456-789-123-000',
    sec_number: 'SEC-45678',
    dti_number: 'DTI-90123',
    mayors_permit: 'MP-67890'
  }
];

export const EntityData: Entity[] = [
  {
    id: 1,
    name: 'PPMP',
    description: 'Create Procurement Projects'
  },
  {
    id: 2,
    name: 'PurchaseRequest',
    description: 'Request for purchase of goods/services'
  },
  {
    id: 3,
    name: 'APP',
    description: 'Annual Procurement Plan'
  },
  {
    id: 4,
    name: 'ProcurementProcess',
    description: 'Processes related to procurement'
  },
  {
    id: 5,
    name: 'Contract',
    description: 'Contract management and tracking'
  },
  {
    id: 6,
    name: 'InspectionAcceptance',
    description: 'Inspection and acceptance of deliveries'
  },
  {
    id: 7,
    name: 'Payment',
    description: 'Processing payments for procurement'
  }
];

export const ApproverData: Approver[] = [
  {
    id: 'APR-2025-001',
    user_id: '1', // This maps to "John Doe"
    entity_id: '1', // Only PPMP entity
    name: 'Department Head Approver', // Approval Sequence Name
    approval_order: 1
  },
  {
    id: 'APR-2025-002',
    user_id: '4', // This maps to "Jane Smith"
    entity_id: '1', // Only PPMP entity
    name: 'BAC Approver', // Approval Sequence Name
    approval_order: 2
  },
  {
    id: 'APR-2025-003',
    user_id: '3', // This maps to "Alice Johnson"
    entity_id: '1', // Only PPMP entity
    name: 'Budget Approver', // Approval Sequence Name
    approval_order: 3
  },
  {
    id: 'APR-2025-004',
    user_id: '1', // This maps to "John Doe"
    entity_id: '2', // Purchase Request entity
    name: 'Department Head Approver', // Approval Sequence Name
    approval_order: 1
  },
  {
    id: 'APR-2025-005',
    user_id: '4', // This maps to "Jane Smith"
    entity_id: '2', // Purchase Request entity
    name: 'BAC Approver', // Approval Sequence Name
    approval_order: 2
  },
  {
    id: 'APR-2025-006',
    user_id: '1.5', 
    entity_id: '2', // Purchase Request entity
    name: 'Budget Approver', // Approval Sequence Name
    approval_order: 3
  }
];


  
// Dummy Departments
export const DepartmentData: Department[] = [
  {
    id: '550e8400e29b41d4a716446655440000',
    name: 'College of Engineering'
  },
  {
    id: '550e8400e29b41d4a716446655440001',
    name: 'College of Business Administration'
  },
  {
    id: '550e8400e29b41d4a716446655440002',
    name: 'College of Education'
  },
  {
    id: '550e8400e29b41d4a716446655440003',
    name: 'College of Information Technology'
  },
  {
    id: '550e8400e29b41d4a716446655440004',
    name: 'College of Agriculture'
  },
  {
    id: '550e8400e29b41d4a716446655440005',
    name: 'College of Nursing'
  },
  {
    id: '550e8400e29b41d4a716446655440006',
    name: 'College of Arts and Sciences'
  },
  {
    id: '550e8400e29b41d4a716446655440007',
    name: 'College of Criminal Justice Education'
  }
];

// Buildings data
export const BuildingData: Building[] = [
  {
    id: '550e8400e29b41d4a716446655440008',
    name: 'Engineering Building',
    address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
    numberOfFloors: 4,
    dateConstructed: new Date('1996-03-25')
  },
  {
    id: '550e8400e29b41d4a716446655440009',
    name: 'Business Administration Building',
    address: 'DDOSC Main Campus, Nabunturan, Davao de Oro',
    numberOfFloors: 3,
    dateConstructed: new Date('1991-07-12')
  },
];

export const OfficeData: Office[] = [
  {
    id: '550e8400e29b41d4a716446655440010',
    name: 'Dean\'s Office - COE',
    department_id: '550e8400e29b41d4a716446655440000', // Matches DepartmentData[0]
    building_id: '550e8400e29b41d4a716446655440008'
  },
  {
    id: '550e8400e29b41d4a716446655440011',
    name: 'Registrar\'s Office - CBA',
    department_id: '550e8400e29b41d4a716446655440001', // Matches DepartmentData[1]
    building_id: '550e8400e29b41d4a716446655440009'
  },
  {
    id: '550e8400e29b41d4a716446655440015',
    name: 'Faculty\'s Office - CBA',
    department_id: '550e8400e29b41d4a716446655440001', // Matches DepartmentData[1]
    building_id: '550e8400e29b41d4a716446655440009'
  },
];


export const EventData: ConferenceEvent[] = [
  {
    id: "EVENT-2025-001",
    ppmp_id: "3", // IT Infrastructure Upgrade 2025
    date: new Date("2025-02-15"),
    event_time: new Date("2025-02-15T13:00:00"),
    mode: "Online",
    platform: "Zoom",
    type: "PreProcurement",
    created_by: "1", // John Doe
    created_at: new Date("2025-01-01T10:00:00"),
  },
  {
    id: "EVENT-2025-002",
    ppmp_id: "7", // Hospital Modernization Program
    date: new Date("2025-03-05"),
    event_time: new Date("2025-03-05T09:00:00"),
    mode: "InPerson",
    type: "PreProcurement",
    created_by: "2", // Jane Smith
    created_at: new Date("2025-01-02T14:00:00"),
  },
  {
    id: "EVENT-2025-003",
    ppmp_id: "8", // Digital Library Expansion
    date: new Date("2025-04-15"),
    event_time: new Date("2025-04-15T14:00:00"),
    mode: "Hybrid",
    platform: "Google Meet",
    type: "PreBidding",
    created_by: "3", // Alice Johnson
    created_at: new Date("2025-01-03T09:30:00"),
  },
  {
    id: "EVENT-2025-004",
    ppmp_id: "9", // Smart Traffic Management System
    date: new Date("2025-01-10"),
    event_time: new Date("2025-01-10T10:00:00"),
    mode: "Online",
    platform: "Zoom",
    type: "PreBidding",
    created_by: "4", // Bob Brown
    created_at: new Date("2025-01-04T15:00:00"),
  },
];


export const InvitationData: Invitation[] = [
  {
    id: "INV-2025-001",
    event_id: "EVENT-2025-001", // Links to IT Infrastructure Upgrade event
    ppmp_id: "3", // Redundant but included for convenience
    date: new Date("2025-02-15"),
    time: new Date("2025-02-15T13:00:00"),
    mode: "Online",
    platform: "Zoom",
    participants: ["1", "2"], // John Doe, Jane Smith
    type: "PreProcurement",
    sent_by: "1", // John Doe
    sent_at: new Date("2025-01-10T12:00:00"),
  },
  {
    id: "INV-2025-002",
    event_id: "EVENT-2025-002", // Links to Hospital Modernization event
    ppmp_id: "7",
    date: new Date("2025-03-05"),
    time: new Date("2025-03-05T09:00:00"),
    mode: "InPerson",
    participants: ["3", "4"], // Alice Johnson, Bob Brown
    type: "PreProcurement",
    sent_by: "2", // Jane Smith
    sent_at: new Date("2025-01-15T10:00:00"),
  },
  {
    id: "INV-2025-003",
    event_id: "EVENT-2025-003", // Links to Digital Library Expansion event
    ppmp_id: "8",
    date: new Date("2025-04-15"),
    time: new Date("2025-04-15T14:00:00"),
    mode: "Hybrid",
    platform: "Google Meet",
    participants: ["5"], // Charlie White
    type: "PreBidding",
    sent_by: "3", // Alice Johnson
    sent_at: new Date("2025-01-20T11:00:00"),
  },
];


// Purchase Request Data with vendor info, SAI and ALOBS
export const PurchaseRequestData: PurchaseRequest[] = [
  {
    id: 'PR-2025-001',
    prNo: 'PR-2025-001',
    project_id: 'PROJ-2025-001',
    user_id: "6",
    office_id: "550e8400e29b41d4a716446655440015",
    current_approver_level: 0,
    request_date: new Date('2025-03-01'),
    status: 'Draft',
    
  },
  {
    id: 'PR-2025-002',
    user_id: "6",
    prNo: 'PR-2025-002',
    project_id: 'PROJ-2025-002',
    office_id: "550e8400e29b41d4a716446655440015",
    current_approver_level: 0,
    request_date: new Date('2025-03-02'),
    status: 'Draft',
   
  },
  {
    id: 'PR-2025-003',
    user_id: "6",
    prNo: 'PR-2025-003',
    project_id: 'PROJ-2025-004',
    current_approver_level: 0,
    office_id: "550e8400e29b41d4a716446655440015",
    request_date: new Date('2025-03-03'),
    status: 'Draft',
  
  },
  {
    id: 'PR-2025-004',
    user_id: "6",
    prNo: 'PR-2025-004',
    project_id: 'PROJ-2025-005',
    current_approver_level: 0,
    office_id: "550e8400e29b41d4a716446655440015",
    request_date: new Date('2025-03-04'),
    status: 'Draft',
   
  }
]



// Dummy data for Fund Sources
export const FundSourceData: FundSource[] = [
  {
    id: 'FS-2025-001',
    source_name: 'General Appropriations Act (GAA)',
  },
  {
    id: 'FS-2025-002',
    source_name: 'Special Purpose Funds (SPF)',
  },
  {
    id: 'FS-2025-003',
    source_name: 'Local Government Support Fund (LGSF)',
  },
  
  {
    id: 'FS-2025-004',
    source_name: 'Government-Owned and Controlled Corporations (GOCC)',

  },
  {
    id: 'FS-2025-005',
    source_name: 'Official Development Assistance (ODA)',
  },
  {
    id: 'FS-2025-006',
    source_name: 'Public-Private Partnership (PPP)',
  },
  {
    id: 'FS-2025-007',
    source_name: 'Trust Funds',
  }
];

export const BudgetData:Budget[] = [
  {
    id: 'BGT-2025-001',
    office_id: '550e8400e29b41d4a716446655440015',
    fund_id: 'FS-2025-001',  // General Appropriations Act (GAA)
    created_by: "1",  // Example user ID
    fiscal_year: 2025,
    allocated_budget: 100000000,
        budget_type: 'CO',

    used_amount: 2000000,
    date_created: new Date('2025-01-01T10:00:00Z'),
    budget_name: 'General Appropriations Act (GAA)',  // Budget name
  },
  {
    id: 'BGT-2025-002',
    office_id: '550e8400e29b41d4a716446655440010',
    fund_id: 'FS-2025-002',  // Special Purpose Funds (SPF)
    created_by: "1",  // Example user ID
    fiscal_year: 2025,
    allocated_budget: 6000000,
        budget_type: 'CO',

    used_amount: 1500000,
    date_created: new Date('2025-02-01T10:00:00Z'),
    budget_name: 'Special Purpose Funds (SPF)',  // Budget name
  },
  {
    id: 'BGT-2025-003',
    office_id: '550e8400e29b41d4a716446655440015',
    fund_id: 'FS-2025-003',  // Local Government Support Fund (LGSF)
    created_by: "1",  // Example user ID
    fiscal_year: 2025,
    allocated_budget: 60000000,
        budget_type: 'MOOE',

    used_amount: 1000000,
    date_created: new Date('2025-03-01T10:00:00Z'),
    budget_name: 'Local Government Support Fund (LGSF)',  // Budget name
  },
]


export const UserBudgetData: UserBudget[] = [
  {
    id: 'UB-2025-001',
    user_id: '6',  // The user ID provided
    budget_id: 'BGT-2025-001',  // Link to the first budget (General Appropriations Act)
    allocated_amount: 80000000,  // Example allocated amount for the user
    used_amount: 0,  // Example amount used by the user
    date_allocated: new Date('2025-01-15T10:00:00Z'),
  },
  {
    id: 'UB-2025-003',
    user_id: '6',  // The user ID provided
    budget_id: 'BGT-2025-003',  // Link to the third budget (Local Government Support Fund)
    allocated_amount: 10000000,  // Example allocated amount for the user
    used_amount: 0,  // Example amount used by the user
    date_allocated: new Date('2025-03-05T10:00:00Z'),
  },
]

export const DocumentData: Document[] = [
  {
    id: '1',
    procurement_process_id: 'process_1',
    entity_id: 1,
    record_id: '101',
    file_path: '/documents/sample-document-1.pdf',
    uploaded_by: 1,
    upload_date: new Date('2024-01-15'),
  },
  {
    id: '2',
    procurement_process_id: 'process_2',
    entity_id: 2,
    record_id: '102',
    file_path: '/documents/sample-document-2.pdf',
    uploaded_by: 2,
    upload_date: new Date('2024-02-10'),
  },
  {
    id: '3',
    procurement_process_id: 'process_3',
    entity_id: 3,
    record_id: '103',
    file_path: '/documents/sample-document-3.pdf',
    uploaded_by: 3,
    upload_date: new Date('2024-03-05'),
  },    // Documents for CON-2025-001
    {
      id: 'DOC-PR-2025-001',
      procurement_process_id: 'process_9', // Purchase Request stage
      entity_id: 2, // PurchaseRequest
      record_id: 'PR-2025-001', // Linked to Purchase Request, tied to CON-2025-001
      file_path: '/documents/purchase_request_PR-2026-001.pdf',
      uploaded_by: 6, // Diana Green (enduser)
      upload_date: new Date('2025-03-01'),
    },
    {
      id: 'DOC-CON-2025-001-PO',
      procurement_process_id: 'process_26', // Purchase Order
      entity_id: 5, // Contract
      record_id: 'CON-2025-001',
      file_path: '/documents/purchase_order_CON-2025-001.pdf',
      uploaded_by: 4, // Bob Brown (BAC user)
      upload_date: new Date('2025-03-15'),
    },
    // Documents for CON-2025-002
    {
      id: 'DOC-PR-2025-002',
      procurement_process_id: 'process_9',
      entity_id: 2,
      record_id: 'PR-2025-002',
      file_path: '/documents/purchase_request_PR-2025-002.pdf',
      uploaded_by: 6,
      upload_date: new Date('2025-03-02'),
    },
    {
      id: 'DOC-CON-2025-002-PO',
      procurement_process_id: 'process_26',
      entity_id: 5,
      record_id: 'CON-2025-002',
      file_path: '/documents/purchase_order_CON-2025-002.pdf',
      uploaded_by: 4,
      upload_date: new Date('2025-02-10'),
    },
    // Documents for CON-2025-003 (example with missing PR)
    {
      id: 'DOC-CON-2025-003-PO',
      procurement_process_id: 'process_26',
      entity_id: 5,
      record_id: 'CON-2025-003',
      file_path: '/documents/purchase_order_CON-2025-003.pdf',
      uploaded_by: 4,
      upload_date: new Date('2025-03-20'),
    },
]

// export const SupportingDocsChecklistData: DocumentCategory[] = [
//   { name: 'Purchase Request', key: 'process_9' }, // PR tied to procurement process
//   { name: 'Purchase Order', key: 'process_26' }, // PO or contract document
//   { name: 'Certificate of Availability of Funds', key: 'process_8' }, // CAF per COA
//   { name: 'Approved Budget for the Contract', key: 'process_7' }, // ABC per COA
// ];

export const PaymentTermData: PaymentTerm[] = [
  {
    id: 'TERM-001',
    code: 'NET30',
    name: 'Net 30 Days',
    description: 'Payment due within 30 days of invoice date',
    days: 30,
    percentageRequired: 100,
    isActive: true
  },
  {
    id: 'TERM-002',
    code: 'NET60',
    name: 'Net 60 Days',
    description: 'Payment due within 60 days of invoice date',
    days: 60,
    percentageRequired: 100,
    isActive: true
  }
]

export const ContractData: Contract[] = [
  {
    id: 'CON-2025-001',
    purchase_request_id: 'PR-2025-001',
    contractor_name: 'TechPro Solutions Inc.',
    contract_amount: 2000000,
    contract_date: new Date('2025-03-15'),
    start_date: new Date('2025-04-01'),
    end_date: new Date('2025-12-31'),
    attachment: '/documents/purchase_order_CON-2025-001.pdf',
    status: 'Active'
  },
  {
    id: 'CON-2025-002',
    purchase_request_id: 'PR-2025-002',
    contractor_name: 'OfficeWorks Ltd.',
    contract_amount: 150000,
    contract_date: new Date('2025-02-10'),
    start_date: new Date('2025-03-01'),
    end_date: new Date('2025-09-30'),
    attachment: '/documents/purchase_order_CON-2025-002.pdf',
    status: 'Active'
  },
  {
    id: 'CON-2025-003',
    purchase_request_id: 'PR-2025-003',
    contractor_name: 'MediEquip Distributors',
    contract_amount: 3000000,
    contract_date: new Date('2025-03-20'),
    start_date: new Date('2025-04-15'),
    end_date: new Date('2025-10-15'),
    attachment: '/documents/purchase_order_CON-2025-003.pdf',
    status: 'Active'
  },
  {
    id: 'CON-2025-004',
    purchase_request_id: 'PR-2025-004',
    contractor_name: 'EduTech Innovations',
    contract_amount: 2500000,
    contract_date: new Date('2025-04-01'),
    start_date: new Date('2025-05-01'),
    end_date: new Date('2025-11-01'),
    attachment: '/documents/purchase_order_CON-2025-004.pdf',
    status: 'Active'
  },
  {
    id: 'CON-2025-005',
    purchase_request_id: 'PR-2025-005',
    contractor_name: 'Smart Solutions Ltd.',
    contract_amount: 5000000,
    contract_date: new Date('2025-05-10'),
    start_date: new Date('2025-06-01'),
    end_date: new Date('2025-12-31'),
    attachment: '/documents/purchase_order_CON-2025-005.pdf',
    status: 'Active'
  },
];

export const ObligationRequestData: ObligationRequest[] = [
    {
      id: 'ORS-2025-0001',
      serialNo: 'ORS-2025-0002',
      entityName: 'Department of Health',
      date: '2025-03-10',
      fundSourceId: 'FS-2025-001',
      requestingOffice: 'Finance Office',
      payee: 'MediEquip Distributors',
      address: '789 Health Avenue, Davao City',
      responsibilityCenter: 'Finance-002',
      items: [
        { particulars: 'Medical Equipment Purchase', mfoPap: 'MFO2', uacsObjectCode: '50203020', amount: 2000000 },
        { particulars: 'Installation Fees', mfoPap: 'MFO2', uacsObjectCode: '50203021', amount: 1000000 }
      ],
      supportingDocs: ['purchase_request.pdf', 'contract.pdf'],
      status: 'Pending',
      obligationAmount: 3000000,
      payableNotYetDue: 3000000,
      payableDue: 0,
      paymentAmount: 0,
      balanceObligation: 3000000,
      balancePayable: 3000000,
      obligationReferences: [{ date: '2025-03-10', particulars: 'Obligation recorded', refNo: 'ORS-2025-0002' }],
      requestDate: new Date('2025-03-10'),
      accountCode: 'U-12456-2B',
      totalAmount: 3000000
  },
  {
      id: 'ORS-2025-0002',
      serialNo: 'ORS-2025-0003',
      entityName: 'Department of Transportation',
      date: '2025-03-11',
      fundSourceId: 'FS-2025-001',
      requestingOffice: 'Logistics Office',
      payee: 'EduTech Innovations',
      address: '890 Academic Boulevard, Davao City',
      responsibilityCenter: 'Logistics-003',
      items: [
        { particulars: 'Traffic System Upgrade', mfoPap: 'MFO3', uacsObjectCode: '50203030', amount: 3000000 },
        { particulars: 'Consulting Services', mfoPap: 'MFO3', uacsObjectCode: '50203031', amount: 1000000 }
      ],
      supportingDocs: ['purchase_request.pdf', 'contract.pdf'],
      status: 'Pending',
      obligationAmount: 4000000,
      payableNotYetDue: 4000000,
      payableDue: 0,
      paymentAmount: 0,
      balanceObligation: 4000000,
      balancePayable: 4000000,
      obligationReferences: [{ date: '2025-03-11', particulars: 'Obligation recorded', refNo: 'ORS-2025-0003' }],
      requestDate: new Date('2025-03-11'),
      accountCode: 'U-12456-3C',
      totalAmount: 4000000
  }
];
