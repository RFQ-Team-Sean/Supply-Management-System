import { Category, Asset, Transfer, Items, Warehouse, BorrowItem, RequestItem, Position, DeliveredStock, StockDetail, DeliveryStatus, QuotationRequest } from './schema';  
import { v4 as uuidv4 } from 'uuid';
import { ReceivingItem } from '../services/receiving.service';

// Define 5 categories
export const categories = [
  {
    id: '1',
    name: 'Computer Equipment',
    code: 'CE',
    description: 'Desktop computers, laptops, servers, and related hardware'
  },
  {
    id: '2',
    name: 'Office Furniture',
    code: 'OF',
    description: 'Desks, chairs, filing cabinets, and other office furniture'
  },
  {
    id: '3',
    name: 'Mobile Devices',
    code: 'MD',
    description: 'Smartphones, tablets, and other portable electronic devices'
  },
  {
    id: '4',
    name: 'Network Equipment',
    code: 'NE',
    description: 'Routers, switches, access points, and other networking hardware'
  },
  {
    id: '5',
    name: 'Audio/Visual Equipment',
    code: 'AV',
    description: 'Projectors, displays, sound systems, and other A/V equipment'
  }
].map(cat => Object.assign(new Category(), cat));

export const departments = [
  { id: '1', name: 'IT Department', code: 'IT', description: 'Information Technology department' },
  { id: '2', name: 'Human Resources', code: 'HR', description: 'Human Resources department' },
  { id: '3', name: 'Finance', code: 'FIN', description: 'Finance and Accounting department' },
  { id: '4', name: 'Marketing', code: 'MKT', description: 'Marketing and Communications department' },
  { id: '5', name: 'Operations', code: 'OPS', description: 'Operations department' },
  { id: '6', name: 'Sales', code: 'SLS' },
  { id: '7', name: 'Research & Development', code: 'RND' },
  { id: '8', name: 'Administration', code: 'ADM' },
  { id: '9', name: 'Customer Service', code: 'CSR' },
  { id: '10', name: 'Quality Assurance', code: 'QA' }
];

export const locations = [
  { id: '1', name: 'Headquarters', address: '123 Main Street, New York, NY 10001', description: 'Main company headquarters' },
  { id: '2', name: 'West Office', address: '456 Tech Blvd, San Francisco, CA 94105', description: 'West coast regional office' },
  { id: '3', name: 'South Office', address: '789 Palm Drive, Miami, FL 33101', description: 'South regional office' },
  { id: '4', name: 'Warehouse', address: '101 Industrial Pkwy, Chicago, IL 60607', description: 'Main storage and distribution center' },
  { id: '5', name: 'Remote Office', address: '202 Innovation Way, Austin, TX 78701', description: 'Remote work hub' },
  { id: '6', name: 'Branch Office - North', code: 'BR-N' },
  { id: '7', name: 'Branch Office - South', code: 'BR-S' },
  { id: '8', name: 'Conference Room', code: 'CONF' },
  { id: '9', name: 'Training Room', code: 'TRN' },
  { id: '10', name: 'Storage Room', code: 'STR' }
];

// Property Types
export const propertyTypes = [
  { id: '1', name: 'Company Owned', description: 'Assets fully owned by the company' },
  { id: '2', name: 'Leased', description: 'Assets leased from a third party' },
  { id: '3', name: 'Employee Owned', description: 'Assets owned by employees but used for company business' },
  { id: '4', name: 'Rented', description: 'Assets rented for short-term use' },
  { id: '5', name: 'Client Owned', description: 'Assets owned by clients but maintained by the company' },
  { id: '6', name: 'Personal', code: 'PS' }
];

export const assets: Asset[] = [
  {
    id: '1',
    name: 'Dell XPS 15 Laptop',
    category: categories[0],
    serialNumber: 'DL-XPS-2023-001',
    status: 'Active',
    model: 'XPS 15 9520',
    purchaseDate: new Date('2023-01-15'),
    purchaseCost: 1899.99,
    vendor: 'Dell Technologies',
    invoice: 'INV-2023-0042',
    warrantyExpiry: new Date('2026-01-15'),
    department: departments[0],
    location: locations[0],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-001',
    qrCode: 'QR-ASSET-001',
    image: '',
    notes: 'Assigned to IT Director',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '2',
    name: 'Herman Miller Aeron Chair',
    category: categories[1],
    serialNumber: 'HM-AER-2022-015',
    status: 'Active',
    model: 'Aeron Size B',
    purchaseDate: new Date('2022-06-10'),
    purchaseCost: 1095.00,
    vendor: 'Herman Miller',
    invoice: 'INV-2022-1187',
    warrantyExpiry: new Date('2034-06-10'),
    department: departments[1],
    location: locations[0],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-002',
    qrCode: 'QR-ASSET-002',
    image: '',
    notes: 'Located in HR Director office',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '3',
    name: 'iPhone 14 Pro',
    category: categories[2],
    serialNumber: 'APL-IP14-2022-089',
    status: 'Active',
    model: 'iPhone 14 Pro 256GB',
    purchaseDate: new Date('2022-10-05'),
    purchaseCost: 1099.00,
    vendor: 'Apple Inc.',
    invoice: 'INV-2022-3456',
    warrantyExpiry: new Date('2023-10-05'),
    department: departments[3],
    location: locations[0],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-003',
    qrCode: 'QR-ASSET-003',
    image: '',
    notes: 'Assigned to Marketing Manager',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '4',
    name: 'Cisco Meraki MR46 Access Point',
    category: categories[3],
    serialNumber: 'CSO-MR46-2023-012',
    status: 'Active',
    model: 'Meraki MR46',
    purchaseDate: new Date('2023-02-20'),
    purchaseCost: 1299.00,
    vendor: 'Cisco Systems',
    invoice: 'INV-2023-0789',
    warrantyExpiry: new Date('2026-02-20'),
    department: departments[0],
    location: locations[1],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-004',
    qrCode: 'QR-ASSET-004',
    image: '',
    notes: 'Installed in West Office main area',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '5',
    name: 'Sony 4K Projector',
    category: categories[4],
    serialNumber: 'SNY-4KP-2022-005',
    status: 'Active',
    model: 'VPL-VW325ES',
    purchaseDate: new Date('2022-08-15'),
    purchaseCost: 5499.99,
    vendor: 'Sony Electronics',
    invoice: 'INV-2022-2345',
    warrantyExpiry: new Date('2024-08-15'),
    department: departments[4],
    location: locations[0],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-005',
    qrCode: 'QR-ASSET-005',
    image: '',
    notes: 'Installed in main conference room',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '6',
    name: 'MacBook Pro 16"',
    category: categories[0],
    serialNumber: 'APL-MBP-2023-042',
    status: 'Active',
    model: 'MacBook Pro 16" M2 Max',
    purchaseDate: new Date('2023-03-10'),
    purchaseCost: 3499.00,
    vendor: 'Apple Inc.',
    invoice: 'INV-2023-1234',
    warrantyExpiry: new Date('2024-03-10'),
    department: departments[3],
    location: locations[2],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-006',
    qrCode: 'QR-ASSET-006',
    image: '',
    notes: 'Assigned to Creative Director',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '7',
    name: 'Standing Desk',
    category: categories[1],
    serialNumber: 'VRT-DSK-2022-078',
    status: 'Active',
    model: 'VertDesk v3',
    purchaseDate: new Date('2022-11-20'),
    purchaseCost: 699.00,
    vendor: 'BTOD',
    invoice: 'INV-2022-4567',
    warrantyExpiry: new Date('2032-11-20'),
    department: departments[2],
    location: locations[0],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-007',
    qrCode: 'QR-ASSET-007',
    image: '',
    notes: 'Located in Finance department',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '8',
    name: 'iPad Pro 12.9"',
    category: categories[2],
    serialNumber: 'APL-IPD-2022-123',
    status: 'Active',
    model: 'iPad Pro 12.9" M2',
    purchaseDate: new Date('2022-12-05'),
    purchaseCost: 1299.00,
    vendor: 'Apple Inc.',
    invoice: 'INV-2022-5678',
    warrantyExpiry: new Date('2023-12-05'),
    department: departments[1],
    location: locations[0],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-008',
    qrCode: 'QR-ASSET-008',
    image: '',
    notes: 'Used for HR presentations',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '9',
    name: 'Forklift',
    category: categories[1],
    serialNumber: 'TYT-FLT-2021-007',
    status: 'Maintenance',
    model: 'Toyota 8FGU25',
    purchaseDate: new Date('2021-05-15'),
    purchaseCost: 35000.00,
    vendor: 'Toyota Material Handling',
    invoice: 'INV-2021-0987',
    warrantyExpiry: new Date('2023-05-15'),
    department: departments[4],
    location: locations[3],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-009',
    qrCode: 'QR-ASSET-009',
    image: '',
    notes: 'Currently undergoing scheduled maintenance',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  },
  {
    id: '10',
    name: 'Conference Room Display',
    category: categories[4],
    serialNumber: 'LG-DSP-2022-034',
    status: 'Active',
    model: 'LG 86" 4K UHD',
    purchaseDate: new Date('2022-09-10'),
    purchaseCost: 2999.99,
    vendor: 'LG Electronics',
    invoice: 'INV-2022-3210',
    warrantyExpiry: new Date('2025-09-10'),
    department: departments[0],
    location: locations[4],
    propertyType: propertyTypes[0],
    barcode: 'ASSET-010',
    qrCode: 'QR-ASSET-010',
    image: '',
    notes: 'Installed in remote office main conference room',
    ownershipDetails: 'Company owned asset',
    repairHistory: [],
    depreciation: 0
  }
].map(asset => Object.assign(new Asset(), asset));

