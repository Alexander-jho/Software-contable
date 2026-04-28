import React, { useState, useEffect } from 'react';
import { UserService, UserProfile } from '../services/userService';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Trash2, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Lock
} from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('EMPLOYEE');

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      const data = await UserService.getAll();
      setEmployees(data);
    } catch (e) {
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UserService.create({
        name,
        email: email.toLowerCase(),
        role,
        status: 'ACTIVE'
      });
      toast.success('Empleado registrado');
      setIsModalOpen(false);
      resetForm();
      loadEmployees();
    } catch (e) {
      toast.error('Error al registrar empleado');
    }
  };

  const toggleStatus = async (emp: UserProfile) => {
    if (!emp.id) return;
    try {
      const newStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await UserService.update(emp.id, { status: newStatus });
      toast.success('Estado actualizado');
      loadEmployees();
    } catch (e) {
      toast.error('Error al actualizar estado');
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('EMPLOYEE');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-ink uppercase">Gestión de Personal</h1>
          <p className="text-xs font-mono opacity-50 uppercase mt-1">Control de acceso y roles de usuario</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-canvas px-6 py-3 text-xs font-black hover:bg-ink transition-all border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none flex items-center gap-2"
        >
          <UserPlus size={16} /> REGISTRAR EMPLEADO
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <Loader2 className="animate-spin text-ink" size={32} />
          </div>
        ) : employees.length === 0 ? (
          <div className="col-span-full py-20 border-2 border-dashed border-ink/20 flex flex-col items-center justify-center text-ink/30 italic">
            <Users size={48} className="mb-4 opacity-20" />
            No hay empleados registrados.
          </div>
        ) : employees.map((emp) => (
          <div 
            key={emp.id} 
            className={`bg-white border-2 border-ink p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between transition-opacity ${emp.status === 'INACTIVE' ? 'opacity-60' : ''}`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className={`p-2 border border-ink ${emp.role === 'ADMIN' ? 'bg-accent' : 'bg-canvas'}`}>
                  <Shield size={18} className={emp.role === 'ADMIN' ? 'text-canvas' : 'text-ink'} />
                </div>
                <div className={`text-[9px] font-mono px-2 py-1 border border-ink font-black ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {emp.status}
                </div>
              </div>
              
              <div>
                <h3 className="font-black text-sm uppercase leading-tight truncate">{emp.name}</h3>
                <p className="text-[10px] font-mono text-ink/60 truncate flex items-center gap-1 mt-1">
                  <Mail size={10} /> {emp.email}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-ink/40">Rol:</span>
                <span className="text-[9px] font-black uppercase">{emp.role}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink/10 flex gap-2">
              <button 
                onClick={() => toggleStatus(emp)}
                className={`flex-1 text-[9px] font-black py-2 border border-ink transition-all ${emp.status === 'ACTIVE' ? 'bg-canvas hover:bg-red-50' : 'bg-canvas hover:bg-green-50'}`}
              >
                {emp.status === 'ACTIVE' ? 'DESACTIVAR' : 'ACTIVAR'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-canvas border-2 border-ink p-8 w-full max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]"
          >
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <UserPlus size={20} /> Nuevo Acceso
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase">Nombre Completo</label>
                <input 
                  autoFocus
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className="w-full bg-white border border-ink p-3 text-xs font-black focus:ring-1 focus:ring-accent outline-none"
                  placeholder="JUAN PEREZ"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase">Correo Electrónico (Google Login)</label>
                <input 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-ink p-3 text-xs font-black focus:ring-1 focus:ring-accent outline-none"
                  placeholder="ejemplo@gmail.com"
                />
                <p className="text-[8px] font-mono text-ink/40 italic">El empleado debe usar este correo para iniciar sesión.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase">Nivel de Acceso</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-white border border-ink p-3 text-xs font-black focus:ring-1 focus:ring-accent outline-none"
                >
                  <option value="EMPLOYEE">EMPLEADO (SOLO VENTAS)</option>
                  <option value="ADMIN">ADMINISTRADOR (TODO)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-ink py-3 text-xs font-black hover:bg-ink/5 transition-all"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-ink text-canvas py-3 text-xs font-black hover:bg-black transition-all shadow-[4px_4px_0px_0px_rgba(242,125,38,1)] active:shadow-none translate-y-[-2px] active:translate-y-0"
                >
                  CONFIRMAR
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
