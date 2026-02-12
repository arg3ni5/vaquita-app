import React from 'react';
import { CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';

const SummarySection = ({ totals, friends, currency, vaquitaId }) => {
  const getSafeVaquitaId = (rawId) => {
    if (typeof rawId !== 'string') return null;
    const trimmed = rawId.trim();
    if (trimmed === '') return null;
    // Allow only typical ID characters: letters, digits, underscore and hyphen
    return /^[a-zA-Z0-9_-]+$/.test(trimmed) ? trimmed : null;
  };

  const sendWhatsApp = (t) => {
    const shareUrl = new URL(window.location.origin + window.location.pathname);
    const safeVaquitaId = getSafeVaquitaId(vaquitaId);
    if (safeVaquitaId !== null) {
      shareUrl.searchParams.set("v", safeVaquitaId);
    }

    const wave = "\u{1F44B}";
    const cow = "\u{1F404}";
    const link = "\u{1F517}";
    const message = `¡Hola ${t.from}! ${wave} Según las cuentas de la Vaquita ${cow}, te toca pagar ${currency}${t.amount.toFixed(2)} a ${t.to}.

${link} Ver detalle: ${shareUrl.toString()}

¡Gracias!`;
    const url = `https://wa.me/${t.fromPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Gasto Total</p>
          <p className="text-2xl font-black">{currency}{totals.total.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cuota p/p</p>
          <p className="text-2xl font-black">{currency}{totals.average.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-indigo-600 p-5 rounded-3xl shadow-lg shadow-indigo-100 text-white">
          <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Amigos</p>
          <p className="text-2xl font-black">{friends.length}</p>
        </div>
      </div>

      {/* Liquidación Final */}
      <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[400px]">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          Liquidación Final
        </h2>

        <div className="space-y-4">
          {totals.transactions.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic text-sm">Todo está saldado</p>
            </div>
          ) : (
            totals.transactions.map((t, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 gap-4 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[70px]">
                    <span className="text-[10px] font-black text-red-500 uppercase block mb-1">Debe</span>
                    <span className="font-bold text-slate-800 text-sm">{t.from}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                  <div className="text-center min-w-[70px]">
                    <span className="text-[10px] font-black text-emerald-500 uppercase block mb-1">Cobra</span>
                    <span className="font-bold text-slate-800 text-sm">{t.to}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <span className="text-xl font-black text-slate-900">{currency}{t.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  {t.fromPhone && (
                    <button
                      onClick={() => sendWhatsApp(t)}
                      className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 shadow-sm flex items-center gap-2 font-bold text-xs active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" /> Cobrar
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Individual Balances */}
      {friends.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Estado de Balances</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {totals.balances.map((b, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="font-bold text-slate-600 text-xs">{b.name}</span>
                <span className={`font-black text-xs ${b.balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {b.balance >= 0 ? '+' : ''}{currency}{b.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarySection;
