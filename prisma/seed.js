import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function bulkUpsert(model, data, uniqueField = "id") {
  const operations = data.map((item) =>
    model.upsert({
      where: { [uniqueField]: item[uniqueField] },
      update: { ...item },
      create: { ...item },
    })
  );
  await Promise.all(operations);
}

async function main() {
  // Create departments with constant IDs
  const departments = [
    { id: "123e4567-e89b-12d3-a456-426614174000", name: "Finance" },
    { id: "123e4567-e89b-12d3-a456-426614174001", name: "Human Resources" },
    { id: "123e4567-e89b-12d3-a456-426614174002", name: "IT" },
    { id: "123e4567-e89b-12d3-a456-426614174003", name: "Marketing" },
  ];

  // Create buildings with constant IDs
  const buildings = [
    {
      id: "123e4567-e89b-12d3-a456-426614174005",
      name: "Building A",
      address: "123 Finance Street",
      numberOfFloors: 5,
      dateConstructed: new Date("2010-06-15"),
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174006",
      name: "Building B",
      address: "456 HR Avenue",
      numberOfFloors: 8,
      dateConstructed: new Date("2015-09-01"),
    },
    {
      id: "123e4567-e89b-12d3-a456-426614174007",
      name: "Building C",
      address: "789 IT Park",
      numberOfFloors: 10,
      dateConstructed: new Date("2020-03-10"),
    },
  ];

  // Create offices with constant IDs and link to departments and buildings
  const offices = [
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920ad",
      name: "Accounting Office",
      department_id: "123e4567-e89b-12d3-a456-426614174000", // Finance
      building_id: "123e4567-e89b-12d3-a456-426614174005", // Building A
    },
    {
      id: "f74f3a92-fb1f-43a1-a2fc-6c1a7c69be27",
      name: "Payroll Office",
      department_id: "123e4567-e89b-12d3-a456-426614174001", // Human Resources
      building_id: "123e4567-e89b-12d3-a456-426614174005", // Building B
    },
    {
      id: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
      name: "Tech Support Office",
      department_id: "123e4567-e89b-12d3-a456-426614174002", // IT
      building_id: "123e4567-e89b-12d3-a456-426614174005", // Building C
    },
    {
      id: "ba0c6c7e-7a5e-4de7-b7cf-b52e56c8d2cc",
      name: "Digital Marketing Office",
      department_id: "123e4567-e89b-12d3-a456-426614174003", // Marketing
      building_id: "123e4567-e89b-12d3-a456-426614174005", // Building C
    },
  ];

  const entities = [
    {
      id: 1,
      name: "PPMP",
      description: "Create PPMP Projects",
    },
    {
      id: 2,
      name: "PurchaseRequest",
      description: "Request for purchase of goods/services",
    },
    {
      id: 3,
      name: "APP",
      description: "Annual Procurement Plan",
    },
    {
      id: 4,
      name: "ProcurementProcess",
      description: "Processes related to procurement",
    },
    {
      id: 5,
      name: "Contract",
      description: "Contract management and tracking",
    },
    {
      id: 6,
      name: "InspectionAcceptance",
      description: "Inspection and acceptance of deliveries",
    },
    {
      id: 7,
      name: "Payment",
      description: "Processing payments for procurement",
    },
  ];

  const users = [
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a2",
      fullname: "John Doe",
      username: "accounting",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "Admin",
      role: "accounting",
      position: "Accounting Head",
      isAdmin: true,
      profile: "profile-pic-url-1",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a3",
      fullname: "Anton Doe",
      username: "budget",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "Admin",
      role: "accounting",
      position: "Accounting Head",
      isAdmin: true,
      profile: "profile-pic-url-1",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a4",
      fullname: "Jane Smith",
      username: "superadmin",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "SuperAdmin",
      role: "superadmin",
      position: "Superadmin Head",
      isAdmin: true,
      profile: "profile-pic-url-2",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a5",
      fullname: "Alice Johnson",
      username: "supply",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "Admin",
      position: "Supply Head",
      role: "supply",
      isAdmin: true,
      profile: "profile-pic-url-3",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a6",
      fullname: "Bob Brown",
      username: "bac",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "User",
      position: "BAC User",
      role: "bac",
      isAdmin: true,
      profile: "profile-pic-url-4",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a7",
      fullname: "Charlie White",
      username: "inspection",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "Admin",
      role: "inspection",
      position: "Inspection Head",
      isAdmin: true,
      profile: "profile-pic-url-5",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a8",
      fullname: "Diana Green",
      username: "enduser",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "User",
      position: "BUCS Faculty III",
      role: "enduser",
      isAdmin: true,
      profile: "profile-pic-url-6",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },
    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a9",
      fullname: "Joshua Corda",
      username: "enduser2",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "User",
      position: "BUCS Faculty II",
      role: "enduser",
      isAdmin: true,
      profile: "profile-pic-url-6",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },

    {
      id: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a20",
      fullname: "Test Head",
      username: "head",
      password: "$2a$12$V.mHrVs4sigsIfaLAli15e8nn4z0iHtFVZJp8so/aSjbkxpyzVZCm",
      user_type: "Head",
      position: "BUCS Faculty III",
      role: "enduser",
      isAdmin: true,
      profile: "profile-pic-url-6",
      officeId: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
    },
  ];

  const procurementmodes = [
    {
      id: "4b8e2f9c-1d5a-4e7d-a3c6-9f2b0e8d3a1f",
      mode_name: "Public Bidding",
      method: "Public",
    },
    {
      id: "d9c3a5f2-0e8b-4d1f-7c6e-2b9a3f8d0e5c",
      mode_name: "Limited Source Bidding",
      method: "Alternative",
    },
    {
      id: "e2f7b9c0-3d5a-4e8f-1c6d-9a2b0e8f3d5c",
      mode_name: "Direct Contracting",
      method: "Alternative",
    },
    {
      id: "a5d8e2f9-1c3b-4e7d-0f6c-9a2b3e8f0d5c",
      mode_name: "Repeat Order",
      method: "Alternative",
    },
    {
      id: "c6f9a2d3-0e8b-4d1f-5c7e-2b9a3e8f0d6c",
      mode_name: "Shopping",
      method: "Public",
    },
    {
      id: "f1c6a9d3-2e8b-4d0f-5c7e-9a3b2e8f0d6c",
      mode_name: "Negotiated Procurement",
      method: "Alternative",
    },
  ];

  const procurementProcess = [
    {
      id: "7d3e9f2a-1c5b-4e8d-a6f0-9b2c3e8f0d5a",
      name: "Pre-Procurement Conference",
      process_order: 1,
      procurement_mode_id: "Public",
    },
    {
      id: "a2f5c9d3-0e8b-4d1f-7c6e-9b3a2e8f0d5c",
      name: "Invitation to Bid",
      process_order: 2,
      procurement_mode_id: "Public",
    },
    {
      id: "b9e2f7c0-3d5a-4e8f-1c6d-9a2b0e8f3d5c",
      name: "Posting / Publication ",
      process_order: 3,
      procurement_mode_id: "Public",
    },
    {
      id: "c4a8d0f3-5e9b-4d2c-7f1e-9b3a2e8f0d6c",
      name: "Pre-bid Conference",
      process_order: 4,
      procurement_mode_id: "Public",
    },
    {
      id: "d7f2c9e8-0a3b-4e1f-5c6d-9b2a3e8f0d5c",
      name: "Opening of Bids // Bidding",
      process_order: 5,
      procurement_mode_id: "Public",
    },
    {
      id: "e9c3a5f2-1d8b-4e7f-0c6e-9b2a3e8f0d5c",
      name: "Post Qualification",
      process_order: 6,
      procurement_mode_id: "Public",
    },
    {
      id: "f1c6a9d3-2e8b-4d0f-5c7e-9a3b2e8f0d6c",
      name: "Resolution to Award",
      process_order: 7,
      procurement_mode_id: "Public",
    },
    {
      id: "a5d8e2f9-0c3b-4e7d-1c6f-9a2b3e8f0d5c",
      name: "Notice of Award (NOA)",
      process_order: 8,
      procurement_mode_id: "Public",
    },
    {
      id: "b3d7e9c0-2f5a-4e8d-1c6f-9a2b3e8f0d5c",
      name: "Contract",
      process_order: 9,
      procurement_mode_id: "Public",
    },
    {
      id: "c6f9a2d3-0e8b-4d1f-5c7e-2b9a3e8f0d6c",
      name: "Notice to Proceed (NTP)",
      process_order: 10,
      procurement_mode_id: "Public",
    },
    {
      id: "d8e2f5c9-1b3a-4e7d-0c6f-9a2b3e8f0d5c",
      name: "Posting of Award",
      process_order: 11,
      procurement_mode_id: "Public",
    },
    {
      id: "e1c6a9d3-2f8b-4d0f-5c7e-9a3b2e8f0d6c",
      name: "Delivery",
      process_order: 12,
      procurement_mode_id: "Public",
    },
    {
      id: "f5d8e2c9-0a3b-4e7d-1c6f-9b2a3e8f0d5c",
      name: "Inspection and Acceptance",
      process_order: 13,
      procurement_mode_id: "Public",
    },
    {
      id: "a9c3f5d2-1e8b-4d0f-7c6e-9b2a3e8f0d5c",
      name: "Obligation Request and Status",
      process_order: 14,
      procurement_mode_id: "Public",
    },
    {
      id: "b2f7c9e8-0d5a-4e1f-6c7d-9a3b2e8f0d6c",
      name: "Disbursement Voucher (DV)",
      process_order: 15,
      procurement_mode_id: "Public",
    },
    {
      id: "c5d8e2f9-1a3b-4e7d-0c6f-9b2a3e8f0d5c",
      name: "CHECK / ADA",
      process_order: 16,
      procurement_mode_id: "Public",
    },
    {
      id: "d9e2f5c0-3b8a-4d1f-7c6e-9a2b3e8f0d5c",
      name: "Certificate of Completion",
      process_order: 17,
      procurement_mode_id: "Public",
    },
    {
      id: "e2f7c9d3-0a5b-4e8f-1c6d-9b3a2e8f0d6c",
      name: "Posting",
      process_order: 1,
      procurement_mode_id: "Alternative",
    },
    {
      id: "f5c9a2d3-1e8b-4d0f-7c6e-9b2a3e8f0d5c",
      name: "Price Quotation",
      process_order: 2,
      procurement_mode_id: "Alternative",
    },
    {
      id: "a8d3e9f2-0c5b-4e1f-6c7d-9a3b2e8f0d6c",
      name: "Resolution to Award",
      process_order: 3,
      procurement_mode_id: "Alternative",
    },
    {
      id: "b1f7c9e8-2d5a-4e0f-7c6d-9b2a3e8f0d5c",
      name: "Abstract of Quotations",
      process_order: 4,
      procurement_mode_id: "Alternative",
    },
    {
      id: "c5d8e2f9-0a3b-4e1f-6c7d-9a2b3e8f0d5c",
      name: "Notice of Award (NOA)",
      process_order: 5,
      procurement_mode_id: "Alternative",
    },
    {
      id: "d9e2f5c0-1b8a-4d0f-7c6e-9b3a2e8f0d6c",
      name: "Purchase Order",
      process_order: 6,
      procurement_mode_id: "Alternative",
    },
    {
      id: "e2f7c9d3-0c5b-4e1f-6c7d-9a2b3e8f0d5c",
      name: "Posting of Award",
      process_order: 7,
      procurement_mode_id: "Alternative",
    },
    {
      id: "f5c9a2d3-1e8b-4d0f-7c6e-9b3a2e8f0d6c",
      name: "Notice to Proceed (NTP)",
      process_order: 8,
      procurement_mode_id: "Alternative",
    },
    {
      id: "a8d3e9f2-0b5a-4e1f-6c7d-9a2b3e8f0d5c",
      name: "Delivery",
      process_order: 9,
      procurement_mode_id: "Alternative",
    },
    {
      id: "b1f7c9e8-2d5a-4e0f-7c6d-9b3a2e8f0d6c",
      name: "Inspection & Acceptance",
      process_order: 10,
      procurement_mode_id: "Alternative",
    },
    {
      id: "c5d8e2f9-0a3b-4e1f-6c7d-9a2b3e8f0d5c",
      name: "Issuance to End User",
      process_order: 11,
      procurement_mode_id: "Alternative",
    },
    {
      id: "d9e2f5c0-1b8a-4d0f-7c6e-9b3a2e8f0d6c",
      name: "Obligation Request and Status (ORS)",
      process_order: 12,
      procurement_mode_id: "Alternative",
    },
    {
      id: "e2f7c9d3-0c5b-4e1f-6c7d-9a2b3e8f0d5c",
      name: "Disbursement Voucher",
      process_order: 13,
      procurement_mode_id: "Alternative",
    },
    {
      id: "f5c9a2d3-1e8b-4d0f-7c6e-9b3a2e8f0d6c",
      name: "Check/ADA",
      process_order: 14,
      procurement_mode_id: "Alternative",
    },
    {
      id: "a8d3e9f2-0b5a-4e1f-6c7d-9a2b3e8f0d5c",
      name: "Certifiate of Completion",
      process_order: 15,
      procurement_mode_id: "Alternative",
    },
  ];

  const fundSource = [
    {
      id: "3f8d2e9c-1a5b-4e7d-0c6f-9b2a3e8f0d5c",
      source_name: "General Appropriations Act (GAA)",
    },
    {
      id: "a9c5f2d3-0e8b-4d1f-7c6e-9b3a2e8f0d5c",
      source_name: "Special Purpose Funds (SPF)",
    },
    {
      id: "b2f7c9e8-1d5a-4e0f-6c7d-9a3b2e8f0d6c",
      source_name: "Local Government Support Fund (LGSF)",
    },
    {
      id: "c5d8e2f9-0a3b-4e1f-6c7d-9b2a3e8f0d5c",
      source_name: "Government-Owned and Controlled Corporations (GOCC)",
    },
    {
      id: "d9e2f5c0-1b8a-4d0f-7c6e-9b3a2e8f0d6c",
      source_name: "Official Development Assistance (ODA)",
    },
    {
      id: "e2f7c9d3-0c5b-4e1f-6c7d-9a2b3e8f0d5c",
      source_name: "Public-Private Partnership (PPP)",
    },
    { id: "f5c9a2d3-1e8b-4d0f-7c6e-9b3a2e8f0d6c", source_name: "Trust Funds" },
  ];

  const budgets = [
    {
      id: "e4b7f2d9-8c5a-4e1f-9d6c-3a2b8e7f0d5c", // Random UUID
      office_id: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
      fund_id: "3f8d2e9c-1a5b-4e7d-0c6f-9b2a3e8f0d5c", // Maps to "General Appropriations Act (GAA)"
      created_by: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a2",
      fiscal_year: 2025,
      allocated_budget: 100000000,
      budget_type: "CO",
      used_amount: 2000000,
      date_created: new Date("2025-01-01T10:00:00Z"),
      budget_name: "General Appropriations Act (GAA)",
    },
    {
      id: "f7c9a2d3-1e8b-4d0f-6c5e-9b3a2e8f0d6c", // Random UUID
      office_id: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
      fund_id: "a9c5f2d3-0e8b-4d1f-7c6e-9b3a2e8f0d5c", // Maps to "Special Purpose Funds (SPF)"
      created_by: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a2",
      fiscal_year: 2025,
      allocated_budget: 6000000,
      budget_type: "MOOE",
      used_amount: 1500000,
      date_created: new Date("2025-02-01T10:00:00Z"),
      budget_name: "Special Purpose Funds (SPF)",
    },
    {
      id: "d5e8f2c0-1b9a-4e0f-7c6d-9a3b2e8f0d5c", // Random UUID
      office_id: "9a0c7cfb-eed2-4b9c-8d56-b5c56e26313e",
      fund_id: "b2f7c9e8-1d5a-4e0f-6c7d-9a3b2e8f0d6c", // Maps to "Local Government Support Fund (LGSF)"
      created_by: "c3d6d9f2-f99c-4f88-bb29-19b88b3920a2",
      fiscal_year: 2025,
      allocated_budget: 60000000,
      budget_type: "MOOE",
      used_amount: 1000000,
      date_created: new Date("2025-03-01T10:00:00Z"),
      budget_name: "Local Government Support Fund (LGSF)",
    },
  ];

  await bulkUpsert(prisma.department, departments);
  await bulkUpsert(prisma.building, buildings);
  await bulkUpsert(prisma.office, offices);
  await bulkUpsert(prisma.entity, entities);
  await bulkUpsert(prisma.users, users);
  await bulkUpsert(prisma.procurementMode, procurementmodes);
  await bulkUpsert(prisma.procurementProcess, procurementProcess);
  await bulkUpsert(prisma.fundSource, fundSource);
  await bulkUpsert(prisma.budget, budgets);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
