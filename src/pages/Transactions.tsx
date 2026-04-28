import React, { useEffect, useState } from 'react';
import { ProductService, TransactionService, InvoiceService } from '../services/store';
import { Product, Transaction, TransactionType } from '../types';
import { 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  Calendar as CalendarIcon,
  ShoppingBag,
  Truck,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TransactionType | 'ALL'>('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('SALE');

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  // Production state (Desposte)
  const [productionResults, setProductionResults] = useState<{ productId: string, quantity: number, price: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [p, t] = await Promise.all([
      ProductService.getAll(),
      TransactionService.getAll()
    ]);
    if (p) setProducts(p);
    if (t) setTransactions(t.reverse());
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return toast.error('Seleccione un producto');

    try {
      const transactionDate = new Date(date + 'T12:00:00'); // Use noon to avoid TZ issues
      
      if (modalType === 'PRODUCTION_IN') { // Special handling for desposte
         // 1. Transaction for base product (OUT)
         await TransactionService.create({
           productId: selectedProductId,
           type: 'PRODUCTION_OUT',
           quantity: quantity,
           price: price,
           total: 0,
           date: transactionDate,
           note: `Desposte base: ${note}`
         });

         // 2. Transactions for results (IN)
         for (const res of productionResults) {
            await TransactionService.create({
              productId: res.productId,
              type: 'PRODUCTION_IN',
              quantity: res.quantity,
              price: res.price,
              total: 0,
              date: transactionDate,
              note: `Resultado desposte de ${selectedProductId}`
            });
         }
      } else {
        const total = quantity * price;
        await TransactionService.create({
          productId: selectedProductId,
          type: modalType,
          quantity,
          price,
          total,
          date: transactionDate,
          note
        });
      }

      toast.success('Movimiento registrado');
      loadData();
      setIsModalOpen(false);
      resetForm();
    } catch (e) {
      toast.error('Error al registrar');
    }
  };

  const resetForm = () => {
    setSelectedProductId('');
    setQuantity(0);
    setPrice(0);
    setNote('');
    setProductionResults([]);
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const addProductionResult = () => {
    setProductionResults([...productionResults, { productId: '', quantity: 0, price: 0 }]);
  };

  const filtered = activeTab === 'ALL' ? transactions : transactions.filter(t => t.type === activeTab);

  const getBadgeColor = (type: TransactionType) => {
    switch (type) {
      case 'SALE': return 'bg-green-50 text-green-600 border-green-100';
      case 'PURCHASE': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'PRODUCTION_IN': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'PRODUCTION_OUT': return 'bg-red-50 text-red-600 border-red-100';
      case 'INITIAL_INVENTORY': return 'bg-orange-50 text-orange-600 border-orange-100';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 font-sans">
      <header className="tech-header">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40">Logística de Almacén</span>
          <h1 className="text-lg font-black tracking-tighter text-ink">LIBRO DE MOVIMIENTOS</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setModalType('SALE'); setIsModalOpen(true); }}
            className="bg-ink text-canvas px-6 py-2 text-xs font-black hover:bg-black transition-all flex items-center gap-2 border-2 border-ink"
          >
            <ShoppingBag size={16} strokeWidth={3} /> VENTA
          </button>
          <button 
            onClick={() => { setModalType('PURCHASE'); setIsModalOpen(true); }}
            className="bg-white border-2 border-ink text-ink px-6 py-2 text-xs font-black hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <Truck size={16} strokeWidth={3} /> COMPRA
          </button>
          <button 
            onClick={() => { setModalType('PRODUCTION_IN'); setIsModalOpen(true); }}
            className="bg-accent text-white px-6 py-2 text-xs font-black hover:bg-[#ff8c42] transition-all flex items-center gap-2 border-2 border-ink"
          >
            <Layers size={16} strokeWidth={3} /> DESPOSTE
          </button>
        </div>
      </header>

      <div className="p-8 space-y-6 overflow-y-auto">
        <div className="brutalist-card bg-white overflow-hidden">
          <div className="flex border-b border-ink bg-gray-100 divide-x divide-ink">
            {['ALL', 'PURCHASE', 'SALE', 'PRODUCTION_IN', 'PRODUCTION_OUT', 'INITIAL_INVENTORY'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all flex-1 ${activeTab === tab ? 'bg-ink text-canvas' : 'text-ink/40 hover:text-ink hover:bg-white'}`}
              >
                {tab === 'ALL' ? 'HISTORIAL_TOTAL' : tab}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase font-black tracking-widest text-ink/60 border-b border-ink bg-gray-50">
                  <th className="px-6 py-3">Timestamp / Ref</th>
                  <th className="px-6 py-3">Operación</th>
                  <th className="px-6 py-3">Designación</th>
                  <th className="px-6 py-3 text-right">Volumen</th>
                  <th className="px-6 py-3 text-right">Valor Unit.</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs font-mono opacity-50 uppercase">Consultando base de datos persistente...</td>
                  </tr>
                ) : filtered.map((t) => {
                  const product = products.find(p => p.id === t.productId);
                  const dateObj = t.date.toDate ? t.date.toDate() : new Date(t.date);
                  return (
                    <tr key={t.id} className="hover:bg-canvas/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-[10px] font-black text-ink">{format(dateObj, 'dd/MM/yyyy')}</div>
                        <div className="text-[8px] font-mono opacity-40 uppercase">#{t.id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] px-2 py-0.5 font-black uppercase border border-ink ${getBadgeColor(t.type)}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-xs font-black text-ink uppercase truncate max-w-[200px]">{product?.name || 'SYSTEM_ERR'}</div>
                         <div className="text-[9px] font-serif italic truncate max-w-[200px] opacity-40">{t.note || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-mono text-xs font-black">{t.quantity}</div>
                        <div className="text-[9px] font-black uppercase opacity-40">{product?.unit}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-xs opacity-40 font-bold">
                        ${t.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className={`font-mono font-black text-sm ${t.type === 'SALE' ? 'text-green-600' : t.type === 'PURCHASE' ? 'text-red-500' : 'text-gray-400'}`}>
                           {t.type === 'SALE' ? '+$' : t.type === 'PURCHASE' ? '-$' : '$'}{t.total.toLocaleString()}
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
          <div className="bg-canvas border-2 border-ink w-full max-w-2xl overflow-hidden relative shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col h-[90vh]">
            <div className={`p-6 text-white flex justify-between items-center ${modalType === 'SALE' ? 'bg-green-600' : modalType === 'PURCHASE' ? 'bg-blue-600' : 'bg-accent'} border-b-2 border-ink`}>
              <h3 className="text-sm font-black tracking-[0.2em] uppercase flex items-center gap-3">
                {modalType === 'SALE' ? <ShoppingBag size={20} /> : modalType === 'PURCHASE' ? <Truck size={20} /> : <Layers size={20} />}
                REGISTRAR {modalType === 'SALE' ? 'VENTA DIRECTA' : modalType === 'PURCHASE' ? 'ADQUISICIÓN' : 'PROCESAMIENTO_D'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:opacity-75">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Cronología (Histórica/Real)</label>
                   <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 border-2 border-ink bg-white font-black text-sm focus:outline-none" />
                </div>
                <div>
                   <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Recurso {modalType === 'PRODUCTION_IN' ? 'Primario' : ''}</label>
                   <select required value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full px-4 py-3 border-2 border-ink bg-white font-black text-sm focus:outline-none">
                     <option value="">SELECCIONE PRODUCTO...</option>
                     {products.filter(p => modalType === 'PRODUCTION_IN' ? p.type === 'Producción' : true).map(p => (
                       <option key={p.id} value={p.id}>{p.name.toUpperCase()} ({p.unit.toUpperCase()})</option>
                     ))}
                   </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Flujo de Masa / Cantidad</label>
                   <input required type="number" step="0.01" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-ink bg-white font-mono font-black focus:outline-none" />
                </div>
                <div>
                   <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Valor de Transacción</label>
                   <input required type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-ink bg-white font-mono font-black focus:outline-none" />
                </div>
              </div>

              {modalType === 'PRODUCTION_IN' && (
                <div className="space-y-4 pt-6 border-t-2 border-ink border-dashed">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-black text-ink">SALIDA DE PROCESAMIENTO (DERIVADOS)</label>
                    <button type="button" onClick={addProductionResult} className="text-accent text-[10px] font-black uppercase tracking-widest border border-accent px-2 py-1 hover:bg-accent hover:text-white transition-all flex items-center gap-1">
                      <Plus size={12} strokeWidth={3} /> INSERTAR LÍNEA
                    </button>
                  </div>
                  {productionResults.map((res, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-3 bg-white border border-ink p-4 relative group">
                      <select required value={res.productId} onChange={(e) => {
                        const newRes = [...productionResults];
                        newRes[idx].productId = e.target.value;
                        setProductionResults(newRes);
                      }} className="w-full px-3 py-2 border border-ink/20 focus:outline-none text-[10px] font-black uppercase">
                        <option value="">ÍTEM RESULTANTE...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>)}
                      </select>
                      <input required type="number" step="0.01" placeholder="CANT." value={res.quantity || ''} onChange={(e) => {
                        const newRes = [...productionResults];
                        newRes[idx].quantity = Number(e.target.value);
                        setProductionResults(newRes);
                      }} className="w-full px-3 py-2 border border-ink/20 focus:outline-none text-[10px] font-mono font-black" />
                      <input required type="number" placeholder="COSTO PROX." value={res.price || ''} onChange={(e) => {
                        const newRes = [...productionResults];
                        newRes[idx].price = Number(e.target.value);
                        setProductionResults(newRes);
                      }} className="w-full px-3 py-2 border border-ink/20 focus:outline-none text-[10px] font-mono font-black" />
                      <button type="button" onClick={() => setProductionResults(productionResults.filter((_, i) => i !== idx))} className="absolute -top-2 -right-2 bg-accent text-white border border-ink p-1 hover:bg-black transition-colors">✕</button>
                    </div>
                  ))}
                  {productionResults.length === 0 && <p className="text-center text-[10px] font-serif italic text-ink/40 py-4 uppercase">Pendiente de definición de salida industrial.</p>}
                </div>
              )}

              <div>
                 <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Metadatos / Glosa del Registro</label>
                 <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-4 py-3 border-2 border-ink bg-white font-bold text-sm focus:outline-none" rows={2} />
              </div>

              <div className="pt-4 sticky bottom-0 bg-canvas/80 backdrop-blur-md">
                <button type="submit" className={`w-full py-4 text-white font-black text-sm uppercase tracking-[0.3em] border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all ${modalType === 'SALE' ? 'bg-green-600' : modalType === 'PURCHASE' ? 'bg-blue-600' : 'bg-accent'}`}>
                  SERIALIZAR TRANSACCIÓN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
