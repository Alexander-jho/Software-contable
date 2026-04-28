import { Transaction, Product, CashMovement } from '../types';
import { isBefore, parseISO, compareAsc } from 'date-fns';

export interface AppState {
  inventory: Record<string, number>; // productId -> quantity
  cash: number;
  totalSales: number;
  totalCosts: number;
  totalProfit: number;
  history: {
    date: Date;
    cash: number;
    inventory: Record<string, number>;
  }[];
}

export function calculateState(
  products: Product[],
  transactions: Transaction[],
  cashMovements: CashMovement[]
): AppState {
  const inventory: Record<string, number> = {};
  products.forEach(p => inventory[p.id] = 0);

  let cash = 0;
  let totalSales = 0;
  let totalCosts = 0;

  // Combine and sort events by date
  const events = [
    ...transactions.map(t => ({
      type: 'TRANSACTION',
      date: t.date.toDate ? t.date.toDate() : (t.date instanceof Date ? t.date : new Date(t.date)),
      data: t
    })),
    ...cashMovements.map(c => ({
      type: 'CASH',
      date: c.date.toDate ? c.date.toDate() : (c.date instanceof Date ? c.date : new Date(c.date)),
      data: c
    }))
  ].sort((a, b) => compareAsc(a.date, b.date));

  const history: AppState['history'] = [];

  events.forEach(event => {
    if (event.type === 'TRANSACTION') {
      const t = event.data as Transaction;
      const qty = t.quantity;
      
      switch (t.type) {
        case 'INITIAL_INVENTORY':
        case 'PURCHASE':
        case 'PRODUCTION_IN':
          inventory[t.productId] = (inventory[t.productId] || 0) + qty;
          if (t.type === 'PURCHASE') {
            totalCosts += t.total;
            cash -= t.total;
          }
          break;
        case 'SALE':
        case 'PRODUCTION_OUT':
          inventory[t.productId] = (inventory[t.productId] || 0) - qty;
          if (t.type === 'SALE') {
            totalSales += t.total;
            cash += t.total;
          }
          break;
      }
    } else if (event.type === 'CASH') {
      const c = event.data as CashMovement;
      if (c.type === 'INCOME') {
        cash += c.amount;
      } else {
        cash -= c.amount;
      }
    }

    history.push({
      date: event.date,
      cash,
      inventory: { ...inventory }
    });
  });

  return {
    inventory,
    cash,
    totalSales,
    totalCosts,
    totalProfit: totalSales - totalCosts,
    history
  };
}
