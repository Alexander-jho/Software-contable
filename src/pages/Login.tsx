import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { SettingsService, CompanySettings } from '../services/settingsService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<CompanySettings | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    SettingsService.get().then(setConfig);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Autenticación Exitosa!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('ERROR: Debes habilitar el método "Correo/Contraseña" en la consola de Firebase.');
      } else {
        toast.error('ACCESO DENEGADO: Credenciales Inválidas o error de red');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 font-black text-ink/20 text-4xl select-none hidden md:block">
        {config?.name || 'QUE POLLO'}
      </div>
      <div className="absolute bottom-10 right-10 font-mono text-ink/20 text-sm select-none hidden md:block">
        SECURE_AUTH_LAYER: CLOUD_FS
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md brutalist-card bg-canvas overflow-hidden"
      >
        <div className="p-8 border-b border-ink bg-ink text-canvas">
          <h2 className="text-xl font-black tracking-tighter uppercase mb-1">Inicia Sesión</h2>
          <p className="text-[10px] font-mono opacity-50 uppercase">{config?.slogan || 'Acceso Restringido'}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Credencial de Usuario (Email)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                <input
                  required
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-ink p-3 text-xs font-black focus:ring-1 focus:ring-accent outline-none"
                  placeholder="CORREO ELECTRÓNICO"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-black text-ink/40 mb-1 block">Clave de Acceso</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-ink p-3 text-xs font-black focus:ring-1 focus:ring-accent outline-none"
                  placeholder="CONTRASEÑA"
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-accent text-white py-4 text-xs font-black uppercase tracking-[0.3em] border-2 border-ink shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] active:translate-x-[0px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] transition-all disabled:opacity-50 disabled:grayscale"
          >
            {loading ? 'DESENCRIPTANDO...' : 'AUTENTICAR'}
          </button>

          <p className="text-center text-[10px] font-mono text-ink/40 uppercase">
            © {new Date().getFullYear()} {config?.name || 'QUE POLLO'}
          </p>
        </form>
      </motion.div>
    </div>
  );
}
