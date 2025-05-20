CREATE TABLE procurement_process (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    process_order INTEGER NOT NULL,
    procurement_mode_id TEXT CHECK (procurement_mode_id IN ('Public', 'Alternative')) NOT NULL
);

CREATE TABLE procurement_mode (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode_name TEXT NOT NULL,
    method TEXT CHECK (method IN ('Public', 'Alternative')) NOT NULL
);

CREATE TABLE fund_source (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    budget_id UUID NOT NULL REFERENCES budget(id)
);

CREATE TABLE budget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID NOT NULL REFERENCES office(id),
    created_by UUID NOT NULL REFERENCES users(id),
    fiscal_year INTEGER NOT NULL,
    total_budget NUMERIC NOT NULL,
    allocated_budget NUMERIC NOT NULL,
    used_amount NUMERIC NOT NULL,
    date_created TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_budget (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    budget_id UUID NOT NULL REFERENCES budget(id),
    allocated_amount NUMERIC NOT NULL,
    used_amount NUMERIC NOT NULL,
    date_allocated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ppmp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    office_id UUID NOT NULL REFERENCES office(id),
    app_id UUID REFERENCES app(id),
    approvals_id UUID NOT NULL REFERENCES approvals(id),
    current_approver_id UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE ppmp_project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ppmp_id UUID NOT NULL REFERENCES ppmp(id),
    procurement_mode_id UUID NOT NULL REFERENCES procurement_mode(id),
    prepared_by UUID NOT NULL REFERENCES users(id),
    project_title TEXT NOT NULL,
    project_code TEXT,
    project_description TEXT NOT NULL,
    classifications TEXT[],
    funding_source_id UUID NOT NULL REFERENCES budget(id),
    abc NUMERIC,
    contract_scope TEXT,
    fiscal_year INTEGER NOT NULL
);

CREATE TABLE ppmp_item (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ppmp_project_id UUID NOT NULL REFERENCES ppmp_project(id),
    quantity_required INTEGER NOT NULL,
    unit_of_measurement TEXT NOT NULL,
    estimated_unit_cost NUMERIC NOT NULL,
    estimated_total_cost NUMERIC NOT NULL,
    classification TEXT NOT NULL,
    technical_specification TEXT,
    scope_of_work TEXT,
    terms_of_reference TEXT
);

CREATE TABLE ppmp_schedule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ppmp_id UUID NOT NULL REFERENCES ppmp(id),
    milestone TEXT NOT NULL,
    edit_from TEXT NOT NULL,
    created_by TEXT NOT NULL,
    date TIMESTAMP NOT NULL
);

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approver_id UUID NOT NULL REFERENCES approver(id),
    approval_status TEXT CHECK (approval_status IN ('Approved', 'Rejected')) NOT NULL,
    remarks TEXT,
    signature TEXT
);

CREATE TABLE approver (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    entity_id UUID NOT NULL REFERENCES entity(id),
    name TEXT CHECK (name IN ('Department Head', 'BAC', 'Budget')) NOT NULL,
    approval_order INTEGER NOT NULL
);

CREATE TABLE entity (
    id SERIAL PRIMARY KEY,
    name TEXT CHECK (name IN ('PPMP', 'PurchaseRequest', 'APP', 'ProcurementProcess', 'Contract', 'InspectionAcceptance', 'Payment')) NOT NULL,
    description TEXT
);

CREATE TABLE app (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fund_source UUID NOT NULL REFERENCES fund_source(id),
    prepared_by UUID NOT NULL REFERENCES users(id),
    approvals_id UUID NOT NULL REFERENCES approvals(id),
    fiscal_year INTEGER NOT NULL,
    date_prepared TIMESTAMP DEFAULT NOW(),
    date_approved TIMESTAMP,
    total_quantity_required INTEGER NOT NULL,
    total_estimated_cost NUMERIC NOT NULL
);

CREATE TABLE purchase_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ppmp_id UUID NOT NULL REFERENCES ppmp(id),
    approvals_id UUID NOT NULL REFERENCES approvals(id),
    request_date TIMESTAMP NOT NULL
);