// Define 5 products
export const products = [
  {
    id: 'PROD001',
    name: 'Lenovo IdeaPad 3',
    image: 'assets/images/products/laptop.jpg',
    categoryId: categories[0].id
  },
  {
    id: 'PROD002',
    name: 'Office Desk Chair',
    image: 'assets/images/products/chair.jpg',
    categoryId: categories[1].id
  },
  {
    id: 'PROD003',
    name: 'Premium Notebook Set',
    image: 'assets/images/products/notebook.jpg',
    categoryId: categories[2].id
  },
  {
    id: 'PROD004',
    name: 'HP LaserJet Printer',
    image: 'assets/images/products/printer.jpg',
    categoryId: categories[3].id
  },
  {
    id: 'PROD005',
    name: 'Windows 11 Pro License',
    image: 'assets/images/products/windows.jpg',
    categoryId: categories[4].id
  }
];

// Define 5 persons
export const persons = [
  {
    id: 'PER001',
    name: 'John Smith',
    position: 'Warehouse Manager',
    image: 'assets/images/persons/john.jpg'
  },
  {
    id: 'PER002',
    name: 'Sarah Johnson',
    position: 'Stock Controller',
    image: 'assets/images/persons/sarah.jpg'
  },
  {
    id: 'PER003',
    name: 'Michael Brown',
    position: 'Inventory Supervisor',
    image: 'assets/images/persons/michael.jpg'
  },
  {
    id: 'PER004',
    name: 'Emily Davis',
    position: 'Warehouse Manager',
    image: 'assets/images/persons/emily.jpg'
  },
  {
    id: 'PER005',
    name: 'David Wilson',
    position: 'Stock Controller',
    image: 'assets/images/persons/david.jpg'
  }
];

// Define 5 warehouses
export const warehouseData = [
  {
    id: 'WH001',
    name: 'Main Warehouse',
    code: 'MW',
    building: 'Building A',
    person: {
      id: 1,
      name: 'John Smith',
      image: 'assets/images/users/user1.jpg',
      position: 'Warehouse Manager'
    },
    products: [
      {
        name: products[0].name,
        image: 'assets/images/products/laptop.png',
        quantity: 50
      },
      {
        name: products[1].name,
        image: 'assets/images/products/chair.png',
        quantity: 30
      }
    ]
  },
  {
    id: 'WH002',
    name: 'East Branch',
    building: 'Building B',
    person: persons[1],
    products: [
      { name: products[2].name, image: products[2].image, quantity: 100 },
      { name: products[3].name, image: products[3].image, quantity: 25 }
    ]
  },
  {
    id: 'WH003',
    name: 'West Branch',
    building: 'Building C',
    person: persons[2],
    products: [
      { name: products[4].name, image: products[4].image, quantity: 75 },
      { name: products[0].name, image: products[0].image, quantity: 40 }
    ]
  },
  {
    id: 'WH004',
    name: 'North Branch',
    building: 'Building D',
    person: persons[3],
    products: [
      { name: products[1].name, image: products[1].image, quantity: 60 },
      { name: products[2].name, image: products[2].image, quantity: 45 }
    ]
  },
  {
    id: 'WH005',
    name: 'South Branch',
    building: 'Building E',
    person: persons[4],
    products: [
      { name: products[3].name, image: products[3].image, quantity: 35 },
      { name: products[4].name, image: products[4].image, quantity: 80 }
    ]
  }
].map(w => Object.assign(new Warehouse(), w));

// Define 5 stocks
export const stocks = [
  {
    id: 'STK001',
    warehouse: warehouseData[0].name,
    product: products[0].name,
    quantity: 50,
    productImage: products[0].image
  },
  {
    id: 'STK002',
    warehouse: warehouseData[1].name,
    product: products[1].name,
    quantity: 30,
    productImage: products[1].image
  },
  {
    id: 'STK003',
    warehouse: warehouseData[2].name,
    product: products[2].name,
    quantity: 100,
    productImage: products[2].image
  },
  {
    id: 'STK004',
    warehouse: warehouseData[3].name,
    product: products[3].name,
    quantity: 25,
    productImage: products[3].image
  },
  {
    id: 'STK005',
    warehouse: warehouseData[4].name,
    product: products[4].name,
    quantity: 75,
    productImage: products[4].image
  }
];

