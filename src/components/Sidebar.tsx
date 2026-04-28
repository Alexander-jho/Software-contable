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
      <div className="p-6 border-b border-ink">
        <h1 className="font-sans font-black text-xl text-ink tracking-tighter">
          FOOD_ERP <span className="text-accent underline decoration-2">v1.0</span>
        </h1>
        <p className="text-[10px] font-mono opacity-50 mt-1 uppercase truncate">{user?.email}</p>
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


