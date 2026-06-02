import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, MoreVertical, Plus, Download } from 'lucide-react';

type Platform = 'ios' | 'android' | 'desktop' | null;

const STORAGE_KEY = 'pwa-install-dismissed';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}

function IOSSteps() {
  return (
    <ol className="flex flex-col gap-3 mt-1">
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
        <span className="text-sm text-slate-600">
          Toque no botão <strong className="text-slate-800">Compartilhar</strong>
          <span className="inline-flex items-center justify-center w-5 h-5 mx-1 rounded bg-slate-100">
            <Share size={12} className="text-slate-600" />
          </span>
          na barra do Safari (parte inferior ou superior da tela).
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
        <span className="text-sm text-slate-600">
          Role para baixo e toque em{' '}
          <strong className="text-slate-800">"Adicionar à Tela de Início"</strong>
          <span className="inline-flex items-center justify-center w-5 h-5 mx-1 rounded bg-slate-100">
            <Plus size={12} className="text-slate-600" />
          </span>.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">3</span>
        <span className="text-sm text-slate-600">
          Toque em <strong className="text-slate-800">"Adicionar"</strong> no canto superior direito.
        </span>
      </li>
    </ol>
  );
}

function AndroidSteps() {
  return (
    <ol className="flex flex-col gap-3 mt-1">
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
        <span className="text-sm text-slate-600">
          Toque no menu
          <span className="inline-flex items-center justify-center w-5 h-5 mx-1 rounded bg-slate-100">
            <MoreVertical size={12} className="text-slate-600" />
          </span>
          (três pontos) no canto superior direito do Chrome.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
        <span className="text-sm text-slate-600">
          Toque em <strong className="text-slate-800">"Adicionar à tela inicial"</strong> ou{' '}
          <strong className="text-slate-800">"Instalar app"</strong>.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">3</span>
        <span className="text-sm text-slate-600">
          Confirme tocando em <strong className="text-slate-800">"Instalar"</strong> ou{' '}
          <strong className="text-slate-800">"Adicionar"</strong>.
        </span>
      </li>
    </ol>
  );
}

function DesktopSteps() {
  return (
    <ol className="flex flex-col gap-3 mt-1">
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">1</span>
        <span className="text-sm text-slate-600">
          Clique no ícone de instalação
          <span className="inline-flex items-center justify-center w-5 h-5 mx-1 rounded bg-slate-100">
            <Download size={12} className="text-slate-600" />
          </span>
          na barra de endereço do navegador.
        </span>
      </li>
      <li className="flex items-start gap-3">
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center mt-0.5">2</span>
        <span className="text-sm text-slate-600">
          Clique em <strong className="text-slate-800">"Instalar"</strong> na janela que aparecer.
        </span>
      </li>
    </ol>
  );
}

const PLATFORM_LABELS: Record<NonNullable<Platform>, string> = {
  ios: '📱 iPhone / iPad',
  android: '📱 Android',
  desktop: '💻 Computador',
};

export function PWAInstallModal() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const detected = detectPlatform();
    setPlatform(detected);

    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, '1');
  }

  if (!platform) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-6 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
              {/* Green top bar */}
              <div className="h-1 bg-linear-to-r from-green-500 via-emerald-400 to-green-600" />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-green-500 to-green-700 flex items-center justify-center shadow-md shadow-green-200 flex-shrink-0">
                      <span className="text-lg">⚽</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Instale o Bolão Copa 2026</p>
                      <p className="text-xs text-slate-500">{PLATFORM_LABELS[platform]}</p>
                    </div>
                  </div>
                  <button
                    onClick={dismiss}
                    className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0 mt-0.5"
                    aria-label="Fechar"
                  >
                    <X size={14} className="text-slate-500" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-3">
                  Adicione o app à sua tela inicial para acesso rápido, sem precisar abrir o navegador.
                </p>

                {platform === 'ios' && <IOSSteps />}
                {platform === 'android' && <AndroidSteps />}
                {platform === 'desktop' && <DesktopSteps />}

                <button
                  onClick={dismiss}
                  className="mt-4 w-full py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-[0.98] transition-all"
                >
                  Entendido!
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