// Define adjustments with correct image paths and references
export const adjustments = [
  {
    id: 'ADJ001',
    warehouseId: warehouseData[0].id,
    warehouse: warehouseData[0].name,
    productName: products[0].name,
    productImage: 'assets/images/products/laptop.png',
    date: new Date('2024-01-10'),
    type: 'Stock Count',
    previousQty: 45,
    adjustment: 5,
    newQty: 50,
    person: warehouseData[0].person?.name || 'John Smith',
    personImage: 'assets/images/users/user1.jpg',
    notes: 'Regular stock count adjustment',
    status: 'Completed'
  },
  {
    id: 'ADJ002',
    warehouseId: warehouseData[1].id,
    warehouse: warehouseData[1].name,
    productName: products[1].name,
    productImage: 'assets/images/products/chair.png',
    date: new Date('2024-01-15'),
    type: 'Damage',
    previousQty: 35,
    adjustment: -5,
    newQty: 30,
    person: warehouseData[1].person?.name || 'Sarah Johnson',
    personImage: 'assets/images/users/user2.jpg',
    notes: 'Damaged items removed from inventory',
    status: 'Completed'
  },
  {
    id: 'ADJ003',
    warehouseId: warehouseData[2].id,
    warehouse: warehouseData[2].name,
    productName: products[2].name,
    productImage: 'assets/images/products/notebook.png',
    date: new Date('2024-01-20'),
    type: 'Stock Count',
    previousQty: 95,
    adjustment: 5,
    newQty: 100,
    person: warehouseData[2].person?.name || 'Mike Brown',
    personImage: 'assets/images/users/user3.jpg',
    notes: 'Quarterly inventory check',
    status: 'Completed'
  },
  {
    id: 'ADJ004',
    warehouseId: warehouseData[3].id,
    warehouse: warehouseData[3].name,
    productName: products[3].name,
    productImage: 'assets/images/products/printer.png',
    date: new Date('2024-01-25'),
    type: 'Return',
    previousQty: 20,
    adjustment: 5,
    newQty: 25,
    person: warehouseData[3].person?.name || 'Emily Davis',
    personImage: 'assets/images/users/user4.jpg',
    notes: 'Customer return - good condition',
    status: 'Completed'
  },
  {
    id: 'ADJ005',
    warehouseId: warehouseData[4].id,
    warehouse: warehouseData[4].name,
    productName: products[4].name,
    productImage: 'assets/images/products/software.png',
    date: new Date('2024-01-30'),
    type: 'Stock Count',
    previousQty: 70,
    adjustment: 5,
    newQty: 75,
    person: warehouseData[4].person?.name || 'Alex Wilson',
    personImage: 'assets/images/users/user5.jpg',
    notes: 'Monthly inventory reconciliation',
    status: 'Completed'
  }
];

// Define comprehensive product history for all warehouses and adjustments
export const productHistory = [
  // Main Warehouse (WH001) History
  {
    id: 'HIST001',
    warehouseId: warehouseData[0].id,
    productName: products[0].name,
    date: new Date('2024-02-01'),
    type: 'Received',
    previousQty: 0,
    adjustment: 50,
    newQty: 50,
    notes: 'Initial stock'
  },
  {
    id: 'HIST002',
    warehouseId: warehouseData[0].id,
    productName: products[0].name,
    date: new Date('2024-02-10'),
    type: 'Stock Count',
    previousQty: 45,
    adjustment: 5,
    newQty: 50,
    notes: 'Regular stock count adjustment'
  },
  {
    id: 'HIST003',
    warehouseId: warehouseData[0].id,
    productName: products[1].name,
    date: new Date('2024-02-15'),
    type: 'Transferred',
    previousQty: 50,
    adjustment: -20,
    newQty: 30,
    notes: 'Inter-warehouse transfer'
  },
  {
    id: 'HIST004',
    warehouseId: warehouseData[0].id,
    productName: products[1].name,
    date: new Date('2024-02-20'),
    type: 'Damage',
    previousQty: 35,
    adjustment: -5,
    newQty: 30,
    notes: 'Damaged items removed'
  },

  // East Branch (WH002) History
  {
    id: 'HIST005',
    warehouseId: warehouseData[1].id,
    productName: products[1].name,
    date: new Date('2024-02-15'),
    type: 'Received',
    previousQty: 10,
    adjustment: 20,
    newQty: 30,
    notes: 'Transfer received'
  },
  {
    id: 'HIST006',
    warehouseId: warehouseData[1].id,
    productName: products[2].name,
    date: new Date('2024-02-20'),
    type: 'Purchase',
    previousQty: 40,
    adjustment: 10,
    newQty: 50,
    notes: 'New stock purchase'
  },
  {
    id: 'HIST007',
    warehouseId: warehouseData[1].id,
    productName: products[1].name,
    date: new Date('2024-02-25'),
    type: 'Stock Count',
    previousQty: 28,
    adjustment: 2,
    newQty: 30,
    notes: 'Monthly inventory check'
  },
  {
    id: 'HIST008',
    warehouseId: warehouseData[1].id,
    productName: products[2].name,
    date: new Date('2024-03-01'),
    type: 'Return',
    previousQty: 48,
    adjustment: 2,
    newQty: 50,
    notes: 'Customer return'
  },

  // West Branch (WH003) History
  {
    id: 'HIST009',
    warehouseId: warehouseData[2].id,
    productName: products[2].name,
    date: new Date('2024-03-01'),
    type: 'Adjusted',
    previousQty: 85,
    adjustment: 15,
    newQty: 100,
    notes: 'Stock correction'
  },
  {
    id: 'HIST010',
    warehouseId: warehouseData[2].id,
    productName: products[3].name,
    date: new Date('2024-03-05'),
    type: 'Received',
    previousQty: 0,
    adjustment: 45,
    newQty: 45,
    notes: 'Initial stock received'
  },
  {
    id: 'HIST011',
    warehouseId: warehouseData[2].id,
    productName: products[2].name,
    date: new Date('2024-03-10'),
    type: 'Stock Count',
    previousQty: 95,
    adjustment: 5,
    newQty: 100,
    notes: 'Quarterly inventory check'
  },
  {
    id: 'HIST012',
    warehouseId: warehouseData[2].id,
    productName: products[3].name,
    date: new Date('2024-03-15'),
    type: 'Damage',
    previousQty: 45,
    adjustment: -5,
    newQty: 40,
    notes: 'Items damaged in storage'
  },

  // North Branch (WH004) History
  {
    id: 'HIST013',
    warehouseId: warehouseData[3].id,
    productName: products[3].name,
    date: new Date('2024-03-15'),
    type: 'Shipped',
    previousQty: 35,
    adjustment: -10,
    newQty: 25,
    notes: 'Customer order'
  },
  {
    id: 'HIST014',
    warehouseId: warehouseData[3].id,
    productName: products[4].name,
    date: new Date('2024-03-20'),
    type: 'Received',
    previousQty: 20,
    adjustment: 30,
    newQty: 50,
    notes: 'Bulk order received'
  },
  {
    id: 'HIST015',
    warehouseId: warehouseData[3].id,
    productName: products[3].name,
    date: new Date('2024-03-25'),
    type: 'Return',
    previousQty: 20,
    adjustment: 5,
    newQty: 25,
    notes: 'Customer return - good condition'
  },
  {
    id: 'HIST016',
    warehouseId: warehouseData[3].id,
    productName: products[4].name,
    date: new Date('2024-03-30'),
    type: 'Stock Count',
    previousQty: 48,
    adjustment: 2,
    newQty: 50,
    notes: 'Monthly inventory check'
  },

  // South Branch (WH005) History
  {
    id: 'HIST017',
    warehouseId: warehouseData[4].id,
    productName: products[4].name,
    date: new Date('2024-03-25'),
    type: 'Adjusted',
    previousQty: 65,
    adjustment: 15,
    newQty: 80,
    notes: 'Inventory reconciliation'
  },
  {
    id: 'HIST018',
    warehouseId: warehouseData[4].id,
    productName: products[0].name,
    date: new Date('2024-03-30'),
    type: 'Transfer',
    previousQty: 40,
    adjustment: -5,
    newQty: 35,
    notes: 'Transfer to Main Warehouse'
  },
  {
    id: 'HIST019',
    warehouseId: warehouseData[4].id,
    productName: products[4].name,
    date: new Date('2024-04-01'),
    type: 'Stock Count',
    previousQty: 70,
    adjustment: 5,
    newQty: 75,
    notes: 'Monthly inventory reconciliation'
  },
  {
    id: 'HIST020',
    warehouseId: warehouseData[4].id,
    productName: products[0].name,
    date: new Date('2024-04-05'),
    type: 'Damage',
    previousQty: 35,
    adjustment: -5,
    newQty: 30,
    notes: 'Items damaged during storage'
  }
];

