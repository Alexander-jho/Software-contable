import React, { useEffect, useState } from 'react';
import { ProductService } from '../services/store';
import { Product, Category, Unit, ProductType } from '../types';
import { Plus, Search, Filter, Edit3, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const CATEGORIES: Category[] = ['Pollo', 'Pescado', 'Cerdo', 'Lácteos', 'Otros'];
const UNITS: Unit[] = ['kg', 'unidad'];
const TYPES: ProductType[] = ['Normal', 'Producción'];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Pollo');
  const [unit, setUnit] = useState<Unit>('kg');
  const [type, setType] = useState<ProductType>('Normal');
  const [stockUnits, setStockUnits] = useState(0);
  const [stockWeight, setStockWeight] = useState(0);
  const [inventoryDate, setInventoryDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const data = await ProductService.getAll();
    if (data) setProducts(data);
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: Omit<Product, 'id' | 'createdAt'> = { 
      name, 
      category, 
      unit, 
      type,
      stockUnits: Number(stockUnits),
      stockWeight: Number(stockWeight),
      inventoryDate: new Date(inventoryDate + 'T12:00:00')
    };
    
    try {
      if (editingProduct) {
        await ProductService.update(editingProduct.id, data);
        toast.success('Producto actualizado');
      } else {
        await ProductService.create(data);
        toast.success('Producto creado');
      }
      loadProducts();
      closeModal();
    } catch (e) {
      toast.error('Error al guardar');
    }
  };

  const openModal = (p?: Product) => {
    if (p) {
      setEditingProduct(p);
      setName(p.name);
      setCategory(p.category);
      setUnit(p.unit);
      setType(p.type);
      setStockUnits(p.stockUnits || 0);
      setStockWeight(p.stockWeight || 0);
      setInventoryDate(p.inventoryDate ? format(p.inventoryDate.toDate ? p.inventoryDate.toDate() : new Date(p.inventoryDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'));
    } else {
      setEditingProduct(null);
      setName('');
      setCategory('Pollo');
      setUnit('kg');
      setType('Normal');
      setStockUnits(0);
      setStockWeight(0);
      setInventoryDate(format(new Date(), 'yyyy-MM-dd'));
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await ProductService.delete(id);
      toast.success('Eliminado');
      loadProducts();
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 font-sans">
      <header className="tech-header">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/40">Maestro de Existencias</span>
          <h1 className="text-lg font-black tracking-tighter text-ink">CATÁLOGO DE PRODUCTOS</h1>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-ink text-canvas px-6 py-2 text-xs font-black hover:bg-black transition-all flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={3} />
          REGISTRAR ITEM
        </button>
      </header>

      <div className="p-8 space-y-6 overflow-y-auto">
        <div className="brutalist-card bg-white overflow-hidden">
          <div className="p-4 border-b border-ink bg-gray-50 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
              <input
                type="text"
                placeholder="FILTRAR POR NOMBRE..."
                className="w-full pl-10 pr-4 py-2 border border-ink/20 focus:outline-none focus:border-ink text-xs font-mono font-bold placeholder:opacity-30"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-[10px] uppercase font-black tracking-widest text-ink/60 border-b border-ink">
                <th className="px-6 py-3">Nombre / Identificador</th>
                <th className="px-6 py-3 text-center">Categoría</th>
                <th className="px-6 py-3 text-center">Protocolo</th>
                <th className="px-6 py-3 text-center">Stock (Un)</th>
                <th className="px-6 py-3 text-center">Stock (Kg)</th>
                <th className="px-6 py-3 text-center">Fecha Inventario</th>
                <th className="px-6 py-3 text-right">ACC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-canvas/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-black text-sm uppercase tracking-tight">{p.name}</div>
                    <div className="text-[9px] font-mono text-ink/40">UID: {p.id.slice(-8).toUpperCase()}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="border border-ink px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-[9px] px-2 py-0.5 font-black uppercase ${p.type === 'Producción' ? 'bg-accent text-white' : 'bg-gray-100'}`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold">{p.stockUnits || 0}</td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-ink/60">{p.stockWeight?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-[10px] font-mono font-bold">
                      {p.inventoryDate ? format(p.inventoryDate.toDate ? p.inventoryDate.toDate() : new Date(p.inventoryDate), 'dd/MM/yyyy') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(p)} className="p-2 border border-ink/10 hover:bg-ink hover:text-canvas transition-all"><Edit3 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 border border-ink/10 hover:bg-accent hover:text-white transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="p-12 text-center text-xs font-serif italic text-gray-400">
              No se localizaron registros para la consulta actual.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-canvas border-2 border-ink w-full max-w-lg overflow-hidden relative shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="p-6 bg-ink text-canvas flex justify-between items-center">
                <h3 className="text-sm font-black tracking-widest uppercase">{editingProduct ? 'Modificar Especificaciones' : 'Alta de Nuevo Producto'}</h3>
                <button onClick={closeModal} className="text-canvas hover:text-accent"><X size={20} strokeWidth={3} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Identificación del Producto</label>
                    <input autoFocus required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border-2 border-ink bg-white font-bold focus:outline-none focus:bg-yellow-50" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Sector / Categoría</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full px-4 py-3 border-2 border-ink bg-white font-bold focus:outline-none">
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Unidad de Medida</label>
                      <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className="w-full px-4 py-3 border-2 border-ink bg-white font-bold focus:outline-none">
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Stock Inicial (Unidades)</label>
                      <input type="number" value={stockUnits} onChange={(e) => setStockUnits(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-ink bg-white font-mono font-black focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Stock Inicial (Kilos)</label>
                      <input type="number" step="0.01" value={stockWeight} onChange={(e) => setStockWeight(Number(e.target.value))} className="w-full px-4 py-3 border-2 border-ink bg-white font-mono font-black focus:outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Fecha de Inventario</label>
                    <input required type="date" value={inventoryDate} onChange={(e) => setInventoryDate(e.target.value)} className="w-full px-4 py-3 border-2 border-ink bg-white font-mono font-black focus:outline-none focus:bg-accent/5" />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Régimen Operativo</label>
                    <div className="flex gap-2 mt-2">
                       {TYPES.map(t => (
                         <button 
                           key={t}
                           type="button" 
                           onClick={() => setType(t)}
                           className={`flex-1 py-3 border-2 font-black text-[10px] uppercase transition-all ${type === t ? 'bg-ink text-canvas border-ink' : 'bg-white text-ink border-ink hover:bg-gray-100'}`}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-ink/10">
                  <button type="button" onClick={closeModal} className="px-6 py-4 text-xs font-black uppercase text-ink/40 hover:text-ink transition-colors">Abortar</button>
                  <button type="submit" className="flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] bg-accent text-white border-2 border-ink hover:bg-[#ff8c42] transition-transform active:scale-95 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                    {editingProduct ? 'ACTUALIZAR REGISTRO' : 'CONFIRMAR ALTA'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
