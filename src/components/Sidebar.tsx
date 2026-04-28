import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Wallet, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { COMPANY_INFO } from '../constants';

export default function Sidebar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'DASHBOARD' },
    { to: '/products', icon: Package, label: 'INVENTARIO' },
    { to: '/transactions', icon: ShoppingCart, label: 'MOVIMIENTOS' },
    { to: '/cash', icon: Wallet, label: 'FLUJO DE CAJA' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-ink flex flex-col z-50">
      <div className="p-6 border-b border-ink bg-canvas">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent border-2 border-ink flex items-center justify-center text-canvas font-black text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            POLLO
          </div>
          <div>
            <h1 className="font-sans font-black text-sm text-ink tracking-tighter leading-none">
              {COMPANY_INFO.name}
            </h1>
            <p className="text-[8px] font-mono opacity-40 uppercase tracking-widest mt-1">SISTEMA DE GESTIÓN</p>
          </div>
        </div>
        <p className="text-[9px] font-mono opacity-50 uppercase truncate border-t border-ink/10 pt-2">USER: {user?.email?.split('@')[0]}</p>
      </div>

      <nav className="flex-1 mt-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-6 py-4 border-b border-ink/10 text-xs font-black tracking-widest transition-all",
              isActive 
                ? "bg-ink text-canvas" 
                : "text-ink hover:bg-gray-100"
            )}
          >
            <item.icon size={16} strokeWidth={2.5} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-ink bg-gray-50">
        <div className="mb-4">
          <div className="text-[10px] uppercase font-bold opacity-40 mb-2">Estado del Motor</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[11px] font-mono font-bold tracking-tighter text-ink/70 uppercase">Sync: Firestore OK</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-[10px] font-black tracking-widest text-red-600 border border-red-600 hover:bg-red-600 hover:text-white transition-all uppercase"
        >
          <LogOut size={16} />
          <span>Finalizar Sesión</span>
        </button>
      </div>
    </aside>
  );
}


