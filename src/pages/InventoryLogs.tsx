import React, { useEffect, useState } from 'react';
import { InventoryService } from '../services/store';
import { InventoryLog } from '../types';
import { History, Search, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function InventoryLogs() {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadLogs() {
      const data = await InventoryService.getAll();
      if (data) setLogs(data);
      setLoading(false);
    }
    loadLogs();
  }, []);

  const filtered = logs.filter(l => 
    l.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 font-sans">
      <header className="tech-header">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40">Trazabilidad de Existencias</span>
          <h1 className="text-lg font-black tracking-tighter text-ink">HISTORIAL DE INVENTARIOS</h1>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-[10px] font-mono bg-canvas px-3 py-1 border border-ink/10 opacity-60">SISTEMA DE AUDITORÍA V1.0</div>
        </div>
      </header>

      <div className="p-8 space-y-6 overflow-y-auto">
        <div className="brutalist-card bg-white overflow-hidden">
          <div className="p-4 border-b border-ink bg-gray-50 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
              <input
                type="text"
                placeholder="BUSCAR POR PRODUCTO O NOTA..."
                className="w-full pl-10 pr-4 py-2 border border-ink/20 focus:outline-none focus:border-ink text-xs font-mono font-bold placeholder:opacity-30 uppercase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 px-4 border border-ink/10 bg-canvas/30 rounded-none">
              <Calendar size={14} className="text-ink/40" />
              <span className="text-[10px] font-black uppercase">Filtro Temporal</span>
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-[10px] uppercase font-black tracking-widest text-ink/60 border-b border-ink">
                <th className="px-6 py-3">Timestamp / Registro</th>
                <th className="px-6 py-3">Producto afectado</th>
                <th className="px-6 py-3 text-center">Estado Anterior</th>
                <th className="px-6 py-3 text-center"></th>
                <th className="px-6 py-3 text-center">Estado Actual</th>
                <th className="px-6 py-3">Observaciones / Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-accent" size={32} />
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Consultando registros históricos...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="hover:bg-canvas/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-[10px] font-bold">
                      {l.createdAt ? format(l.createdAt.toDate ? l.createdAt.toDate() : new Date(l.createdAt), 'dd/MM/yyyy HH:mm', { locale: es }) : 'N/A'}
                    </div>
                    <div className="text-[8px] font-mono text-ink/30 italic uppercase">Log_seq_{l.id?.slice(-6)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-black text-xs uppercase text-ink">{l.productName}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-[10px] font-mono text-ink/40">
                      {l.previousUnits} UN / {l.previousWeight?.toFixed(2)} KG
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ArrowRight size={14} className="text-accent inline" strokeWidth={3} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-[10px] font-mono font-black text-ink">
                      {l.newUnits} UN / {l.newWeight?.toFixed(2)} KG
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[10px] font-serif italic text-ink/60">{l.note || '-'}</div>
                    <div className="text-[8px] font-black uppercase text-accent mt-1">Fecha Inv: {l.inventoryDate ? format(l.inventoryDate.toDate ? l.inventoryDate.toDate() : new Date(l.inventoryDate), 'dd/MM/yyyy') : 'N/A'}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && !loading && (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4 border-t border-ink/5">
              <History size={48} className="text-ink/10" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-ink/30">Sin trazabilidad de inventarios</p>
                <p className="text-[10px] font-serif italic text-ink/20">No se han registrado actualizaciones manuales de stock recientemente.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
