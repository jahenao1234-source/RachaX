import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div
      id="pwa-install-banner"
      className="mb-4 p-3 rounded-[16px] bg-[#1A1C24] border border-[var(--accent-30)] flex lg:hidden items-center justify-between shadow-lg animate-fadeIn"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-full bg-[var(--accent-20)] text-[var(--accent)] flex items-center justify-center shrink-0">
          <Download size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold font-heading text-[#F4F4F6] truncate">
            Instalar Racha
          </p>
          <p className="text-[10px] text-[#6B6F7B] truncate">
            Acceso rápido y modo offline en tu dispositivo
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className="px-2.5 py-1 rounded-full bg-[var(--accent)] text-white text-[11px] font-semibold hover:bg-[var(--accent-hover)] transition-colors"
        >
          Instalar
        </button>
        <button
          type="button"
          onClick={() => setShowPrompt(false)}
          className="p-1 text-[#6B6F7B] hover:text-[#F4F4F6]"
          aria-label="Cerrar banner de instalación"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
