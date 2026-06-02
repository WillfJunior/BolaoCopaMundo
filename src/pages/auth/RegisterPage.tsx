import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Lock, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { PhoneInput, cleanPhone } from '../../components/ui/PhoneInput';

const schema = z
  .object({
    name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    phoneNumber: z
      .string()
      .refine(
        (v) => v.replace(/\D/g, '').length >= 10,
        'Informe DDD + número (ex: (11) 99999-9999)'
      ),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/\d/, 'Deve conter ao menos um número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const item = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { ease: 'easeOut' as const } },
};

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phoneNumber: '', password: '', confirmPassword: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      authApi.register({
        name: data.name,
        phoneNumber: cleanPhone(data.phoneNumber),
        password: data.password,
      }),
    onSuccess: ({ token, user }) => {
      qc.clear();
      setAuth(token, user);
      navigate('/', { replace: true });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Erro ao cadastrar'),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 py-8">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-green-600/15 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className="relative w-full max-w-sm mx-4"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-br from-emerald-600 to-green-700 px-8 pt-7 pb-8 text-white relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              className="absolute -left-8 -bottom-8 w-32 h-32 border-4 border-white/10 rounded-full"
            />
            <div className="relative">
              <div className="text-3xl mb-2">🏆</div>
              <h1 className="text-xl font-bold">Criar conta grátis</h1>
              <p className="text-green-100 text-sm mt-0.5">Copa do Mundo 2026 · Bolão</p>
            </div>
          </div>

          {/* Form */}
          <motion.form
            variants={stagger}
            initial="initial"
            animate="animate"
            onSubmit={handleSubmit((v) => mutate(v))}
            className="px-8 py-5 space-y-3.5"
          >
            {/* Name */}
            <motion.div variants={item}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Nome completo
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  {...register('name')}
                  type="text"
                  placeholder="Ex: João Silva"
                  className="input pl-10"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1.5">⚠ {errors.name.message}</p>
              )}
            </motion.div>

            {/* Phone */}
            <motion.div variants={item}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Telefone
              </label>
              <Controller
                control={control}
                name="phoneNumber"
                render={({ field: { value, onChange } }) => (
                  <PhoneInput
                    value={value}
                    onChange={onChange}
                    error={!!errors.phoneNumber}
                  />
                )}
              />
              {errors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1.5">⚠ {errors.phoneNumber.message}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={item}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  {...register('password')}
                  type="password"
                  placeholder="Mín. 8 chars com número"
                  className="input pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5">⚠ {errors.password.message}</p>
              )}
            </motion.div>

            {/* Confirm password */}
            <motion.div variants={item}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Confirmar senha
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Repita a senha"
                  className="input pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1.5">⚠ {errors.confirmPassword.message}</p>
              )}
            </motion.div>

            <motion.div variants={item} className="pt-1">
              <button type="submit" disabled={isPending} className="btn-primary">
                {isPending ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                {isPending ? 'Criando conta...' : 'Criar minha conta'}
              </button>
            </motion.div>

            <motion.p variants={item} className="text-center text-sm text-slate-500 pb-1">
              Já tem conta?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                Entrar →
              </Link>
            </motion.p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