// Define 5 inventory items
export const inventoryItems: Items[] = [
  {
    id: 'INV001',
    product: products[0].name,
    warehouse: warehouseData[0].name,
    category: categories[0].name,
    quantity: 50,
    description: 'High-performance laptop for business use',
    barcode: 'BAR001',
    minimumQty: 10,
    unit: 'Units',
    status: 'Active',
    brand: 'Lenovo',
    subCategory: 'Laptops',
    dateAdded: new Date('2024-01-01')
  },
  {
    id: 'INV002',
    product: products[1].name,
    warehouse: warehouseData[1].name,
    category: categories[1].name,
    quantity: 30,
    description: 'Ergonomic office chair',
    barcode: 'BAR002',
    minimumQty: 5,
    unit: 'Units',
    status: 'Active',
    brand: 'Office Pro',
    subCategory: 'Chairs',
    dateAdded: new Date('2024-01-02')
  },
  {
    id: 'INV003',
    product: products[2].name,
    warehouse: warehouseData[2].name,
    category: categories[2].name,
    quantity: 100,
    description: 'Premium quality notebook set',
    barcode: 'BAR003',
    minimumQty: 20,
    unit: 'Sets',
    status: 'Active',
    brand: 'Premium Office',
    subCategory: 'Stationery',
    dateAdded: new Date('2024-01-03')
  },
  {
    id: 'INV004',
    product: products[3].name,
    warehouse: warehouseData[3].name,
    category: categories[3].name,
    quantity: 25,
    description: 'Professional laser printer',
    barcode: 'BAR004',
    minimumQty: 3,
    unit: 'Units',
    status: 'Active',
    brand: 'HP',
    subCategory: 'Printers',
    dateAdded: new Date('2024-01-04')
  },
  {
    id: 'INV005',
    product: products[4].name,
    warehouse: warehouseData[4].name,
    category: categories[4].name,
    quantity: 75,
    description: 'Windows 11 Pro license key',
    barcode: 'BAR005',
    minimumQty: 10,
    unit: 'Licenses',
    status: 'Active',
    brand: 'Microsoft',
    subCategory: 'Software',
    dateAdded: new Date('2024-01-05')
  }
].map(item => Object.assign(new Items(), item));

// Define 5 transfers
export const transfers: Transfer[] = [
  {
    id: 'TRF001',
    fromWarehouse: warehouseData[0].name,
    toWarehouse: warehouseData[1].name,
    noOfProducts: 20,
    quantityTransferred: 15,
    refNumber: '#458924',
    date: new Date('2024-01-15')
  },
  {
    id: 'TRF002',
    fromWarehouse: warehouseData[1].name,
    toWarehouse: warehouseData[2].name,
    noOfProducts: 10,
    quantityTransferred: 8,
    refNumber: '#458925',
    date: new Date('2024-01-16')
  },
  {
    id: 'TRF003',
    fromWarehouse: warehouseData[2].name,
    toWarehouse: warehouseData[3].name,
    noOfProducts: 15,
    quantityTransferred: 12,
    refNumber: '#458926',
    date: new Date('2024-01-17')
  },
  {
    id: 'TRF004',
    fromWarehouse: warehouseData[3].name,
    toWarehouse: warehouseData[4].name,
    noOfProducts: 25,
    quantityTransferred: 20,
    refNumber: '#458927',
    date: new Date('2024-01-18')
  },
  {
    id: 'TRF005',
    fromWarehouse: warehouseData[4].name,
    toWarehouse: warehouseData[0].name,
    noOfProducts: 30,
    quantityTransferred: 25,
    refNumber: '#458928',
    date: new Date('2024-01-19')
  }
].map(transfer => Object.assign(new Transfer(), transfer));

// Store initial data in localStorage if not present
if (!localStorage.getItem('Category')) {
  localStorage.setItem('Category', JSON.stringify(categories));
}

if (!localStorage.getItem('Asset')) {
  localStorage.setItem('Asset', JSON.stringify(assets));
}

if (!localStorage.getItem('Department')) {
  localStorage.setItem('Department', JSON.stringify(departments));
}

if (!localStorage.getItem('Location')) {
  localStorage.setItem('Location', JSON.stringify(locations));
}

if (!localStorage.getItem('PropertyType')) {
  localStorage.setItem('PropertyType', JSON.stringify(propertyTypes));
}

if (!localStorage.getItem('Transfer')) {
  localStorage.setItem('Transfer', JSON.stringify(transfers));
}

if (!localStorage.getItem('Adjustment')) {
  localStorage.setItem('Adjustment', JSON.stringify(adjustments));
}

if (!localStorage.getItem('ProductHistory')) {
  localStorage.setItem('ProductHistory', JSON.stringify(productHistory));
}

export const WarehouseData: Warehouse[] = warehouseData.map(warehouse => {
  const w = new Warehouse();
  w.id = warehouse.id;
  w.name = warehouse.name;
  w.building = warehouse.building;
  w.products = warehouse.products;
  w.person = warehouse.person;
  return w;
});

// Store initial data in localStorage if not present
if (!localStorage.getItem('Warehouse')) {
  localStorage.setItem('Warehouse', JSON.stringify(WarehouseData));
}

