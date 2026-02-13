import React, { useState } from 'react';
import { CheckCircle2, ArrowRight, MessageCircle, Lock, History, Trash2, ChevronDown, ChevronUp, Image as ImageIcon, FileText } from 'lucide-react';
import { exportAsImage, exportAsPDF } from '../utils/exportUtils';
import { showConfirm, showAlert } from '../utils/swal';

const SummarySection = ({ totals, friends, currency, vaquitaId, archiveVaquita, deleteHistoryItem, history, title }) => {
  const [expandedHistory, setExpandedHistory] = useState(null);

  const handleArchive = async () => {
    if (totals.transactions.length === 0) {
      showAlert("Nada que liquidar", "Aún no hay transacciones para cerrar la vaquita.", "info");
      return;
    }

    const result = await showConfirm(
      '¿Finalizar Vaquita?',
      'Se guardará un resumen en el historial y se borrarán los datos actuales para empezar de cero.'
    );

    if (result.isConfirmed) {
      try {
        await archiveVaquita();
        showAlert("Vaquita Cerrada", "Los datos han sido archivados en el historial.", "success");
      } catch (error) {
        console.error('Error al archivar la vaquita:', error);
        showAlert(
          "Error al cerrar la vaquita",
          "Ocurrió un problema al archivar los datos. Por favor, inténtalo de nuevo.",
          "error"
        );
      }
    }
  };

  const handleExport = async (elementId, filename, format) => {
    if (format === 'image') {
      await exportAsImage(elementId, filename);
    } else {
      await exportAsPDF(elementId, filename);
    }
  };

  const downloadHistory = async (format) => {
    const elementId = "liquidation-card";
    const filename = `vaquita-${title || vaquitaId}-${new Date().toISOString().split('T')[0]}`;
    await handleExport(elementId, filename, format);
  };

  const sendWhatsApp = (t) => {
    const shareUrl = new URL(window.location.href);
    shareUrl.searchParams.set("v", vaquitaId);

    // Use original names; encodeURIComponent below will safely encode special characters
    const fromName = t.from;
    const toName = t.to;

    const wave = "\u{1F44B}";
    const cow = "\u{1F404}";
    const link = "\u{1F517}";
    const message = `¡Hola ${fromName}! ${wave} Según las cuentas de la Vaquita ${cow}, te toca pagar ${currency}${t.amount.toFixed(2)} a ${toName}.

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
      <div id="liquidation-card" className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            Liquidación Final
          </h2>

          <div className="flex items-center gap-2">
            {totals.transactions.length > 0 && (
              <>
                <button
                  onClick={() => downloadHistory('image')}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                  title="Descargar Imagen"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => downloadHistory('pdf')}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                  title="Descargar PDF"
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  onClick={handleArchive}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Lock className="w-4 h-4" /> Finalizar y Cerrar
                </button>
              </>
            )}
          </div>
        </div>

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

      {/* Historial de Liquidaciones */}
      {history.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            Historial de Liquidaciones
          </h3>
          <div className="space-y-4">
            {history.map((h) => (
              <div key={h.id} className="border border-slate-100 rounded-2xl overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedHistory(expandedHistory === h.id ? null : h.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">{h.title}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(h.createdAt).toLocaleDateString()} - {h.friends?.length || 0} amigos
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-indigo-600 text-sm">
                      {h.currency}{h.total?.toLocaleString()}
                    </span>
                    {expandedHistory === h.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {expandedHistory === h.id && (
                  <div id={`history-item-${h.id}`} className="p-4 border-t border-slate-100 bg-white space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2 rounded-xl text-center">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Total</p>
                        <p className="font-black text-slate-700">{h.currency}{h.total?.toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl text-center">
                        <p className="text-[8px] font-bold text-slate-400 uppercase">Promedio</p>
                        <p className="font-black text-slate-700">{h.currency}{h.average?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transacciones</p>
                      {h.transactions?.map((t, i) => (
                        <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                          <span className="font-medium text-slate-600"><span className="font-bold text-red-400">{t.from}</span> → <span className="font-bold text-emerald-500">{t.to}</span></span>
                          <span className="font-black text-slate-800">{h.currency}{t.amount?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(`history-item-${h.id}`, `vaquita-historial-${h.title}-${new Date(h.createdAt).toISOString().split('T')[0]}`, 'image');
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                        title="Exportar Imagen"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExport(`history-item-${h.id}`, `vaquita-historial-${h.title}-${new Date(h.createdAt).toISOString().split('T')[0]}`, 'pdf');
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-all"
                        title="Exportar PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const result = await showConfirm('¿Eliminar del historial?', 'Esta acción no se puede deshacer.');
                          if (result.isConfirmed) {
                            await deleteHistoryItem(h.id);
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SummarySection;
