import React, { useState, useEffect } from 'react';
import { SettingsService, CompanySettings } from '../services/settingsService';
import { toast } from 'react-hot-toast';
import { Save, Upload, Building2, User, Phone, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Settings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await SettingsService.get();
      setSettings(data);
    } catch (e) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      await SettingsService.update(settings);
      toast.success('Configuración actualizada correctamente');
      // Refresh to ensure all components get the new data
      window.location.reload();
    } catch (e) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('La imagen es muy pesada (máximo 1MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSettings(prev => prev ? { ...prev, logoUrl: base64String } : null);
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-ink" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-2xl font-black tracking-tighter text-ink uppercase">Configuración de la Empresa</h1>
        <p className="text-xs font-mono opacity-50 uppercase mt-1">Personaliza la identidad visual y legal del sistema</p>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo Section */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border-2 border-ink p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
              <ImageIcon size={14} /> Logo de Empresa
            </h2>
            
            <div className="aspect-square w-full border-2 border-dashed border-ink/20 flex flex-col items-center justify-center relative group overflow-hidden bg-canvas/30">
              {settings?.logoUrl ? (
                <>
                  <img src={settings.logoUrl} alt="Logo preview" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-canvas text-ink px-4 py-2 text-[10px] font-black uppercase">
                      Cambiar Imagen
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                  <Upload className="text-ink/30" />
                  <span className="text-[10px] font-mono text-ink/50 uppercase">Subir Logo (PNG/JPG)</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
            <p className="text-[9px] font-mono text-ink/40 mt-4 leading-tight italic">
              Este logo aparecerá en el menú lateral, facturas de venta y reportes de inventario.
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border-2 border-ink p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase flex items-center gap-2">
                  <Building2 size={12} /> Nombre Comercial
                </label>
                <input 
                  type="text" 
                  value={settings?.name}
                  onChange={e => setSettings(prev => prev ? {...prev, name: e.target.value.toUpperCase()} : null)}
                  className="w-full bg-canvas border border-ink p-3 text-xs font-black focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase flex items-center gap-2">
                  <FileText size={12} /> NIT / Identificación
                </label>
                <input 
                  type="text" 
                  value={settings?.nit}
                  onChange={e => setSettings(prev => prev ? {...prev, nit: e.target.value.toUpperCase()} : null)}
                  className="w-full bg-canvas border border-ink p-3 text-xs focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase flex items-center gap-2">
                  <Phone size={12} /> Teléfono de Contacto
                </label>
                <input 
                  type="text" 
                  value={settings?.tel}
                  onChange={e => setSettings(prev => prev ? {...prev, tel: e.target.value} : null)}
                  className="w-full bg-canvas border border-ink p-3 text-xs focus:ring-1 focus:ring-accent outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase flex items-center gap-2">
                  <User size={12} /> Gerente / Responsable
                </label>
                <input 
                  type="text" 
                  value={settings?.manager}
                  onChange={e => setSettings(prev => prev ? {...prev, manager: e.target.value} : null)}
                  className="w-full bg-canvas border border-ink p-3 text-xs focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase">Eslogan del Negocio</label>
              <input 
                type="text" 
                value={settings?.slogan}
                onChange={e => setSettings(prev => prev ? {...prev, slogan: e.target.value} : null)}
                className="w-full bg-canvas border border-ink p-3 text-xs italic focus:ring-1 focus:ring-accent outline-none"
                placeholder="Ej: Calidad Superior - Pollo Semicriollo"
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="w-full bg-ink text-canvas py-4 text-sm font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-[6px_6px_0px_0px_rgba(242,125,38,1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                GUARDAR CAMBIOS
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
