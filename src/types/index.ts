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
  costPrice: number;
  salePrice: number;
  type: ProductType;
  createdAt: any;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  productId: string;
  quantity: number;
  price: number;
  total: number;
  date: any; // Timestamp or JS Date
  createdAt: any;
  referenceId?: string;
  note?: string;
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

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
