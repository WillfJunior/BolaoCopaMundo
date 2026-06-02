import { useRef, useCallback, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PhoneInput, cleanPhone } from '../../components/ui/PhoneInput';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Camera, Bell, BellOff, LogOut, Loader2, Save, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { usersApi } from '../../api/users';
import { authApi } from '../../api/auth';
import { queryKeys } from '../../types/api';
import { useAuth } from '../../hooks/useAuth';
import { usePushNotification } from '../../hooks/usePushNotification';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../../components/ui/UserAvatar';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/\d/, 'Deve conter ao menos um número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const sectionVariant = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function ProfilePage() {
  const { logout } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { isSupported, isSubscribed, isLoading: pushLoading, subscribe, unsubscribe } =
    usePushNotification();

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: usersApi.me,
    staleTime: 5 * 60_000,
  });

  // Sync photoUrl from API to authStore so Header always shows the current photo
  useEffect(() => {
    if (!profile) return;
    const { user, token, setAuth } = useAuthStore.getState();
    if (user && token && profile.photoUrl !== user.photoUrl) {
      setAuth(token, { ...user, photoUrl: profile.photoUrl ?? null });
    }
  }, [profile?.photoUrl]);

  const {
    register: regProfile,
    control: controlProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: profile?.name ?? '', phoneNumber: profile?.phoneNumber ?? '' },
  });

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) =>
      usersApi.update({
        name: data.name,
        phoneNumber: data.phoneNumber ? cleanPhone(data.phoneNumber) : undefined,
      }),
    onSuccess: (updated) => {
      qc.setQueryData(queryKeys.profile, updated);
      const user = useAuthStore.getState().user;
      if (user)
        useAuthStore.getState().setAuth(useAuthStore.getState().token!, {
          ...user,
          name: updated.name,
          phoneNumber: updated.phoneNumber,
        });
      toast.success('Perfil atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar perfil'),
  });

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });
      return usersApi.uploadPhoto(compressed);
    },
    onSuccess: ({ photoUrl }) => {
      qc.invalidateQueries({ queryKey: queryKeys.profile });
      const user = useAuthStore.getState().user;
      if (user)
        useAuthStore.getState().setAuth(useAuthStore.getState().token!, { ...user, photoUrl });
      toast.success('Foto atualizada!');
    },
    onError: () => toast.error('Erro ao enviar foto'),
  });

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadPhoto.mutate(file);
    e.target.value = '';
  }, [uploadPhoto]);

  const changePassword = useMutation({
    mutationFn: (data: PasswordForm) =>
      authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => { toast.success('Senha alterada!'); resetPwd(); },
    onError: () => toast.error('Senha atual incorreta'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="skeleton h-40 rounded-3xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">

      {/* Avatar hero */}
      <motion.div
        variants={sectionVariant}
        initial="initial"
        animate="animate"
        transition={{ delay: 0 }}
        className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl p-6 flex flex-col items-center gap-4 relative overflow-hidden shadow-xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-12 -top-12 w-32 h-32 border border-white/5 rounded-full"
        />

        {/* Avatar click */}
        <button onClick={() => fileRef.current?.click()} className="relative group">
          <UserAvatar
            photoUrl={profile?.photoUrl}
            name={profile?.name ?? ''}
            size="xl"
            className="ring-4 ring-green-500/40 ring-offset-2 ring-offset-slate-800"
          />
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploadPhoto.isPending
              ? <Loader2 size={24} className="text-white animate-spin" />
              : <Camera size={24} className="text-white" />}
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="text-center">
          <p className="text-white font-bold text-lg">{profile?.name}</p>
          <p className="text-slate-400 text-sm">{profile?.phoneNumber}</p>
          {profile?.isAdmin && (
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              ⚡ Administrador
            </span>
          )}
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-400 transition-colors"
        >
          <Camera size={12} /> Trocar foto
        </button>
      </motion.div>

      {/* Edit profile */}
      <motion.div
        variants={sectionVariant}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.08 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4"
      >
        <h2 className="font-bold text-slate-800">Editar dados</h2>
        <form onSubmit={handleProfile((v) => updateProfile.mutate(v))} className="space-y-3">
          <Field label="Nome" error={profileErrors.name?.message}>
            <input {...regProfile('name')} className="input" placeholder="Seu nome" />
          </Field>
          <Field label="Telefone" error={profileErrors.phoneNumber?.message}>
            <Controller
              control={controlProfile}
              name="phoneNumber"
              render={({ field: { value, onChange } }) => (
                <PhoneInput
                  value={value ?? ''}
                  onChange={onChange}
                  error={!!profileErrors.phoneNumber}
                />
              )}
            />
          </Field>
          <button type="submit" disabled={updateProfile.isPending} className="btn-primary">
            {updateProfile.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {updateProfile.isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </motion.div>

      {/* Change password */}
      <motion.div
        variants={sectionVariant}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.14 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4"
      >
        <h2 className="font-bold text-slate-800">Alterar senha</h2>
        <form onSubmit={handlePwd((v) => changePassword.mutate(v))} className="space-y-3">
          {([
            { key: 'currentPassword' as const, label: 'Senha atual' },
            { key: 'newPassword' as const,     label: 'Nova senha' },
            { key: 'confirmPassword' as const, label: 'Confirmar nova senha' },
          ]).map(({ key, label }) => (
            <Field key={key} label={label} error={pwdErrors[key]?.message}>
              <input {...regPwd(key)} type="password" placeholder="••••••••" className="input" />
            </Field>
          ))}
          <button type="submit" disabled={changePassword.isPending} className="btn-primary">
            {changePassword.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
            {changePassword.isPending ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </motion.div>

      {/* Push notifications */}
      {isSupported && (
        <motion.div
          variants={sectionVariant}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="font-bold text-slate-800">Notificações Push</h2>
              <p className="text-xs text-slate-400 mt-1">
                {isSubscribed
                  ? '✅ Ativas — você receberá alertas de jogos'
                  : 'Ative para receber alertas antes dos jogos'}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={pushLoading}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isSubscribed
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-green-600 text-white shadow-md shadow-green-200 hover:bg-green-700'
              }`}
            >
              {pushLoading
                ? <Loader2 size={15} className="animate-spin" />
                : isSubscribed
                  ? <BellOff size={15} />
                  : <Bell size={15} />}
              {isSubscribed ? 'Desativar' : 'Ativar'}
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Logout */}
      <motion.button
        variants={sectionVariant}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.26 }}
        whileTap={{ scale: 0.97 }}
        onClick={logout}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl border border-red-100 bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <LogOut size={18} />
          Sair da conta
        </div>
        <ChevronRight size={16} className="opacity-40" />
      </motion.button>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">⚠ {error}</p>}
    </div>
  );
}
