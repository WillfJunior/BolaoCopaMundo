import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Plus, Users, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { queryKeys } from '../../types/api';
import { BolaoGroupCard } from '../../components/bolaoGroup/BolaoGroupCard';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter ao menos 3 caracteres').max(60),
  description: z.string().max(200).optional(),
});
type FormValues = z.infer<typeof schema>;

export function MyBolaoGroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const qc = useQueryClient();

  const { data: groups, isLoading } = useQuery({
    queryKey: queryKeys.bolaoGroups,
    queryFn: bolaoGroupsApi.list,
    staleTime: 60_000,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const create = useMutation({
    mutationFn: (data: FormValues) => bolaoGroupsApi.create(data),
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: queryKeys.bolaoGroups });
      toast.success(`Grupo "${group.name}" criado!`);
      reset();
      setShowCreate(false);
    },
    onError: () => toast.error('Erro ao criar grupo'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md shadow-green-200">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Meus Grupos</h1>
            <p className="text-xs text-slate-400">{groups?.length ?? 0} grupos</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold shadow-md shadow-green-200 hover:bg-green-700 transition-colors"
        >
          {showCreate ? <X size={16} /> : <Plus size={16} />}
          {showCreate ? 'Cancelar' : 'Criar grupo'}
        </motion.button>
      </div>

      {/* Create group form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-5 space-y-4">
              <h2 className="font-bold text-slate-800 text-sm">Novo grupo</h2>
              <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nome do grupo *
                  </label>
                  <input
                    {...register('name')}
                    placeholder="Ex: Galera do Trabalho"
                    className="input"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1">⚠ {errors.name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Descrição (opcional)
                  </label>
                  <textarea
                    {...register('description')}
                    placeholder="Adicione uma descrição..."
                    rows={2}
                    className="input resize-none"
                  />
                </div>
                <button type="submit" disabled={create.isPending} className="btn-primary">
                  {create.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {create.isPending ? 'Criando...' : 'Criar grupo'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="space-y-3">
          {groups.map((g, i) => (
            <BolaoGroupCard key={g.id} group={g} index={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-slate-400"
        >
          <Users size={52} className="mx-auto mb-4 opacity-20" />
          <p className="font-semibold text-slate-500 text-base">Nenhum grupo ainda</p>
          <p className="text-sm mt-1.5 max-w-xs mx-auto">
            Crie um grupo e convide seus amigos para competir!
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowCreate(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold text-sm shadow-md shadow-green-200"
          >
            <Plus size={16} /> Criar meu primeiro grupo
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
