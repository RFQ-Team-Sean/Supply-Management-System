-- Import the UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table for Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL
);

-- Table for Offices (linked to Departments)
CREATE TABLE IF NOT EXISTS offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

-- Table for Users (Approvers and Requesters)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('SuperAdmin', 'Admin', 'User')),
    role VARCHAR(50) NOT NULL CHECK (role IN ('End-User', 'BAC', 'Budget', 'Accounting', 'Supply', 'Inspection', 'HOPE')),
    department_id UUID REFERENCES departments(id),
    office_id UUID REFERENCES offices(id)
);

-- Table for Procurement Modes
CREATE TABLE IF NOT EXISTS procurement_modes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mode_name VARCHAR(100) NOT NULL UNIQUE
);

-- Table for Funding Sources
CREATE TABLE IF NOT EXISTS funding_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(255) NOT NULL UNIQUE
);

-- Table for Budgets (per Department and Fiscal Year)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id),
    fiscal_year INTEGER NOT NULL,
    total_budget NUMERIC(14, 2) NOT NULL,
    allocated_budget NUMERIC(14, 2) DEFAULT 0,
    remaining_budget NUMERIC(14, 2) GENERATED ALWAYS AS (total_budget - allocated_budget) STORED,
    created_by UUID REFERENCES users(id), -- User who created the budget
    date_created DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Table for User-Specific Budget Allocations (Restricted to End-Users)
CREATE TABLE IF NOT EXISTS user_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(14, 2) NOT NULL,
    used_amount NUMERIC(14, 2) DEFAULT 0,
    remaining_amount NUMERIC(14, 2) GENERATED ALWAYS AS (allocated_amount - used_amount) STORED,
    date_allocated DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Table for Project Procurement Management Plan (PPMP)
CREATE TABLE IF NOT EXISTS ppmp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID REFERENCES departments(id),
    office_id UUID REFERENCES offices(id),
    project_title VARCHAR(255) NOT NULL,
    project_code VARCHAR(100),
    fiscal_year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    prepared_by VARCHAR(255) NOT NULL,
    date_prepared DATE NOT NULL,
    item_description TEXT NOT NULL,
    unit_of_measurement VARCHAR(50) NOT NULL,
    quantity_required INTEGER NOT NULL,
    estimated_unit_cost NUMERIC(12, 2) NOT NULL,
    estimated_total_cost NUMERIC(12, 2) GENERATED ALWAYS AS (quantity_required * estimated_unit_cost) STORED,
    procurement_mode_id UUID REFERENCES procurement_modes(id),
    funding_source_id UUID REFERENCES funding_sources(id),
    remarks TEXT,

    -- Overall Approval Status
    approval_status VARCHAR(20) DEFAULT 'Pending',
    current_approval_stage VARCHAR(50) DEFAULT 'Department Head Approval'
);

-- Table for PPMP Approvers (Assigning Users to Each Approval Stage)
CREATE TABLE IF NOT EXISTS ppmp_approvers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ppmp_id UUID REFERENCES ppmp(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    approver_role VARCHAR(50) NOT NULL, -- 'Department Head', 'BAC', 'Budget'
    approval_status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    approval_date DATE,
    signature VARCHAR(255), -- Path to signature file or base64 encoded string
    remarks TEXT,
    approval_order INTEGER NOT NULL -- Defines the sequence: 1 for Department Head, 2 for BAC, 3 for Budget
);

-- Table for Annual Procurement Plan (APP)
CREATE TABLE IF NOT EXISTS app (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_reference_number VARCHAR(100) UNIQUE NOT NULL,
    agency_name VARCHAR(255) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    prepared_by UUID REFERENCES users(id),
    date_prepared DATE NOT NULL,
    date_approved DATE,
    approved_by UUID REFERENCES users(id),

    -- Consolidated Procurement Details from Approved PPMPs
    ppmp_ids JSON NOT NULL, -- Array of linked approved PPMP IDs
    total_quantity_required INTEGER NOT NULL,
    total_estimated_cost NUMERIC(14, 2) NOT NULL,
    implementation_schedule_q1 BOOLEAN DEFAULT FALSE,
    implementation_schedule_q2 BOOLEAN DEFAULT FALSE,
    implementation_schedule_q3 BOOLEAN DEFAULT FALSE,
    implementation_schedule_q4 BOOLEAN DEFAULT FALSE,
    remarks TEXT
);

-- Table for APP Approvers (Assigning Users to Each Approval Stage)
CREATE TABLE IF NOT EXISTS app_approvers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id UUID REFERENCES app(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    approver_role VARCHAR(50) NOT NULL, -- 'BAC', 'HOPE'
    approval_status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    approval_date DATE,
    signature VARCHAR(255), -- Path to signature file or base64 encoded string
    remarks TEXT,
    approval_order INTEGER NOT NULL -- Defines the sequence: 1 for BAC, 2 for HOPE
);

-- Table for Purchase Requests (PR)
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ppmp_id UUID REFERENCES ppmp(id),
    requester_id UUID REFERENCES users(id),
    request_date DATE NOT NULL,
    item_description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    estimated_cost NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    approval_date DATE
);

-- Table for Purchase Request Approvers (Assigning Users to Each Approval Stage)
CREATE TABLE IF NOT EXISTS purchase_request_approvers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    approver_role VARCHAR(50) NOT NULL, -- 'Department Head', 'BAC', 'Budget'
    approval_status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    approval_date DATE,
    signature VARCHAR(255), -- Path to signature file or base64 encoded string
    remarks TEXT,
    approval_order INTEGER NOT NULL -- Defines the sequence: 1 for Department Head, 2 for BAC, 3 for Budget, etc.
);

CREATE TABLE IF NOT EXISTS procurement_process (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_request_id UUID REFERENCES purchase_requests(id) ON DELETE CASCADE,
    process_stage VARCHAR(255) NOT NULL, -- 'Pre-Procurement Conference', 'Invitation to Bid', etc.
    process_order INTEGER NOT NULL, -- Defines the sequence of procurement stages
    date_started DATE NOT NULL,
    date_completed DATE,
    remarks TEXT
);

-- Table for Contracts
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    procurement_id UUID REFERENCES procurement_process(id),
    contractor_name VARCHAR(255) NOT NULL,
    contract_amount NUMERIC(12, 2) NOT NULL,
    contract_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active'
);

-- Table for Inspection and Acceptance
CREATE TABLE IF NOT EXISTS inspection_acceptance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES contracts(id),
    inspection_date DATE NOT NULL,
    accepted BOOLEAN DEFAULT FALSE,
    remarks TEXT
);

-- Table for Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES contracts(id),
    obligation_request_date DATE NOT NULL,
    disbursement_voucher_date DATE NOT NULL,
    payment_date DATE NOT NULL,
    amount_paid NUMERIC(14, 2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('Check', 'ADA')),
    certificate_of_completion_issued BOOLEAN DEFAULT FALSE
);