export const requests: RequestItem[] = [
  {
    id: 1,
    itemCode: 'RIS-20240501001',
    codeNumber: 'STK-001',
    department: 'IT Department',
    requestedBy: 'John Doe',
    deliveryLocation: 'IT Department, Admin Building, Floor 2',
    dateRequest: new Date('2024-05-01'),
    dateApproved: new Date('2024-05-02'),
    approvedBy: 'Alice Johnson',
    approverPosition: 'Department Head',
    dateIssued: new Date('2024-05-03'),
    issuedBy: 'James Wilson',
    issuerPosition: 'Supply Officer',
    status: 'Issued',
    purpose: 'For project development',
    isBeingDelivered: true,
    items: [
      {
        id: 1,
        stockNo: 'BAR001',
        itemName: 'Lenovo IdeaPad 3',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 2,
        availableQuantity: 50,
        stockAvailable: 'yes',
        issueQuantity: 2,
        remarks: 'Needed for new developers'
      },
      {
        id: 2,
        stockNo: 'BAR004',
        itemName: 'HP LaserJet Printer',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 1,
        availableQuantity: 25,
        stockAvailable: 'yes',
        issueQuantity: 1,
        remarks: 'For IT Department use'
      }
    ]
  },
  {
    id: 2,
    itemCode: 'RIS-20240502001',
    codeNumber: 'STK-002',
    department: 'HR Department',
    requestedBy: 'Jane Smith',
    deliveryLocation: 'HR Department, Admin Building, Floor 1',
    dateRequest: new Date('2024-05-02'),
    dateApproved: new Date('2024-05-03'),
    approvedBy: 'Bob Williams',
    approverPosition: 'Director',
    dateIssued: new Date('2024-05-04'),
    issuedBy: 'James Wilson',
    issuerPosition: 'Supply Officer',
    status: 'Issued',
    purpose: 'Office furniture setup',
    isBeingDelivered: true,
    items: [
      {
        id: 3,
        stockNo: 'BAR002',
        itemName: 'Office Desk Chair',
        itemType: 'Furniture',
        unit: 'Units',
        quantity: 5,
        availableQuantity: 30,
        stockAvailable: 'yes',
        issueQuantity: 5,
        remarks: 'For new hires'
      }
    ]
  },
  {
    id: 3,
    itemCode: 'RIS-20240503001',
    codeNumber: 'STK-003',
    department: 'Marketing Department',
    requestedBy: 'Michael Brown',
    deliveryLocation: 'Marketing Department, Admin Building, Floor 3',
    dateRequest: new Date('2024-05-03'),
    dateApproved: new Date('2024-05-04'),
    approvedBy: 'Catherine Green',
    approverPosition: 'HR Manager',
    dateIssued: new Date('2024-05-05'),
    issuedBy: 'James Wilson',
    issuerPosition: 'Supply Officer',
    status: 'Issued',
    purpose: 'Office supplies',
    isBeingDelivered: true,
    items: [
      {
        id: 4,
        stockNo: 'BAR003',
        itemName: 'Premium Notebook Set',
        itemType: 'Stationery',
        unit: 'Sets',
        quantity: 10,
        availableQuantity: 100,
        stockAvailable: 'yes',
        issueQuantity: 10,
        remarks: 'For marketing campaign planning'
      }
    ]
  },
  {
    id: 4,
    itemCode: 'RIS-20240504001',
    codeNumber: 'STK-004',
    department: 'Finance Department',
    requestedBy: 'Robert Johnson',
    deliveryLocation: 'Finance Department, Admin Building, Floor 3',
    dateRequest: new Date('2024-05-04'),
    dateApproved: new Date('2024-05-05'),
    approvedBy: 'Diana Prince',
    approverPosition: 'Finance Manager',
    dateIssued: new Date('2024-05-06'),
    issuedBy: 'Peter Parker',
    issuerPosition: 'Supply Officer',
    status: 'Issued',
    purpose: 'Software licenses for new employees',
    isBeingDelivered: true,
    items: [
      {
        id: 5,
        stockNo: 'BAR005',
        itemName: 'Windows 11 Pro License',
        itemType: 'Software',
        unit: 'Licenses',
        quantity: 5,
        availableQuantity: 75,
        stockAvailable: 'yes',
        issueQuantity: 5,
        remarks: 'For new accounting staff'
      }
    ]
  },
  {
    id: 5,
    itemCode: 'RIS-20240505001',
    codeNumber: 'STK-005',
    department: 'IT Department',
    requestedBy: 'Sarah Wilson',
    deliveryLocation: 'IT Department, Admin Building, Floor 2',
    dateRequest: new Date('2024-05-05'),
    dateApproved: new Date('2024-05-06'),
    approvedBy: 'Ethan Hunt',
    approverPosition: 'Operations Manager',
    dateIssued: new Date('2024-05-07'),
    issuedBy: 'Tony Stark',
    issuerPosition: 'Supply Officer',
    status: 'Returned',
    purpose: 'Temporary project needs',
    remarks: 'Items returned in good condition',
    items: [
      {
        id: 6,
        stockNo: 'BAR001',
        itemName: 'Lenovo IdeaPad 3',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 1,
        availableQuantity: 50,
        stockAvailable: 'yes',
        issueQuantity: 1,
        remarks: 'For temporary staff'
      }
    ]
  },
  {
    id: 6,
    itemCode: 'RIS-20240506001',
    codeNumber: 'STK-006',
    department: 'Operations Department',
    requestedBy: 'Alex Turner',
    deliveryLocation: 'Operations Department, Admin Building, Floor 4',
    dateRequest: new Date('2024-05-06'),
    dateApproved: new Date('2024-05-07'),
    approvedBy: 'Bruce Wayne',
    approverPosition: 'Department Head',
    dateIssued: new Date('2024-05-08'),
    issuedBy: 'Clark Kent',
    issuerPosition: 'Supply Officer',
    status: 'Issued',
    purpose: 'Equipment for new operations team',
    isBeingDelivered: true,
    items: [
      {
        id: 7,
        stockNo: 'BAR001',
        itemName: 'Lenovo IdeaPad 3',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 10,
        availableQuantity: 50,
        stockAvailable: 'yes',
        issueQuantity: 10,
        remarks: 'For new operations team'
      },
      {
        id: 8,
        stockNo: 'BAR002',
        itemName: 'Office Desk Chair',
        itemType: 'Furniture',
        unit: 'Units',
        quantity: 10,
        availableQuantity: 30,
        stockAvailable: 'yes',
        issueQuantity: 10,
        remarks: 'For new operations team'
      }
    ]
  },
  {
    id: 7,
    itemCode: 'RIS-20240507001',
    codeNumber: 'STK-007',
    department: 'Sales Department',
    requestedBy: 'Emma Lee',
    deliveryLocation: 'Sales Department, East Building, Floor 2',
    dateRequest: new Date('2024-05-07'),
    dateApproved: new Date('2024-05-08'),
    approvedBy: 'Steve Rogers',
    approverPosition: 'Sales Director',
    dateIssued: new Date('2024-05-09'),
    issuedBy: 'Natasha Romanoff',
    issuerPosition: 'Supply Officer',
    status: 'Issued',
    purpose: 'Sales team equipment upgrade',
    isBeingDelivered: true,
    items: [
      {
        id: 9,
        stockNo: 'BAR009',
        itemName: 'Premium Notebook Set',
        itemType: 'Stationery',
        unit: 'Sets',
        quantity: 8,
        availableQuantity: 100,
        stockAvailable: 'yes',
        issueQuantity: 8,
        remarks: 'For sales presentations'
      },
      {
        id: 10,
        stockNo: 'BAR010',
        itemName: 'HP LaserJet Printer',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 4,
        availableQuantity: 25,
        stockAvailable: 'yes',
        issueQuantity: 4,
        remarks: 'For sales documentation'
      }
    ]
  },
  {
    id: 8,
    itemCode: 'RIS-20240508001',
    codeNumber: 'STK-008',
    department: 'IT Department',
    requestedBy: 'David Wilson',
    deliveryLocation: 'IT Department, Admin Building, Floor 2',
    dateRequest: new Date('2024-05-08'),
    status: 'Pending',
    purpose: 'Network equipment upgrade',
    items: [
      {
        id: 11,
        stockNo: 'BAR011',
        itemName: 'Cisco Router',
        itemType: 'Electronics',
        unit: 'Units',
        quantity: 2,
        availableQuantity: 15,
        stockAvailable: 'yes',
        remarks: 'For network upgrade'
      }
    ]
  },
  {
    id: 9,
    itemCode: 'RIS-20240509001',
    codeNumber: 'STK-009',
    department: 'HR Department',
    requestedBy: 'Sophie Miller',
    deliveryLocation: 'HR Department, Admin Building, Floor 1',
    dateRequest: new Date('2024-05-09'),
    dateApproved: new Date('2024-05-10'),
    approvedBy: 'Bob Williams',
    approverPosition: 'Director',
    status: 'Approved',
    purpose: 'Training materials',
    items: [
      {
        id: 12,
        stockNo: 'BAR012',
        itemName: 'Training Manuals',
        itemType: 'Books',
        unit: 'Sets',
        quantity: 15,
        availableQuantity: 50,
        stockAvailable: 'yes',
        remarks: 'For new employee orientation'
      }
    ]
  },
  {
    id: 10,
    itemCode: 'RIS-20240510001',
    codeNumber: 'STK-010',
    department: 'Marketing Department',
    requestedBy: 'Thomas Anderson',
    deliveryLocation: 'Marketing Department, Admin Building, Floor 3',
    dateRequest: new Date('2024-05-10'),
    status: 'Pending',
    purpose: 'Marketing event materials',
    items: [
      {
        id: 13,
        stockNo: 'BAR013',
        itemName: 'Event Banner',
        itemType: 'Marketing Material',
        unit: 'Pieces',
        quantity: 5,
        availableQuantity: 20,
        stockAvailable: 'yes',
        remarks: 'For upcoming trade show'
      },
      {
        id: 14,
        stockNo: 'BAR014',
        itemName: 'Promotional Brochures',
        itemType: 'Marketing Material',
        unit: 'Boxes',
        quantity: 10,
        availableQuantity: 50,
        stockAvailable: 'yes',
        remarks: 'For upcoming trade show'
      }
    ]
  }
];

