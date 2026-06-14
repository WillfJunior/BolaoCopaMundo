import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Lock, Loader2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { PhoneInput, cleanPhone } from '../../components/ui/PhoneInput';

const schema = z.object({
  phoneNumber: z
    .string()
    .refine(
      (v) => v.replace(/\D/g, '').length >= 10,
      'Informe DDD + número (ex: (11) 99999-9999)'
    ),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});

type FormValues = z.infer<typeof schema>;

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { ease: 'easeOut' as const } },
};

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const qc = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phoneNumber: '', password: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormValues) =>
      authApi.login({ phoneNumber: cleanPhone(data.phoneNumber), password: data.password }),
    onSuccess: ({ token, user }) => {
      // Clear cached data from any previous session before setting new auth
      qc.clear();
      setAuth(token, user);
      navigate(searchParams.get('redirect') ?? '/', { replace: true });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Credenciais inválidas'),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-900">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-green-600/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl"
        />
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-green-700/10 blur-2xl"
        />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' as const }}
        className="relative w-full max-w-sm mx-4"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
          {/* Header gradient */}
          <div className="bg-linear-to-br from-green-600 to-emerald-700 px-8 pt-8 pb-10 text-white relative overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-8 -top-8 w-32 h-32 border-4 border-white/10 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="absolute -right-4 -top-4 w-20 h-20 border-2 border-white/10 rounded-full"
            />
            <div className="relative">
              <div className="text-4xl mb-2">⚽</div>
              <h1 className="text-2xl font-bold tracking-tight">Bem-vindo!</h1>
              <p className="text-green-100 text-sm mt-1">Copa do Mundo 2026 · Bolão Oficial</p>
            </div>
          </div>

          {/* Form */}
          <motion.form
            variants={stagger}
            initial="initial"
            animate="animate"
            onSubmit={handleSubmit((v) => mutate(v))}
            className="px-8 py-6 space-y-4"
          >
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
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  ⚠ {errors.phoneNumber.message}
                </p>
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
                  placeholder="Mínimo 8 caracteres"
                  className="input pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  ⚠ {errors.password.message}
                </p>
              )}
            </motion.div>

            <motion.div variants={item}>
              <button type="submit" disabled={isPending} className="btn-primary mt-2">
                {isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ChevronRight size={18} />
                )}
                {isPending ? 'Entrando...' : 'Entrar na conta'}
              </button>
            </motion.div>

            <motion.div variants={item} className="text-center text-sm pt-2">
              <Link
                to="/forgot-password"
                className="text-slate-500 hover:text-slate-700 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </motion.div>

            <motion.p variants={item} className="text-center text-sm text-slate-500 pt-1">
              Não tem conta?{' '}
              <Link
                to="/register"
                className="text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                Cadastre-se grátis →
              </Link>
            </motion.p>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