CREATE TABLE department (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

CREATE TABLE office (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES department(id),
    name TEXT NOT NULL
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    user_type TEXT CHECK (user_type IN ('SuperAdmin', 'Admin', 'User')) NOT NULL,
    role TEXT CHECK (role IN ('End-User', 'BAC', 'Budget', 'Accounting', 'Supply', 'Inspection', 'HOPE')) NOT NULL,
    office_id UUID NOT NULL REFERENCES office(id)
);

CREATE TABLE contract (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_request_id UUID NOT NULL REFERENCES purchase_request(id),
    contractor_name TEXT NOT NULL,
    contract_amount NUMERIC NOT NULL,
    contract_date TIMESTAMP NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status TEXT CHECK (status IN ('Active', 'Completed', 'Terminated')) NOT NULL
);

CREATE TABLE inspection_acceptance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contract(id),
    inspected_by UUID NOT NULL REFERENCES users(id),
    inspection_date TIMESTAMP NOT NULL,
    signature TEXT NOT NULL,
    remarks TEXT
);

CREATE TABLE payment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contract(id),
    obligation_request_date TIMESTAMP NOT NULL,
    disbursement_voucher_date TIMESTAMP NOT NULL,
    payment_date TIMESTAMP NOT NULL,
    amount_paid NUMERIC NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('Check', 'ADA')) NOT NULL
);

CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES entity(id),
    record_id UUID NOT NULL,
    approvals_id UUID NOT NULL REFERENCES approvals(id),
    action TEXT CHECK (action IN ('Created', 'Updated', 'Approved', 'Rejected', 'Deleted')) NOT NULL,
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT NOW(),
    remarks TEXT
);

CREATE TABLE notification (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document (
    id SERIAL PRIMARY KEY,
    procurement_process_id UUID NOT NULL REFERENCES procurement_process(id),
    entity_id UUID NOT NULL REFERENCES entity(id), 
    record_id UUID NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    upload_date TIMESTAMP DEFAULT NOW()
);

-- ICS Table
CREATE TABLE ics (
    ics_no VARCHAR(50) PRIMARY KEY CHECK (ics_no ~ '^ICS-\d{4}-\d{3}$'),  -- Enforces ICS-YYYY-### format
    fund_cluster VARCHAR(50) NOT NULL CHECK (fund_cluster ~ '^FC-\d{4}-\d{3}$'),  -- Enforces FC-YYYY-### format
    entity_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    inventory_item_no VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    description TEXT,
    estimated_useful_life VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ics_updated_at
    BEFORE UPDATE ON ics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Delivery Receipts Table
CREATE TABLE delivery_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL,
    supplier_name VARCHAR(255) NOT NULL,
    supplier_tin VARCHAR(20) NOT NULL,  -- Added TIN field
    department_id UUID NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    delivery_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    purchase_order UUID,
    receipts TEXT[],  -- Array of receipt image URLs
    notes TEXT,
    status VARCHAR(20) CHECK (status IN ('unverified', 'processing', 'verified')) NOT NULL,
    stocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_receipts_updated_at
    BEFORE UPDATE ON delivery_receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Supplier table definition
CREATE TABLE IF NOT EXISTS supplier (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    description TEXT,
    tin_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_supplier_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_supplier_updated_at
    BEFORE UPDATE ON supplier
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RPCPPE table
CREATE TABLE rpcppe (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4(),
    rpcppe_no VARCHAR(50) UNIQUE NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    fund_cluster VARCHAR(100) NOT NULL,
    accountable_officer VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    accountability_date DATE NOT NULL,
    date DATE NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL DEFAULT 0,
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create RPCPPE Items table
CREATE TABLE rpcppe_items (
    id VARCHAR(50) PRIMARY KEY DEFAULT uuid_generate_v4(),
    rpcppe_id VARCHAR(50) REFERENCES rpcppe(id) ON DELETE CASCADE,
    article VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    property_no VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_value DECIMAL(15, 2) NOT NULL,
    total_value DECIMAL(15, 2) NOT NULL,
    shortage_qty INTEGER DEFAULT 0,
    shortage_value DECIMAL(15, 2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);