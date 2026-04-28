import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Product, Transaction, CashMovement, Invoice, InventoryLog, OperationType } from '../types';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const ProductService = {
  async getAll() {
    const path = 'products';
    try {
      const q = query(collection(db, path), orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, path); }
  },
  async create(data: Omit<Product, 'id' | 'createdAt'>) {
    const path = 'products';
    try {
      return await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, path); }
  },
  async update(id: string, data: Partial<Product>) {
    const path = `products/${id}`;
    try {
      await updateDoc(doc(db, 'products', id), data);
    } catch (e) { handleFirestoreError(e, OperationType.UPDATE, path); }
  },
  async delete(id: string) {
    const path = `products/${id}`;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) { handleFirestoreError(e, OperationType.DELETE, path); }
  }
};

export const TransactionService = {
  async getAll() {
    const path = 'transactions';
    try {
      const q = query(collection(db, path), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, path); }
  },
  async create(data: Omit<Transaction, 'id' | 'createdAt'>) {
    const path = 'transactions';
    try {
      // 1. Create the transaction record
      const docRef = await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() });
      
      // 2. Update product stock
      const productRef = doc(db, 'products', data.productId);
      const quantity = data.quantity || 0;
      const weight = data.weight || 0;
      
      // Determination of stock change direction
      const multiplier = (data.type === 'SALE' || data.type === 'PRODUCTION_OUT') ? -1 : 1;
      
      // Get current product data to update
      const productSnap = await ProductService.getAll(); // Or better, get single doc
      const product = productSnap?.find(p => p.id === data.productId);
      
      if (product) {
        await updateDoc(productRef, {
          stockUnits: (product.stockUnits || 0) + (quantity * multiplier),
          stockWeight: (product.stockWeight || 0) + (weight * multiplier)
        });
      }

      return docRef;
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, path); }
  }
};

export const CashService = {
  async getAll() {
    const path = 'cash_movements';
    try {
      const q = query(collection(db, path), orderBy('date', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CashMovement));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, path); }
  },
  async create(data: Omit<CashMovement, 'id' | 'createdAt'>) {
    const path = 'cash_movements';
    try {
      return await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, path); }
  }
};

export const InvoiceService = {
  async getAll() {
    const path = 'invoices';
    try {
      const q = query(collection(db, path), orderBy('number', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invoice));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, path); }
  },
  async getNextNumber(prefix: 'COMP' | 'VENT') {
    const invoices = await this.getAll();
    const filtered = invoices?.filter(i => i.type === prefix) || [];
    if (filtered.length === 0) return `${prefix}-0001`;
    const lastNum = filtered[0].number.split('-')[1];
    const nextNum = parseInt(lastNum) + 1;
    return `${prefix}-${nextNum.toString().padStart(4, '0')}`;
  },
  async create(data: Omit<Invoice, 'id' | 'createdAt'>) {
    const path = 'invoices';
    try {
      return await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, path); }
  }
};

export const InventoryService = {
  async getAll() {
    const path = 'inventory_logs';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as InventoryLog));
    } catch (e) { handleFirestoreError(e, OperationType.LIST, path); }
  },
  async createLog(data: Omit<InventoryLog, 'id' | 'createdAt'>) {
    const path = 'inventory_logs';
    try {
      return await addDoc(collection(db, path), { ...data, createdAt: serverTimestamp() });
    } catch (e) { handleFirestoreError(e, OperationType.CREATE, path); }
  }
};