export const borrowedItems: BorrowItem[] = [
  {
    id: 1,
    itemCode: 'BRW-001',
    department: 'IT',
    borrowedBy: 'John Doe',
    dateBorrowed: new Date('2024-03-25'),
    returnDate: new Date('2024-03-30'),
    purpose: 'Project Presentation',
    status: 'Pending',
    items: [
      {
        itemName: 'Laptop',
        itemType: 'Electronics',
        quantity: 2,
        availableQuantity: 8
      }
    ]
  },
  {
    id: 2,
    itemCode: 'BRW-002',
    department: 'Marketing',
    borrowedBy: 'Jane Smith',
    dateBorrowed: new Date('2024-03-24'),
    returnDate: new Date('2024-03-26'),
    purpose: 'Client Meeting',
    status: 'Borrowed',
    items: [
      {
        itemName: 'Projector',
        itemType: 'Electronics',
        quantity: 1,
        availableQuantity: 4
      }
    ]
  },
  {
    id: 3,
    itemCode: 'BRW-003',
    department: 'HR',
    borrowedBy: 'Mike Johnson',
    dateBorrowed: new Date('2024-03-23'),
    returnDate: new Date('2024-03-24'),
    purpose: 'Training Session',
    status: 'Returned',
    items: [
      {
        itemName: 'Camera',
        itemType: 'Electronics',
        quantity: 1,
        availableQuantity: 2
      }
    ]
  }
];

export const stockOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' }
];

export const commonUnits = [
  'Piece',
  'Unit',
  'Box',
  'Pack',
  'Ream',
  'Set',
  'Roll',
  'Bundle',
  'Dozen',
  'Bottle'
];

export const positions: Position[] = [
  { id: 'POS001', name: 'Warehouse Manager' },
  { id: 'POS002', name: 'Stock Controller' },
  { id: 'POS003', name: 'Inventory Supervisor' }
];

// Sample stock details
export const stockDetails: StockDetail[] = [
  {
    id: '1',
    itemName: 'Laptop Dell XPS 13',
    category: 'Electronics',
    quantity: 3,
    unit: 'pcs',
    unitPrice: 1200,
    isVerified: false,
    deliveryStatus: 'Under Delivery',
    itemCode: 'IT-LAP-001',
    itemType: 'Equipment'
  },
  {
    id: '2',
    itemName: 'Monitor 24" Dell',
    category: 'Electronics', 
    quantity: 5,
    unit: 'pcs',
    unitPrice: 250,
    isVerified: false,
    deliveryStatus: 'Under Delivery',
    itemCode: 'IT-MON-001',
    itemType: 'Equipment'
  },
  // Add more stock details as needed
];

