import React, { useState } from 'react';
import { Calculator, ArrowRight, Plus, Phone, Mail, Check, LogOut, Loader2 } from 'lucide-react';
import { showAlert } from '../utils/swal';

// Map Firebase auth error codes to user-friendly Spanish messages
const AUTH_ERROR_MESSAGES = {
  // Google Sign-in errors
  'auth/popup-blocked': 'El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.',
  'auth/popup-closed-by-user': 'Cerraste la ventana antes de completar el inicio de sesión.',
  'auth/cancelled-popup-request': 'Se canceló la solicitud de inicio de sesión.',
  'auth/network-request-failed': 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado para autenticación.',
  'auth/operation-not-allowed': 'Este método de autenticación no está habilitado.',

  // Phone authentication errors
  'auth/invalid-phone-number': 'El número de teléfono no es válido. Usa el formato internacional (ej: +50688888888).',
  'auth/missing-phone-number': 'Por favor, ingresa un número de teléfono.',
  'auth/quota-exceeded': 'Se excedió el límite de mensajes SMS. Intenta más tarde.',
  'auth/captcha-check-failed': 'Error de verificación reCAPTCHA. Recarga la página e intenta nuevamente.',
  'auth/too-many-requests': 'Demasiados intentos. Por favor, espera un momento antes de intentar nuevamente.',

  // OTP verification errors
  'auth/invalid-verification-code': 'El código ingresado es incorrecto. Verifica e intenta nuevamente.',
  'auth/code-expired': 'El código ha expirado. Solicita un nuevo código.',
  'auth/missing-verification-code': 'Por favor, ingresa el código de verificación.',

  // General errors
  'auth/user-disabled': 'Esta cuenta ha sido deshabilitada.',
  'auth/internal-error': 'Error interno del servidor. Intenta nuevamente más tarde.',
  'auth/timeout': 'La operación tardó demasiado. Verifica tu conexión e intenta nuevamente.'
};

// Utility function to get user-friendly error messages from Firebase auth errors
const getAuthErrorMessage = (error) => {
  const errorCode = error?.code || '';

  // Return specific error message if available, otherwise return a generic message with error code
  if (AUTH_ERROR_MESSAGES[errorCode]) {
    return AUTH_ERROR_MESSAGES[errorCode];
  }

  // If we have an error code but no mapping, show it for debugging
  if (errorCode) {
    return `Error de autenticación (${errorCode}). Por favor, intenta nuevamente.`;
  }

  // Fallback: registrar error original para diagnóstico y mostrar mensaje genérico al usuario
  console.error('Firebase auth error (fallback):', error);
  return 'Error desconocido. Por favor, intenta nuevamente.';
};

const JoinVaquita = ({ onSelect, user, loginWithGoogle, loginWithPhone, logout }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSelect(name);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      showAlert('Error de inicio de sesión con Google', getAuthErrorMessage(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const confirmation = await loginWithPhone(phone, 'recaptcha-container');
      setConfirmationResult(confirmation);
    } catch (error) {
      showAlert('Error de inicio de sesión telefónico', getAuthErrorMessage(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!confirmationResult) {
      return;
    }
    setIsLoading(true);
    try {
      await confirmationResult.confirm(otp);
      setShowPhoneLogin(false);
      setConfirmationResult(null);
    } catch (error) {
      showAlert('Error de verificación OTP', getAuthErrorMessage(error), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandom = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    onSelect(randomId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Vaquita <span className="text-indigo-600">App</span></h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">¡Bienvenido!</h2>
          <p className="text-slate-500 text-sm mt-2">Identifícate para unirte a la vaquita.</p>
        </div>

        {/* User Profile / Auth Selection */}
        <div className="mb-8">
          {user && !user.isAnonymous ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-full">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Sesión Iniciada</p>
                  <p className="text-sm font-bold text-slate-700">{user.displayName || user.email || user.phoneNumber}</p>
                </div>
              </div>
              <button onClick={logout} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {showPhoneLogin ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-indigo-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Login Telefónico</h3>
                    <button onClick={() => {setShowPhoneLogin(false); setConfirmationResult(null)}} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
                  </div>
                  {!confirmationResult ? (
                    <form onSubmit={handlePhoneSubmit} className="space-y-3">
                      <input
                        placeholder="+506 8888 8888"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm"
                      />
                      <button disabled={isLoading} className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar Código"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleOtpSubmit} className="space-y-3">
                      <input
                        placeholder="Código SMS"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-center tracking-widest font-black"
                      />
                      <button disabled={isLoading} className="w-full bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Código"}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-slate-50 transition-all group"
                  >
                    <Mail className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Gmail</span>
                  </button>
                  <button
                    onClick={() => setShowPhoneLogin(true)}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-slate-50 transition-all group"
                  >
                    <Phone className="w-6 h-6 text-slate-400 group-hover:text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Teléfono</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Ahora únete</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="vaquita-name"
              className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1"
            >
              Nombre de la Vaquita
            </label>
            <input
              id="vaquita-name"
              autoFocus
              placeholder="Ej: Paseo-Playa-2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-lg font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
          >
            Entrar <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-bold">o también</span>
          </div>
        </div>

        <button
          onClick={generateRandom}
          className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> Generar código aleatorio
        </button>

        <p className="text-[10px] text-slate-400 mt-8 text-center leading-relaxed">
          Las vaquitas son públicas si conoces el nombre. <br/>
          Usa nombres únicos para mayor privacidad.
        </p>
      </div>
    </div>
  );
};

export default JoinVaquita;
