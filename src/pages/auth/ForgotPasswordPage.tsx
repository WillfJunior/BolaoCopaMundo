import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth';
import { PhoneInput, cleanPhone } from '../../components/ui/PhoneInput';

const container = { animate: { transition: { staggerChildren: 0.07 } } };
const item = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { ease: 'easeOut' as const } },
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValidPhone, setIsValidPhone] = useState(false);

  const { mutate, isPending, isSuccess, data, error } = useMutation({
    mutationFn: () => authApi.forgotPassword(cleanPhone(phoneNumber)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidPhone) {
      mutate();
    }
  };

  // Success screen
  if (isSuccess && data) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6"
            >
              <CheckCircle size={32} className="text-green-600" />
            </motion.div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">Sucesso!</h1>
            <p className="text-slate-600 mb-6">
              Olá <span className="font-semibold">{data.userName}</span>, sua senha temporária foi
              enviada para você via <span className="font-semibold">notificação push</span>.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
              <p className="text-sm text-blue-800">
                📱 Verifique suas notificações push para ver a senha temporária
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
              >
                Ir para Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
              >
                Voltar à Página Inicial
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">⚡ Próximos passos:</h3>
              <ol className="text-left text-sm text-slate-600 space-y-2">
                <li className="flex gap-3">
                  <span className="font-bold text-green-600 flex-shrink-0">1</span>
                  <span>Copie a senha temporária do push</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-600 flex-shrink-0">2</span>
                  <span>Faça login na tela de login</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-600 flex-shrink-0">3</span>
                  <span>Altere para uma senha de sua preferência</span>
                </li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="h-1 bg-linear-to-r from-blue-500 via-blue-400 to-blue-600" />

          <div className="p-8">
            {/* Back button */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para Login
            </button>

            {/* Title */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Recuperar Senha</h1>
              </div>
              <p className="text-slate-600 text-sm">
                Insira seu número de telefone e receberemos uma senha temporária via notificação push.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-start gap-3"
              >
                <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Erro ao recuperar senha</p>
                  <p className="text-xs text-red-700 mt-1">
                    {error instanceof Error
                      ? error.message
                      : 'Telefone não encontrado. Verifique se está correto.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <motion.div
                variants={container}
                initial="initial"
                animate="animate"
                className="space-y-5"
              >
                {/* Phone input */}
                <motion.div variants={item}>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Número de Telefone
                  </label>
                  <PhoneInput
                    value={phoneNumber}
                    onChange={(value, isValid) => {
                      setPhoneNumber(value);
                      setIsValidPhone(isValid);
                    }}
                    placeholder="(11) 98765-4321"
                    disabled={isPending}
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Use o mesmo número que usou ao se registrar
                  </p>
                </motion.div>

                {/* Submit button */}
                <motion.button
                  variants={item}
                  type="submit"
                  disabled={!isValidPhone || isPending}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      📤 Enviar Senha
                    </>
                  )}
                </motion.button>

                {/* Info box */}
                <motion.div
                  variants={item}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
                >
                  <p className="text-xs text-amber-800">
                    <span className="font-semibold">⚡ Importante:</span> Certifique-se de que a notificação
                    push está ativada para receber a senha temporária.
                  </p>
                </motion.div>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