// Sample delivered stocks
export const deliveredStocks: DeliveredStock[] = [
  {
    id: 'DEL-001',
    supplier: 'John Doe',
    receiptNo: '001',
    requisitionNumber: 'RIS-20240501001',
    dateDelivered: new Date('2024-05-05'),
    department: 'IT Department',
    status: 'Completed',
    requestedBy: 'John Doe',
    dateRequested: new Date('2024-05-01'),
    approvedBy: 'Alice Johnson',
    issuedBy: 'James Wilson',
    deliveryAddress: 'IT Department, Admin Building, Floor 2',
    purpose: 'For project development',
    details: [
      {
        id: 'ITEM-001',
        itemName: 'Lenovo IdeaPad 3',
        itemCode: 'BAR001',
        itemType: 'Electronics',
        category: 'Electronics',
        quantity: 2,
        unit: 'Units',
        unitPrice: 45000,
        isVerified: true,
        deliveryStatus: 'Completed',
        dateReceived: new Date('2024-05-05')
      },
      {
        id: 'ITEM-002',
        itemName: 'HP LaserJet Printer',
        itemCode: 'BAR004',
        itemType: 'Electronics',
        category: 'Electronics',
        quantity: 1,
        unit: 'Units',
        unitPrice: 15000,
        isVerified: true,
        deliveryStatus: 'Completed',
        dateReceived: new Date('2024-05-05')
      }
    ]
  },
  {
    id: 'DEL-002',
    supplier: 'Jane Smith',
    receiptNo: '002',
    requisitionNumber: 'RIS-20240502001',
    dateDelivered: new Date('2024-05-07'),
    department: 'HR Department',
    status: 'Completed',
    requestedBy: 'Jane Smith',
    dateRequested: new Date('2024-05-02'),
    approvedBy: 'Bob Williams',
    issuedBy: 'James Wilson',
    deliveryAddress: 'HR Department, Admin Building, Floor 1',
    purpose: 'Office furniture setup',
    details: [
      {
        id: 'ITEM-003',
        itemName: 'Office Desk Chair',
        itemCode: 'BAR002',
        itemType: 'Furniture',
        category: 'Furniture',
        quantity: 5,
        unit: 'Units',
        unitPrice: 3500,
        isVerified: true,
        deliveryStatus: 'Completed',
        dateReceived: new Date('2024-05-07')
      }
    ]
  },
  {
    id: 'DEL-003',
    supplier: 'Michael Brown',
    receiptNo: '003',
    requisitionNumber: 'RIS-20240503001',
    dateDelivered: new Date('2024-05-08'),
    department: 'Marketing Department',
    status: 'Completed',
    requestedBy: 'Michael Brown',
    dateRequested: new Date('2024-05-03'),
    approvedBy: 'Catherine Green',
    issuedBy: 'James Wilson',
    deliveryAddress: 'Marketing Department, Admin Building, Floor 3',
    purpose: 'Office supplies',
    details: [
      {
        id: 'ITEM-004',
        itemName: 'Premium Notebook Set',
        itemCode: 'BAR003',
        itemType: 'Stationery',
        category: 'Stationery',
        quantity: 10,
        unit: 'Sets',
        unitPrice: 450,
        isVerified: true,
        deliveryStatus: 'Completed',
        dateReceived: new Date('2024-05-08')
      }
    ]
  },
  {
    id: 'DEL-004',
    supplier: 'Robert Johnson',
    receiptNo: '004',
    requisitionNumber: 'RIS-20240504001', 
    dateDelivered: new Date('2024-05-10'),
    department: 'Finance Department',
    status: 'Cancelled',
    requestedBy: 'Robert Johnson',
    dateRequested: new Date('2024-05-04'),
    approvedBy: 'Diana Prince',
    issuedBy: 'Peter Parker',
    deliveryAddress: 'Finance Department, Admin Building, Floor 3',
    remarks: 'Order cancelled due to budget constraints',
    cancelledBy: 'Diana Prince',
    cancellerPosition: 'Finance Manager',
    cancellationDate: new Date('2024-05-09'),
    purpose: 'Software licenses for new employees',
    details: [
      {
        id: 'ITEM-005',
        itemName: 'Windows 11 Pro License',
        itemCode: 'BAR005',
        itemType: 'Software',
        category: 'Software',
        quantity: 5,
        unit: 'Licenses',
        unitPrice: 12000,
        isVerified: false,
        deliveryStatus: 'Cancelled'
      }
    ]
  },
  {
    id: 'DEL-005',
    supplier: 'Sarah Wilson',
    receiptNo: '005',
    requisitionNumber: 'RIS-20240505001',
    dateDelivered: new Date('2024-05-11'),
    department: 'IT Department',
    status: 'Returned',
    requestedBy: 'Sarah Wilson',
    dateRequested: new Date('2024-05-05'),
    approvedBy: 'Ethan Hunt',
    issuedBy: 'Tony Stark',
    deliveryAddress: 'IT Department, Admin Building, Floor 2',
    remarks: 'Items returned due to wrong specifications',
    purpose: 'Temporary project needs',
    details: [
      {
        id: 'ITEM-006',
        itemName: 'Lenovo IdeaPad 3',
        itemCode: 'BAR001',
        itemType: 'Electronics',
        category: 'Electronics',
        quantity: 1,
        unit: 'Units',
        unitPrice: 45000,
        isVerified: true,
        deliveryStatus: 'Returned'
      }
    ]   
  },
  {
    id: 'DEL-006',
    supplier: 'Alex Turner',
    receiptNo: '006',
    requisitionNumber: 'RIS-20240506001',
    dateDelivered: new Date('2024-05-13'),
    department: 'Operations Department',
    status: 'Incomplete',
    requestedBy: 'Alex Turner',
    dateRequested: new Date('2024-05-06'),
    approvedBy: 'Bruce Wayne',
    issuedBy: 'Clark Kent',
    deliveryAddress: 'Operations Department, Admin Building, Floor 4',
    remarks: 'Partial delivery due to stock limitations',
    followUpAction: 'Remaining items to be delivered by end of month',
    expectedCompletionDate: new Date('2024-05-30'),
    purpose: 'Equipment for new operations team',
    details: [
      {
        id: 'ITEM-007',
        itemName: 'Lenovo IdeaPad 3',
        itemCode: 'BAR001',
        itemType: 'Electronics',
        category: 'Computer Equipment',
        quantity: 10,
        deliveredQuantity: 6,
        unit: 'Units',
        unitPrice: 12000,
        isVerified: true,
        deliveryStatus: 'Incomplete'
      },
      {
        id: 'ITEM-008',
        itemName: 'Office Desk Chair',
        itemCode: 'BAR002',
        itemType: 'Furniture',
        category: 'Office Furniture',
        quantity: 10,
        deliveredQuantity: 10,
        unit: 'Units',
        unitPrice: 2999.99,
        isVerified: true,
        deliveryStatus: 'Completed'
      }
    ]
  },
  {
    id: 'DEL-007',
    supplier: 'Emma Lee',
    receiptNo: '007',
    requisitionNumber: 'RIS-20240507001',
    dateDelivered: new Date('2024-05-15'),
    department: 'Sales Department',
    status: 'Under Delivery',
    subStatus: 'In Transit',
    statusUpdateTime: new Date('2024-05-14'),
    requestedBy: 'Emma Lee',
    dateRequested: new Date('2024-05-07'),
    approvedBy: 'Steve Rogers',
    issuedBy: 'Natasha Romanoff',
    deliveryAddress: 'Sales Department, East Building, Floor 2',
    purpose: 'Sales team equipment upgrade',
    details: [
      {
        id: 'ITEM-009',
        itemName: 'Premium Notebook Set',
        itemCode: 'BAR009',
        itemType: 'Stationery',
        category: 'Office Supplies',
        quantity: 8,
        unit: 'Sets',
        unitPrice: 450,
        isVerified: true,
        deliveryStatus: 'Under Delivery'
      },
      {
        id: 'ITEM-010',
        itemName: 'HP LaserJet Printer',
        itemCode: 'BAR010',
        itemType: 'Electronics',
        category: 'Office Equipment',
        quantity: 4,
        unit: 'Units',
        unitPrice: 15000,
        isVerified: true,
        deliveryStatus: 'Under Delivery'
      }
    ]
  }
];

