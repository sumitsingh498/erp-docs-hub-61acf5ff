export type ERPModule = 'Master' | 'Material' | 'Quality' | 'Marketing' | 'Security' | 'Sale' | 'Finance' | 'Production' | 'PPC/MRP';
export type ERPType = 'FORM' | 'REPORT' | 'MENU' | 'QUERY';
export type ERPStatus = 'Active' | 'In Development' | 'Testing' | 'Deprecated';
export type Priority = 'High' | 'Medium' | 'Low';
export type ReportCategory = 'MIS' | 'Operational' | 'Statutory' | 'Analytical';

export interface ERPMasterItem {
  id: string;
  parentId: string | null;
  module: ERPModule;
  subModule: string;
  originalId: string;
  displayName: string;
  originalName: string;
  type: ERPType;
  fileName: string;
  status: ERPStatus;
  owner: string;
  priority: Priority;
  percentComplete: number;
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuNode {
  id: string;
  label: string;
  module: ERPModule;
  children: MenuNode[];
  formId?: string;
}

export interface ReportItem {
  id: string;
  name: string;
  module: ERPModule;
  category: ReportCategory;
  frequency: string;
  usedByRole: string;
  exportFormat: string;
  status: ERPStatus;
  description: string;
  createdBy: string;
  assignee: string;
  approvedBy: string;
  sopAvailable: boolean;
  attachments: { name: string; type: string; size: string; uploadedBy: string; uploadedAt: string }[];
}

export interface TechnicalMapping {
  id: string;
  formId: string;
  formName: string;
  tableName: string;
  apiEndpoint: string;
  logicDescription: string;
  module: ERPModule;
}

export interface SOPItem {
  formId: string;
  title: string;
  objective: string;
  scope: string;
  steps: { step: number; action: string; responsible: string; output: string }[];
  references: string[];
  version: string;
  lastUpdated: string;
  approvedBy: string;
}

export const MODULES: ERPModule[] = ['Master', 'Material', 'Quality', 'Marketing', 'Security', 'Sale', 'Finance', 'Production', 'PPC/MRP'];

// GoERP.ai Company Info
export const companyInfo = {
  name: "GoERP.ai",
  tagline: "Perfect ERP Fit for Any Business Scale",
  formerly: "Formally Known as TERMS",
  parentCompany: "Mawai Infotech Limited",
  experience: "26+ Years",
  address: "A-164, Sector 63, Noida, Uttar Pradesh 201307",
  email: "manish@mawaimail.com",
  phone: "+91 9810672829",
  solutions: ["ERP", "AI Solutions", "RPA", "IOT", "BI Tool", "Plant Automation", "B2B Portals", "Mobile Apps", "HRM", "CRM", "GST Solutions"],
  industries: ["Fasteners", "Heavy Equipments", "Agriculture Equipment", "Automotive", "Pharmaceutical", "FMCG", "Textile", "Sports", "Distilleries"],
  deploymentModes: ["On-Cloud", "On-Premise", "SaaS"],
  implementationSteps: ["Discussion", "Concepts & Initiatives", "Testing & Trying", "Execute & Install"],
};

export const erpMasterData: ERPMasterItem[] = [
  { id: '1', parentId: null, module: 'Master', subModule: 'Item Master', originalId: 'ERP0000000074', displayName: 'Item Master Entry', originalName: 'F_ITEM_MASTER.FMX', type: 'FORM', fileName: 'F_ITEM_MASTER.FMX', status: 'Active', owner: 'Rajesh K.', priority: 'High', percentComplete: 100, remarks: 'Core master form', createdAt: '2025-01-15', updatedAt: '2026-03-01' },
  { id: '2', parentId: null, module: 'Material', subModule: 'Stock', originalId: 'MTL0000000631', displayName: 'Physical Stock Verification', originalName: 'PHY_STK.FMX', type: 'FORM', fileName: 'PHY_STK.FMX', status: 'Active', owner: 'Amit S.', priority: 'High', percentComplete: 95, remarks: 'Cycle count form', createdAt: '2025-02-01', updatedAt: '2026-02-28' },
  { id: '3', parentId: null, module: 'Finance', subModule: 'Adjustments', originalId: 'ERP0000000112', displayName: 'FG Stock Adjustment', originalName: 'F_FG_ADJ.FMX', type: 'FORM', fileName: 'F_FG_ADJ.FMX', status: 'In Development', owner: 'Priya M.', priority: 'Medium', percentComplete: 60, remarks: 'Pending approval workflow', createdAt: '2025-03-10', updatedAt: '2026-03-15' },
  { id: '4', parentId: null, module: 'Production', subModule: 'Work Order', originalId: 'ENG0000000021', displayName: 'Production Work Order', originalName: 'F_WORK_ORD.FMX', type: 'FORM', fileName: 'F_WORK_ORD.FMX', status: 'Active', owner: 'Suresh R.', priority: 'High', percentComplete: 100, remarks: 'Linked to BOM', createdAt: '2025-01-20', updatedAt: '2026-01-15' },
  { id: '5', parentId: null, module: 'Sale', subModule: 'Order Entry', originalId: 'SAL0000000045', displayName: 'Sales Order Entry', originalName: 'F_SALES_ORD.FMX', type: 'FORM', fileName: 'F_SALES_ORD.FMX', status: 'Active', owner: 'Neha G.', priority: 'High', percentComplete: 100, remarks: '', createdAt: '2025-02-10', updatedAt: '2026-02-20' },
  { id: '6', parentId: null, module: 'Quality', subModule: 'Inspection', originalId: 'QC0000000018', displayName: 'Quality Inspection Report', originalName: 'R_QC_INSP.FMX', type: 'REPORT', fileName: 'R_QC_INSP.FMX', status: 'Active', owner: 'Vikram T.', priority: 'Medium', percentComplete: 90, remarks: 'Auto-generated', createdAt: '2025-04-01', updatedAt: '2026-03-10' },
  { id: '7', parentId: null, module: 'Marketing', subModule: 'Campaign', originalId: 'MKT0000000033', displayName: 'Campaign Tracker', originalName: 'F_CAMPAIGN.FMX', type: 'FORM', fileName: 'F_CAMPAIGN.FMX', status: 'Testing', owner: 'Anita P.', priority: 'Low', percentComplete: 75, remarks: 'UAT scheduled', createdAt: '2025-05-15', updatedAt: '2026-03-18' },
  { id: '8', parentId: null, module: 'Security', subModule: 'Access Control', originalId: 'SEC0000000009', displayName: 'User Role Assignment', originalName: 'F_USER_ROLE.FMX', type: 'FORM', fileName: 'F_USER_ROLE.FMX', status: 'Active', owner: 'Admin', priority: 'High', percentComplete: 100, remarks: 'RBAC core', createdAt: '2025-01-05', updatedAt: '2026-01-10' },
  { id: '9', parentId: null, module: 'PPC/MRP', subModule: 'Planning', originalId: 'PPC0000000055', displayName: 'MRP Run Schedule', originalName: 'F_MRP_RUN.FMX', type: 'FORM', fileName: 'F_MRP_RUN.FMX', status: 'In Development', owner: 'Kiran D.', priority: 'High', percentComplete: 40, remarks: 'Awaiting BOM validation', createdAt: '2025-06-01', updatedAt: '2026-03-19' },
  { id: '10', parentId: null, module: 'Master', subModule: 'Vendor', originalId: 'ERP0000000088', displayName: 'Vendor Master Entry', originalName: 'F_VENDOR.FMX', type: 'FORM', fileName: 'F_VENDOR.FMX', status: 'Active', owner: 'Rajesh K.', priority: 'Medium', percentComplete: 100, remarks: '', createdAt: '2025-01-18', updatedAt: '2026-02-15' },
  { id: '11', parentId: null, module: 'Material', subModule: 'GRN', originalId: 'MTL0000000645', displayName: 'Goods Receipt Note', originalName: 'F_GRN.FMX', type: 'FORM', fileName: 'F_GRN.FMX', status: 'Active', owner: 'Amit S.', priority: 'High', percentComplete: 100, remarks: 'Linked to PO', createdAt: '2025-02-05', updatedAt: '2026-03-01' },
  { id: '12', parentId: null, module: 'Finance', subModule: 'GL', originalId: 'FIN0000000201', displayName: 'General Ledger Posting', originalName: 'F_GL_POST.FMX', type: 'FORM', fileName: 'F_GL_POST.FMX', status: 'Active', owner: 'Priya M.', priority: 'High', percentComplete: 100, remarks: 'Daily batch', createdAt: '2025-03-01', updatedAt: '2026-02-28' },
  { id: '13', parentId: null, module: 'Finance', subModule: 'Reports', originalId: 'FIN0000000215', displayName: 'Trial Balance Report', originalName: 'R_TRIAL_BAL.FMX', type: 'REPORT', fileName: 'R_TRIAL_BAL.FMX', status: 'Active', owner: 'Priya M.', priority: 'High', percentComplete: 100, remarks: 'Statutory', createdAt: '2025-03-05', updatedAt: '2026-03-01' },
  { id: '14', parentId: null, module: 'Material', subModule: 'Inventory', originalId: 'MTL0000000660', displayName: 'Stock Ledger Report', originalName: 'R_STK_LEDGER.FMX', type: 'REPORT', fileName: 'R_STK_LEDGER.FMX', status: 'Active', owner: 'Amit S.', priority: 'Medium', percentComplete: 85, remarks: '', createdAt: '2025-02-15', updatedAt: '2026-03-10' },
  { id: '15', parentId: null, module: 'Sale', subModule: 'Dispatch', originalId: 'SAL0000000060', displayName: 'Dispatch Note', originalName: 'F_DISPATCH.FMX', type: 'FORM', fileName: 'F_DISPATCH.FMX', status: 'Testing', owner: 'Neha G.', priority: 'Medium', percentComplete: 70, remarks: 'Integration pending', createdAt: '2025-02-20', updatedAt: '2026-03-12' },
  { id: '16', parentId: null, module: 'Production', subModule: 'BOM', originalId: 'ENG0000000035', displayName: 'Bill of Materials', originalName: 'F_BOM.FMX', type: 'FORM', fileName: 'F_BOM.FMX', status: 'Active', owner: 'Suresh R.', priority: 'High', percentComplete: 100, remarks: 'Multi-level BOM', createdAt: '2025-01-25', updatedAt: '2026-02-10' },
  { id: '17', parentId: null, module: 'Master', subModule: 'Customer', originalId: 'ERP0000000095', displayName: 'Customer Master', originalName: 'F_CUSTOMER.FMX', type: 'FORM', fileName: 'F_CUSTOMER.FMX', status: 'Active', owner: 'Rajesh K.', priority: 'High', percentComplete: 100, remarks: '', createdAt: '2025-01-20', updatedAt: '2026-02-20' },
  { id: '18', parentId: null, module: 'Quality', subModule: 'Testing', originalId: 'QC0000000025', displayName: 'Material Test Certificate', originalName: 'R_MTC.FMX', type: 'REPORT', fileName: 'R_MTC.FMX', status: 'Active', owner: 'Vikram T.', priority: 'Medium', percentComplete: 100, remarks: '', createdAt: '2025-04-10', updatedAt: '2026-03-05' },
  { id: '19', parentId: null, module: 'PPC/MRP', subModule: 'Scheduling', originalId: 'PPC0000000062', displayName: 'Production Schedule', originalName: 'F_PROD_SCHED.FMX', type: 'FORM', fileName: 'F_PROD_SCHED.FMX', status: 'In Development', owner: 'Kiran D.', priority: 'High', percentComplete: 55, remarks: 'Capacity planning', createdAt: '2025-06-05', updatedAt: '2026-03-18' },
  { id: '20', parentId: null, module: 'Finance', subModule: 'AP', originalId: 'FIN0000000230', displayName: 'Accounts Payable Invoice', originalName: 'F_AP_INV.FMX', type: 'FORM', fileName: 'F_AP_INV.FMX', status: 'Active', owner: 'Priya M.', priority: 'High', percentComplete: 100, remarks: '3-way match', createdAt: '2025-03-15', updatedAt: '2026-03-01' },
];

export const reportData: ReportItem[] = [
  { id: 'R1', name: 'Trial Balance', module: 'Finance', category: 'Statutory', frequency: 'Monthly', usedByRole: 'CFO, Accountant', exportFormat: 'Excel, PDF', status: 'Active', description: 'Monthly trial balance for all GL accounts showing debit/credit balances per account head.', createdBy: 'Priya M.', assignee: 'Priya M.', approvedBy: 'CFO', sopAvailable: true, attachments: [{ name: 'Trial_Balance_SOP.pdf', type: 'PDF', size: '1.8 MB', uploadedBy: 'Priya M.', uploadedAt: '2026-02-10' }] },
  { id: 'R2', name: 'Stock Ledger', module: 'Material', category: 'Operational', frequency: 'Daily', usedByRole: 'Store Manager', exportFormat: 'Excel', status: 'Active', description: 'Item-wise stock movement register with opening, receipt, issue and closing quantities.', createdBy: 'Amit S.', assignee: 'Amit S.', approvedBy: 'Store Head', sopAvailable: true, attachments: [] },
  { id: 'R3', name: 'Sales MIS', module: 'Sale', category: 'MIS', frequency: 'Weekly', usedByRole: 'Sales Head, MD', exportFormat: 'Excel, PDF', status: 'Active', description: 'Weekly sales performance summary — region-wise, product-wise, target vs actual.', createdBy: 'Neha G.', assignee: 'Neha G.', approvedBy: 'Sales Director', sopAvailable: true, attachments: [] },
  { id: 'R4', name: 'Quality Inspection', module: 'Quality', category: 'Operational', frequency: 'Per Lot', usedByRole: 'QC Manager', exportFormat: 'PDF', status: 'Active', description: 'Lot-wise QC inspection results with pass/fail/hold decisions and parameter readings.', createdBy: 'Vikram T.', assignee: 'Vikram T.', approvedBy: 'QC Head', sopAvailable: false, attachments: [] },
  { id: 'R5', name: 'Production Summary', module: 'Production', category: 'MIS', frequency: 'Daily', usedByRole: 'Production Head', exportFormat: 'Excel', status: 'Active', description: 'Daily production output vs plan — machine-wise, shift-wise breakdown.', createdBy: 'Suresh R.', assignee: 'Suresh R.', approvedBy: 'Plant Manager', sopAvailable: true, attachments: [] },
  { id: 'R6', name: 'Pending PO Report', module: 'Material', category: 'Operational', frequency: 'Daily', usedByRole: 'Purchase Manager', exportFormat: 'Excel', status: 'Active', description: 'Open purchase orders pending delivery — vendor-wise, age analysis.', createdBy: 'Amit S.', assignee: 'Rajesh K.', approvedBy: 'Purchase Head', sopAvailable: false, attachments: [] },
  { id: 'R7', name: 'GST Returns', module: 'Finance', category: 'Statutory', frequency: 'Monthly', usedByRole: 'Tax Consultant', exportFormat: 'JSON, Excel', status: 'In Development', description: 'GSTR-1 and GSTR-3B data extraction for filing — auto-mapped from invoices.', createdBy: 'Priya M.', assignee: 'Priya M.', approvedBy: '', sopAvailable: false, attachments: [] },
  { id: 'R8', name: 'MRP Demand Report', module: 'PPC/MRP', category: 'Analytical', frequency: 'Weekly', usedByRole: 'Planner', exportFormat: 'Excel', status: 'In Development', description: 'Net requirements after MRP run — item-wise demand, supply, and net requirement.', createdBy: 'Kiran D.', assignee: 'Kiran D.', approvedBy: '', sopAvailable: false, attachments: [] },
];

export const technicalMappings: TechnicalMapping[] = [
  { id: 'TM1', formId: 'ERP0000000074', formName: 'Item Master Entry', tableName: 'erp_items, erp_item_attributes', apiEndpoint: '/api/v1/items', logicDescription: 'CRUD operations on item master with attribute management. Validates UOM, HSN code. Triggers reorder point calculation.', module: 'Master' },
  { id: 'TM2', formId: 'MTL0000000631', formName: 'Physical Stock Verification', tableName: 'erp_stock_ledger, erp_cycle_count', apiEndpoint: '/api/v1/stock/physical-count', logicDescription: 'Records physical count, calculates variance vs book stock. Auto-creates adjustment entry on approval.', module: 'Material' },
  { id: 'TM3', formId: 'ERP0000000112', formName: 'FG Stock Adjustment', tableName: 'erp_fg_stock, erp_stock_adjustments', apiEndpoint: '/api/v1/stock/fg-adjust', logicDescription: 'Posts FG adjustments with reason codes. Updates GL via integration. Requires manager approval above threshold.', module: 'Finance' },
  { id: 'TM4', formId: 'ENG0000000021', formName: 'Production Work Order', tableName: 'erp_work_orders, erp_wo_operations', apiEndpoint: '/api/v1/production/work-orders', logicDescription: 'Creates work orders from planned orders or manual entry. Links to BOM for material reservation. Tracks operation sequence.', module: 'Production' },
  { id: 'TM5', formId: 'SAL0000000045', formName: 'Sales Order Entry', tableName: 'erp_sales_orders, erp_so_lines', apiEndpoint: '/api/v1/sales/orders', logicDescription: 'Full sales order lifecycle. Credit check, price determination, ATP check. Triggers delivery creation.', module: 'Sale' },
  { id: 'TM6', formId: 'FIN0000000201', formName: 'General Ledger Posting', tableName: 'erp_gl_entries, erp_journal_headers', apiEndpoint: '/api/v1/finance/gl-post', logicDescription: 'Manual and auto GL postings. Validates debit=credit. Period check. Supports recurring entries.', module: 'Finance' },
];

// SOP Data for forms and reports
export const sopData: SOPItem[] = [
  { formId: 'ERP0000000074', title: 'Item Master Entry SOP', objective: 'Define the standard procedure for creating and maintaining item master records in GoERP.ai.', scope: 'Applicable to all modules that create or modify item master data — Master, Material, Production.', steps: [
    { step: 1, action: 'Navigate to Master → Item Master Entry', responsible: 'Data Entry', output: 'Form opens' },
    { step: 2, action: 'Enter Item Code (auto-generated or manual per config)', responsible: 'Data Entry', output: 'Unique item code assigned' },
    { step: 3, action: 'Fill mandatory fields: Name, UOM, HSN Code, Category', responsible: 'Data Entry', output: 'Basic item record created' },
    { step: 4, action: 'Enter specifications: Weight, Dimensions, Shelf Life', responsible: 'Data Entry', output: 'Item attributes populated' },
    { step: 5, action: 'Set reorder level, safety stock, lead time', responsible: 'Planner', output: 'Replenishment parameters set' },
    { step: 6, action: 'Submit for approval', responsible: 'Data Entry', output: 'Pending approval notification sent' },
    { step: 7, action: 'Manager reviews and approves', responsible: 'Manager', output: 'Item activated in system' },
  ], references: ['GST HSN Code Master', 'UOM Standard List', 'Category Tree'], version: 'v2.1', lastUpdated: '2026-03-01', approvedBy: 'Rajesh K.' },
  { formId: 'MTL0000000645', title: 'Goods Receipt Note (GRN) SOP', objective: 'Define the procedure for receiving materials against purchase orders.', scope: 'Material Management module — Inward section.', steps: [
    { step: 1, action: 'Open Material → Inward → GRN Entry', responsible: 'Store Keeper', output: 'GRN form opens' },
    { step: 2, action: 'Select PO Number from pending PO list', responsible: 'Store Keeper', output: 'PO details auto-populated' },
    { step: 3, action: 'Enter received quantity, batch/lot number', responsible: 'Store Keeper', output: 'Quantity recorded' },
    { step: 4, action: 'Physical verification: count, weight, visual check', responsible: 'Store Keeper', output: 'Verification completed' },
    { step: 5, action: 'Send to QC if quality inspection required', responsible: 'Store Keeper', output: 'QC notification generated' },
    { step: 6, action: 'QC approves/rejects lot', responsible: 'QC Inspector', output: 'QC status updated' },
    { step: 7, action: 'Post GRN — stock updated, accounting entry created', responsible: 'Store Keeper', output: 'Stock increased, GL updated' },
  ], references: ['PO Terms', 'Vendor Rating SOP', 'QC Parameters'], version: 'v1.3', lastUpdated: '2026-02-20', approvedBy: 'Amit S.' },
  { formId: 'SAL0000000045', title: 'Sales Order Entry SOP', objective: 'Standard procedure for creating sales orders from customer inquiries/quotations.', scope: 'Sales & Distribution module.', steps: [
    { step: 1, action: 'Open Sale → Sales Order Entry', responsible: 'Sales Executive', output: 'SO form opens' },
    { step: 2, action: 'Select Customer from master', responsible: 'Sales Executive', output: 'Customer details auto-filled' },
    { step: 3, action: 'Add line items with quantity and price', responsible: 'Sales Executive', output: 'Order lines created' },
    { step: 4, action: 'System performs credit check', responsible: 'System', output: 'Credit status shown' },
    { step: 5, action: 'Apply discounts/schemes if applicable', responsible: 'Sales Executive', output: 'Net price calculated' },
    { step: 6, action: 'Submit for approval', responsible: 'Sales Executive', output: 'SO pending approval' },
    { step: 7, action: 'Sales Manager approves', responsible: 'Sales Manager', output: 'SO confirmed, dispatch note created' },
  ], references: ['Price List', 'Credit Policy', 'Discount Matrix'], version: 'v2.0', lastUpdated: '2026-02-20', approvedBy: 'Neha G.' },
  { formId: 'FIN0000000201', title: 'General Ledger Posting SOP', objective: 'Define the procedure for manual and automatic GL postings.', scope: 'Finance & Accounts module — GL section.', steps: [
    { step: 1, action: 'Open Finance → GL Posting', responsible: 'Accountant', output: 'Journal form opens' },
    { step: 2, action: 'Select journal type (Manual/Reversal/Recurring)', responsible: 'Accountant', output: 'Type selected' },
    { step: 3, action: 'Enter debit/credit lines with account heads', responsible: 'Accountant', output: 'Journal lines created' },
    { step: 4, action: 'System validates debit = credit', responsible: 'System', output: 'Balance check passed' },
    { step: 5, action: 'Attach supporting documents', responsible: 'Accountant', output: 'Documents attached' },
    { step: 6, action: 'Submit for approval', responsible: 'Accountant', output: 'Pending approval' },
    { step: 7, action: 'Finance Manager approves and posts', responsible: 'Finance Manager', output: 'GL entries posted' },
  ], references: ['Chart of Accounts', 'Period Calendar', 'Approval Matrix'], version: 'v1.5', lastUpdated: '2026-02-28', approvedBy: 'Priya M.' },
  { formId: 'ENG0000000021', title: 'Production Work Order SOP', objective: 'Standard procedure for creating and managing production work orders.', scope: 'Production module — Work Order section.', steps: [
    { step: 1, action: 'Open Production → Work Order', responsible: 'Planner', output: 'WO form opens' },
    { step: 2, action: 'Select product/FG item from master', responsible: 'Planner', output: 'BOM auto-loaded' },
    { step: 3, action: 'Enter planned quantity and target dates', responsible: 'Planner', output: 'WO schedule created' },
    { step: 4, action: 'System checks material availability', responsible: 'System', output: 'Availability status shown' },
    { step: 5, action: 'Release work order', responsible: 'Planner', output: 'Materials reserved, shop floor notified' },
    { step: 6, action: 'Shop floor executes operations', responsible: 'Operator', output: 'Operation confirmations recorded' },
    { step: 7, action: 'Complete WO — FG stock received', responsible: 'Supervisor', output: 'FG stock updated, cost calculated' },
  ], references: ['BOM Master', 'Routing Master', 'Capacity Calendar'], version: 'v1.2', lastUpdated: '2026-01-15', approvedBy: 'Suresh R.' },
];

export const menuTree: MenuNode[] = [
  { id: 'M1', label: 'Master Data', module: 'Master', children: [
    { id: 'M1-1', label: 'Item Master', module: 'Master', children: [], formId: 'ERP0000000074' },
    { id: 'M1-2', label: 'Vendor Master', module: 'Master', children: [], formId: 'ERP0000000088' },
    { id: 'M1-3', label: 'Customer Master', module: 'Master', children: [], formId: 'ERP0000000095' },
  ]},
  { id: 'M2', label: 'Material Management', module: 'Material', children: [
    { id: 'M2-1', label: 'Inward', module: 'Material', children: [
      { id: 'M2-1-1', label: 'Goods Receipt Note', module: 'Material', children: [], formId: 'MTL0000000645' },
    ]},
    { id: 'M2-2', label: 'Stock', module: 'Material', children: [
      { id: 'M2-2-1', label: 'Physical Stock', module: 'Material', children: [], formId: 'MTL0000000631' },
      { id: 'M2-2-2', label: 'Stock Ledger Report', module: 'Material', children: [] },
    ]},
  ]},
  { id: 'M3', label: 'Finance & Accounts', module: 'Finance', children: [
    { id: 'M3-1', label: 'GL Posting', module: 'Finance', children: [], formId: 'FIN0000000201' },
    { id: 'M3-2', label: 'Accounts Payable', module: 'Finance', children: [
      { id: 'M3-2-1', label: 'AP Invoice', module: 'Finance', children: [], formId: 'FIN0000000230' },
    ]},
    { id: 'M3-3', label: 'Reports', module: 'Finance', children: [
      { id: 'M3-3-1', label: 'Trial Balance', module: 'Finance', children: [] },
    ]},
  ]},
  { id: 'M4', label: 'Sales & Distribution', module: 'Sale', children: [
    { id: 'M4-1', label: 'Sales Order', module: 'Sale', children: [], formId: 'SAL0000000045' },
    { id: 'M4-2', label: 'Dispatch', module: 'Sale', children: [], formId: 'SAL0000000060' },
  ]},
  { id: 'M5', label: 'Production', module: 'Production', children: [
    { id: 'M5-1', label: 'Work Order', module: 'Production', children: [], formId: 'ENG0000000021' },
    { id: 'M5-2', label: 'Bill of Materials', module: 'Production', children: [], formId: 'ENG0000000035' },
  ]},
  { id: 'M6', label: 'Quality Control', module: 'Quality', children: [
    { id: 'M6-1', label: 'QC Inspection', module: 'Quality', children: [] },
    { id: 'M6-2', label: 'Test Certificate', module: 'Quality', children: [] },
  ]},
  { id: 'M7', label: 'PPC & MRP', module: 'PPC/MRP', children: [
    { id: 'M7-1', label: 'MRP Run', module: 'PPC/MRP', children: [], formId: 'PPC0000000055' },
    { id: 'M7-2', label: 'Production Schedule', module: 'PPC/MRP', children: [], formId: 'PPC0000000062' },
  ]},
];

export const dashboardStats = {
  totalObjects: 247,
  totalForms: 156,
  totalReports: 68,
  totalMenus: 23,
  percentComplete: 72,
  openRisks: 8,
  activePhases: 3,
  moduleCounts: [
    { module: 'Master', forms: 24, reports: 8 },
    { module: 'Material', forms: 35, reports: 15 },
    { module: 'Finance', forms: 28, reports: 12 },
    { module: 'Sale', forms: 18, reports: 8 },
    { module: 'Production', forms: 22, reports: 10 },
    { module: 'Quality', forms: 12, reports: 6 },
    { module: 'PPC/MRP', forms: 8, reports: 5 },
    { module: 'Marketing', forms: 5, reports: 2 },
    { module: 'Security', forms: 4, reports: 2 },
  ],
  statusBreakdown: [
    { status: 'Active', count: 168 },
    { status: 'In Development', count: 42 },
    { status: 'Testing', count: 25 },
    { status: 'Deprecated', count: 12 },
  ],
  phases: [
    { name: 'Phase 1: Discovery', progress: 100, period: 'Jan 2026' },
    { name: 'Phase 2: Design', progress: 85, period: 'Feb 2026' },
    { name: 'Phase 3: Build', progress: 45, period: 'Mar 2026' },
    { name: 'Phase 4: Testing', progress: 10, period: 'Apr 2026' },
    { name: 'Phase 5: UAT', progress: 0, period: 'May 2026' },
    { name: 'Phase 6: Go-Live', progress: 0, period: 'Jun 2026' },
  ],
};
