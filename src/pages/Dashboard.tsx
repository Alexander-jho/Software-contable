import React, { useEffect, useState } from 'react';
import { ProductService, TransactionService, CashService } from '../services/store';
import { calculateState, AppState } from '../utils/recalculate';
import { Product, Transaction, CashMovement } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { exportDashboardPDF } from '../utils/pdfExport';

export default function Dashboard() {
  const [state, setState] = useState<AppState | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleExportPDF = () => {
    if (!state) return;
    const inventory = Object.entries(state.inventory).map(([id, qty]) => {
      const product = products.find(p => p.id === id);
      return { name: product?.name || 'Desconocido', qty, unit: product?.unit || 'und' };
    });
    
    exportDashboardPDF({
      inventory,
      movements: [], // Can be populated if needed, for now we summary stats
      totalCashIn: state.totalSales,
      totalCashOut: state.totalCosts
    });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [p, t, c] = await Promise.all([
          ProductService.getAll(),
          TransactionService.getAll(),
          CashService.getAll()
        ]);
        if (p && t && c) {
          setProducts(p);
          const newState = calculateState(p, t, c);
          setState(newState);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[400px]">Cargando analíticas...</div>;

  const chartData = state?.history.map(h => ({
    name: format(h.date, 'dd MMM', { locale: es }),
    cash: h.cash
  })) || [];

  const stats = [
    { label: 'Caja Actual', value: `$${state?.cash.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Ventas Totales', value: `$${state?.totalSales.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Costos Totales', value: `$${state?.totalCosts.toLocaleString()}`, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
    { label: 'Utilidad Neta', value: `$${state?.totalProfit.toLocaleString()}`, icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const stockItems = Object.entries(state?.inventory || {}).map(([id, qty]) => {
    const product = products.find(p => p.id === id);
    return { id, name: product?.name || 'Producto Desconocido', qty: Number(qty), unit: product?.unit || 'kg' };
  }).sort((a, b) => (a.qty as number) - (b.qty as number)).slice(0, 5);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <header className="tech-header">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40">Vista General de Operaciones</span>
          <h1 className="text-lg font-black tracking-tighter text-ink">TABLERO DE MANDO</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExportPDF}
            className="bg-ink text-canvas px-6 py-2 text-xs font-black hover:bg-black transition-all border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            DESCARGAR INFORME
          </button>
          <div className="recalc-pill animate-pulse hidden md:block">Motor de Re-cálculo Activo</div>
          <button 
            onClick={() => navigate('/transactions')}
            className="border-2 border-ink px-6 py-2 text-xs font-black hover:bg-ink hover:text-canvas transition-all"
          >
            NUEVO REGISTRO
          </button>
        </div>
      </header>

      <div className="p-8 space-y-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, idx) => (
            <div key={idx} className="brutalist-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="font-serif italic text-[10px] uppercase opacity-60 tracking-widest">{s.label}</div>
                <s.icon className={s.color} size={16} strokeWidth={3} />
              </div>
              <div className="font-mono text-2xl font-black tabular-nums tracking-tighter">{s.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 brutalist-card p-0 flex flex-col">
            <div className="p-4 border-b border-ink bg-gray-50 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest">FLUJO DE CAJA HISTÓRICO</h3>
              <span className="font-mono text-[9px] opacity-40">AUTO_RECALC: ENABLED</span>
            </div>
            <div className="p-6 h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F27D26" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#14141422" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} fontClassName="font-mono" />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} fontClassName="font-mono" />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '0', 
                      border: '1px solid #141414', 
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                      fontSize: '12px',
                      fontFamily: 'Courier New'
                    }}
                  />
                  <Area type="stepAfter" dataKey="cash" stroke="#141414" strokeWidth={2} fillOpacity={1} fill="url(#colorCash)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="brutalist-card p-0 flex flex-col">
            <div className="p-4 border-b border-ink bg-gray-50">
              <h3 className="text-xs font-black uppercase tracking-widest">STOCK CRÍTICO</h3>
            </div>
            <div className="p-4 flex-1 space-y-3">
              {stockItems.map(({ id, name, qty, unit }) => (
                <div key={id} className="flex items-center justify-between p-3 border-b border-ink/5 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-black truncate uppercase tracking-tight">{name}</p>
                    <p className="text-[9px] font-mono opacity-50">REF: {id.slice(-6).toUpperCase()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-sm font-black ${(qty as number) < 10 ? 'text-red-600' : 'text-ink'}`}>{qty} {unit}</p>
                  </div>
                </div>
              ))}
              {stockItems.length === 0 && <p className="text-center text-[10px] font-serif italic text-gray-400 py-8">No se detectaron registros de inventario.</p>}
            </div>
            <div className="p-4 bg-gray-50 border-t border-ink">
              <button 
                onClick={() => navigate('/products')}
                className="w-full py-3 text-[10px] font-black uppercase tracking-widest border border-ink bg-white hover:bg-ink hover:text-canvas transition-all"
              >
                Auditar Inventario Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