// Add quotation request dummy data
export const quotationRequestsList: QuotationRequest[] = [
  (() => {
    const request1 = new QuotationRequest();
    request1.id = 'REQ-001';
    request1.supplierId = 'SUP-001';
    request1.subject = 'Request for Quotation';
    request1.message = 'We need a quotation for office supplies.';
    request1.attachments = ['specification.pdf'];
    request1.dateRequested = new Date(2023, 5, 15);
    request1.status = 'pending';
    request1.supplierName = 'ABC Office Supplies';
    request1.supplierContact = '+639123456789';
    request1.supplierEmail = 'abc@example.com';
    return request1;
  })(),
  (() => {
    const request2 = new QuotationRequest();
    request2.id = 'REQ-002';
    request2.supplierId = 'SUP-002';
    request2.subject = 'Request for IT Equipment';
    request2.message = 'We need a quotation for new computer equipment.';
    request2.attachments = ['it_requirements.pdf', 'specifications.pdf'];
    request2.dateRequested = new Date(2023, 5, 20);
    request2.status = 'pending';
    request2.supplierName = 'Tech Solutions Inc.';
    request2.supplierContact = '+639187654321';
    request2.supplierEmail = 'tech@example.com';
    return request2;
  })(),
  (() => {
    const request3 = new QuotationRequest();
    request3.id = 'REQ-003';
    request3.supplierId = 'SUP-003';
    request3.subject = 'Request for Office Furniture';
    request3.message = 'We need a quotation for new office furniture including desks, chairs, and filing cabinets.';
    request3.attachments = ['furniture_specs.pdf'];
    request3.dateRequested = new Date(2023, 6, 5);
    request3.status = 'approved';
    request3.supplierName = 'Furniture Solutions';
    request3.supplierContact = '+639234567890';
    request3.supplierEmail = 'furniture@example.com';
    request3.price = 75000;
    request3.estimatedDeliveryDate = new Date(2023, 7, 15);
    request3.responseNotes = 'Price includes delivery and installation.';
    request3.responseDate = new Date(2023, 6, 10);
    return request3;
  })(),
  (() => {
    const request4 = new QuotationRequest();
    request4.id = 'REQ-004';
    request4.supplierId = 'SUP-004';
    request4.subject = 'Request for Cleaning Supplies';
    request4.message = 'We need a quotation for cleaning materials for the office.';
    request4.attachments = ['cleaning_list.pdf'];
    request4.dateRequested = new Date(2023, 6, 12);
    request4.status = 'rejected';
    request4.supplierName = 'Clean & Shine Co.';
    request4.supplierContact = '+639345678901';
    request4.supplierEmail = 'clean@example.com';
    request4.responseNotes = 'Unable to provide all requested items at the moment.';
    request4.responseDate = new Date(2023, 6, 15);
    return request4;
  })()
];

// Special Receiving Dummy Data - Moved from receiving.service.ts
export const SPECIAL_RECEIVING_DUMMY_DATA: ReceivingItem[] = [
  {
    id: 'SR-001',
    itemName: 'Laboratory Equipment',
    description: 'High-precision microscope with digital imaging capability',
    quantity: 1,
    unit: 'unit',
    condition: 'new',
    donor: 'Science Foundation Inc.',
    receivedDate: new Date('2024-02-15'),
    status: 'pending',
    type: 'special',
    remarks: 'Donated for research department'
  },
  {
    id: 'SR-002',
    itemName: 'Server Rack',
    description: '42U Server Rack with cooling system',
    quantity: 2,
    unit: 'unit',
    condition: 'new',
    donor: 'Tech Solutions Corp',
    receivedDate: new Date('2024-02-20'),
    status: 'approved',
    type: 'special',
    remarks: 'For data center expansion'
  },
  {
    id: 'SR-003',
    itemName: 'Medical Equipment',
    description: 'Portable ultrasound machine',
    quantity: 1,
    unit: 'set',
    condition: 'good',
    donor: 'Healthcare Partners Ltd',
    receivedDate: new Date('2024-02-25'),
    status: 'pending',
    type: 'special',
    remarks: 'For medical department'
  },
  {
    id: 'SR-004',
    itemName: 'Solar Panel System',
    description: '10kW Solar Panel System with Inverters',
    quantity: 1,
    unit: 'set',
    condition: 'new',
    donor: 'Green Energy Solutions',
    receivedDate: new Date('2024-03-01'),
    status: 'rejected',
    type: 'special',
    remarks: 'Rejected due to incomplete documentation'
  },
  {
    id: 'SR-005',
    itemName: 'Industrial 3D Printer',
    description: 'Large format industrial 3D printer with materials',
    quantity: 1,
    unit: 'unit',
    condition: 'new',
    donor: 'Manufacturing Innovations Co.',
    receivedDate: new Date('2024-03-05'),
    status: 'approved',
    type: 'special',
    remarks: 'For engineering department prototyping lab'
  }
];

// Supplies Receiving Dummy Data
export const SUPPLIES_RECEIVING_DUMMY_DATA: ReceivingItem[] = [
  {
    id: 'SUP-001',
    itemName: 'Printer Paper',
    description: 'A4 size, 80gsm white paper',
    quantity: 100,
    unit: 'ream',
    condition: 'new',
    supplier: 'Office Depot Inc.',
    category: 'office_supplies',
    receivedDate: new Date('2024-03-01'),
    storageLocation: 'Storage Room A1',
    status: 'pending',
    type: 'supplies',
    remarks: 'Monthly office supply'
  },
  {
    id: 'SUP-002',
    itemName: 'Hand Sanitizer',
    description: '500ml antibacterial hand sanitizer',
    quantity: 50,
    unit: 'bottle',
    condition: 'new',
    supplier: 'Cleaning Supplies Co.',
    category: 'cleaning_materials',
    receivedDate: new Date('2024-03-02'),
    expiryDate: new Date('2025-03-02'),
    storageLocation: 'Storage Room B2',
    status: 'approved',
    type: 'supplies',
    remarks: 'COVID-19 supplies'
  },
  {
    id: 'SUP-003',
    itemName: 'Printer Toner',
    description: 'HP LaserJet Black Toner Cartridge',
    quantity: 20,
    unit: 'pc',
    condition: 'new',
    supplier: 'Tech Supplies Ltd',
    category: 'computer_supplies',
    receivedDate: new Date('2024-03-03'),
    storageLocation: 'IT Storage Room',
    status: 'pending',
    type: 'supplies',
    remarks: 'Quarterly IT supplies'
  }
];

// Fixed Asset Receiving Dummy Data
export const FIXED_ASSET_RECEIVING_DUMMY_DATA: ReceivingItem[] = [
  {
    id: 'FA-001',
    itemName: 'Desktop Computer',
    description: 'High-performance workstation for CAD applications',
    serialNumber: 'DC2024001',
    model: 'HP Z4 G4',
    manufacturer: 'HP',
    quantity: 1,
    unit: 'unit',
    condition: 'new',
    receivedDate: new Date('2024-03-01'),
    purchaseDate: new Date('2024-02-15'),
    purchasePrice: 85000,
    category: 'it_assets',
    location: 'Engineering Department',
    status: 'pending',
    type: 'fixed_asset',
    remarks: 'For CAD team use'
  },
  {
    id: 'FA-002',
    itemName: 'Conference Room Table',
    description: 'Large oval conference table with cable management',
    serialNumber: 'FRN2024015',
    model: 'Executive Series',
    manufacturer: 'Office Solutions Inc.',
    quantity: 1,
    unit: 'set',
    condition: 'new',
    receivedDate: new Date('2024-03-02'),
    purchaseDate: new Date('2024-02-20'),
    purchasePrice: 45000,
    category: 'furniture',
    location: 'Main Conference Room',
    status: 'approved',
    type: 'fixed_asset',
    remarks: 'Part of office renovation project'
  }
];

// Combined receiving items for initial load
export const ALL_RECEIVING_DUMMY_DATA: ReceivingItem[] = [
  ...SPECIAL_RECEIVING_DUMMY_DATA,
  ...SUPPLIES_RECEIVING_DUMMY_DATA,
  ...FIXED_ASSET_RECEIVING_DUMMY_DATA
];

// Data version constant for versioning
export const RECEIVING_DATA_VERSION = '1.0.0';
