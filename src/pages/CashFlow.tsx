import React, { useEffect, useState } from 'react';
import { CashService } from '../services/store';
import { CashMovement, CashMovementType } from '../types';
import { 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Search,
  DollarSign,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function CashFlow() {
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<CashMovementType>('EXPENSE');
  
  // Form
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadMovements();
  }, []);

  async function loadMovements() {
    setLoading(true);
    const data = await CashService.getAll();
    if (data) setMovements(data.reverse());
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await CashService.create({
        type,
        amount,
        category,
        description,
        date: new Date(date + 'T12:00:00'),
      });
      toast.success('Movimiento registrado');
      loadMovements();
      setIsModalOpen(false);
      resetForm();
    } catch (e) { toast.error('Error'); }
  };

  const resetForm = () => {
    setAmount(0);
    setCategory('');
    setDescription('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const totalIn = movements.filter(m => m.type === 'INCOME').reduce((acc, m) => acc + m.amount, 0);
  const totalOut = movements.filter(m => m.type === 'EXPENSE').reduce((acc, m) => acc + m.amount, 0);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 font-sans">
      <header className="tech-header">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40">Tesorería y Liquidez</span>
          <h1 className="text-lg font-black tracking-tighter text-ink">LIBRO DE CAJA</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setType('INCOME'); setIsModalOpen(true); }} className="bg-ink text-canvas px-6 py-2 text-xs font-black hover:bg-black transition-all flex items-center gap-2 border-2 border-ink">
            <Plus size={16} strokeWidth={3} /> INGRESO
          </button>
          <button onClick={() => { setType('EXPENSE'); setIsModalOpen(true); }} className="bg-white border-2 border-ink text-ink px-6 py-2 text-xs font-black hover:bg-gray-100 transition-all flex items-center gap-2">
            <Plus size={16} strokeWidth={3} /> EGRESO
          </button>
        </div>
      </header>

      <div className="p-8 space-y-8 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="brutalist-card p-6 flex items-center gap-6">
            <div className="bg-green-100 p-4 border-2 border-ink text-green-600"><ArrowUpCircle size={32} /></div>
            <div>
              <p className="text-[10px] text-ink/40 font-black uppercase tracking-[0.2em]">Entradas Operativas</p>
              <h3 className="text-3xl font-black font-mono text-ink tracking-tighter">${totalIn.toLocaleString()}</h3>
            </div>
          </div>
          <div className="brutalist-card p-6 flex items-center gap-6">
            <div className="bg-red-100 p-4 border-2 border-ink text-red-600"><ArrowDownCircle size={32} /></div>
            <div>
              <p className="text-[10px] text-ink/40 font-black uppercase tracking-[0.2em]">Salidas Operativas</p>
              <h3 className="text-3xl font-black font-mono text-ink tracking-tighter">${totalOut.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="brutalist-card bg-white overflow-hidden">
          <div className="p-4 border-b border-ink bg-gray-50 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-ink">HISTORIAL DE CAJA</h3>
              <div className="font-mono text-[9px] opacity-40">TIMESTAMP: {format(new Date(), 'HH:mm:ss')}</div>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-[10px] uppercase font-black tracking-widest text-ink/60 border-b border-ink">
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4">Descripción / Glosa</th>
                <th className="px-6 py-4 text-right">Monto (Persistente)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-canvas/20 transition-colors">
                  <td className="px-6 py-4 text-[10px] font-black text-ink/60">
                    {format(m.date.toDate ? m.date.toDate() : new Date(m.date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="border border-ink text-ink font-mono px-2 py-0.5 text-[9px] font-bold uppercase">{m.category}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-ink uppercase tracking-tight">{m.description}</td>
                  <td className={`px-6 py-4 text-right font-mono font-black text-sm tabular-nums ${m.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                    {m.type === 'INCOME' ? '+' : '-'} ${m.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 && !loading && (
             <div className="p-12 text-center text-xs font-serif italic text-gray-400">
               No hay registros de liquidez detectados.
             </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-ink/60 backdrop-blur-sm" />
          <div className="bg-canvas border-2 border-ink w-full max-w-md overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className={`p-6 text-canvas font-black uppercase tracking-widest border-b-2 border-ink ${type === 'INCOME' ? 'bg-green-600' : 'bg-red-600'}`}>
              <h3 className="text-sm">NUEVO {type === 'INCOME' ? 'FLUJO POSITIVO' : 'EGRESO DE CAPITAL'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">CRONOLOGÍA</label>
                <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 border-2 border-ink bg-white font-black text-sm focus:outline-none focus:bg-yellow-50" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">VALOR TRANSADO ($)</label>
                <div className="relative">
                  <input required type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-ink bg-white font-mono font-black focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">SECTOR / CATEGORÍA</label>
                <input required type="text" placeholder="EJ: ARRIENDO, SERVICIOS..." value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border-2 border-ink bg-white font-black text-xs focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">CONCEPTO / GLOSA</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border-2 border-ink bg-white font-bold text-sm focus:outline-none" rows={2} />
              </div>
              <button type="submit" className={`w-full py-4 text-canvas font-black uppercase tracking-[0.2em] border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all ${type === 'INCOME' ? 'bg-green-600' : 'bg-red-600'}`}>
                {type === 'INCOME' ? 'VALIDAR INGRESO' : 'VALIDAR EGRESO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
