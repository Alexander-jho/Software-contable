export type Category = 'Pollo' | 'Pescado' | 'Cerdo' | 'Lácteos' | 'Otros';
export type Unit = 'kg' | 'unidad';
export type ProductType = 'Normal' | 'Producción';
export type TransactionType = 'PURCHASE' | 'SALE' | 'PRODUCTION_IN' | 'PRODUCTION_OUT' | 'INITIAL_INVENTORY';
export type CashMovementType = 'INCOME' | 'EXPENSE';

export interface Product {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  type: ProductType;
  stockUnits: number;
  stockWeight: number;
  inventoryDate: any;
  createdAt: any;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  productId: string;
  quantity: number; // units
  weight?: number;  // kilos
  price: number;
  total: number;
  paidAmount: number; // For 'abono'
  paymentStatus: 'PAID' | 'PARTIAL' | 'CREDIT';
  date: any; 
  createdAt: any;
  referenceId?: string; // Links to another transaction (e.g. Production to Purchase)
  note?: string;
  clientName?: string;
}

export interface CashMovement {
  id: string;
  type: CashMovementType;
  amount: number;
  category: string;
  description: string;
  date: any;
  createdAt: any;
  referenceId?: string;
}

export interface Invoice {
  id: string;
  number: string;
  type: 'COMP' | 'VENT';
  total: number;
  date: any;
  transactionIds: string[];
  status: 'PAID' | 'PENDING';
}

export interface InventoryLog {
  id?: string;
  productId: string;
  productName: string;
  previousUnits: number;
  previousWeight: number;
  newUnits: number;
  newWeight: number;
  inventoryDate: any;
  createdAt: any;
  note?: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
