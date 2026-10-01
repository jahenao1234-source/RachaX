import React from 'react';
import { Download } from 'lucide-react';
import { useInstalar } from './useInstalar';
import { sePuedeInstalarAqui } from '../../utils/instalarUtils';

export const CompactPwaInstallBtn: React.FC = () => {
  const { caso, estado, instalar, abrirHojaInstalar } = useInstalar();

  if (!sePuedeInstalarAqui(caso) || estado === 'dijo_que_si' || estado === 'instalada') {
    return null;
  }

  const handleInstall = async () => {
    if (caso === 'android-boton') {
      await instalar();
    } else {
      abrirHojaInstalar();
    }
  };

  return (
    <button
      id="compact-pwa-install-btn"
      type="button"
      onClick={handleInstall}
      aria-label="Instalar Racha en este dispositivo"
      className="flex lg:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-15)] hover:bg-[var(--accent-25)] border border-[var(--accent-40)] text-[var(--accent)] hover:opacity-90 text-xs font-semibold font-heading transition-all active:scale-95 animate-fadeIn"
    >
      <Download size={13} />
      <span>Instalar</span>
    </button>
  );
};
