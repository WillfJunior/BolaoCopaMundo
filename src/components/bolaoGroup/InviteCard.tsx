import { useState } from 'react';
import { Copy, Check, Share2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { queryKeys } from '../../types/api';

interface Props {
  groupId: string;
  inviteLink: string;
  whatsAppShareUrl: string;
  inviteCode: string;
}

export function InviteCard({ groupId, inviteLink, whatsAppShareUrl, inviteCode }: Props) {
  const [copied, setCopied] = useState(false);
  const qc = useQueryClient();

  const regen = useMutation({
    mutationFn: () => bolaoGroupsApi.regenerateInvite(groupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bolaoGroup(groupId) });
      toast.success('Link de convite gerado!');
    },
    onError: () => toast.error('Erro ao gerar novo link'),
  });

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {/* Code display */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Código de convite
          </p>
          <button
            onClick={() => regen.mutate()}
            disabled={regen.isPending}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw size={12} className={regen.isPending ? 'animate-spin' : ''} />
            Gerar novo
          </button>
        </div>

        <div className="flex items-center justify-center">
          <span className="font-mono text-3xl font-black text-slate-700 tracking-widest">
            {inviteCode}
          </span>
        </div>

        {/* Link row */}
        <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 px-3 py-2">
          <p className="flex-1 text-xs text-slate-500 truncate font-mono">{inviteLink}</p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={copyLink}
            className="shrink-0 flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </motion.button>
        </div>
      </div>

      {/* WhatsApp share button */}
      <motion.a
        href={whatsAppShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.97 }}
        className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-bold text-white text-sm shadow-lg transition-all"
        style={{
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          boxShadow: '0 4px 16px rgba(37, 211, 102, 0.4)',
        }}
      >
        {/* WhatsApp icon */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Compartilhar no WhatsApp
      </motion.a>

      {/* Native share (if available) */}
      {typeof navigator.share === 'function' && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() =>
            navigator.share({ title: 'Bolão Copa 2026', url: inviteLink }).catch(() => {})
          }
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Share2 size={16} />
          Compartilhar via...
        </motion.button>
      )}
    </div>
  );
}
