import React from "react";
import { Calculator, Settings, RefreshCw, Cloud, LogOut, Share2, Check, Pencil } from "lucide-react";
import { useState } from "react";
import MySwal from "../utils/swal";

const Header = ({ title, updateVaquitaInfo, currency, setCurrency, onReset, vaquitaId, onLeave }) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const copyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("v", vaquitaId);

    navigator.clipboard.writeText(url.toString())
      .then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      })
      .catch((err) => {
        console.error("Error al copiar al portapapeles:", err);
      });
  };

  const editTitle = async () => {
    const { value: newTitle } = await MySwal.fire({
      title: "Editar nombre de la vaquita",
      input: "text",
      inputValue: title,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      customClass: {
        popup: 'rounded-[2rem] border-none shadow-2xl bg-white',
        title: 'text-xl font-black text-slate-800 pt-6',
        input: 'rounded-xl border-slate-200 focus:ring-indigo-500 mx-6',
        confirmButton: 'bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mx-2 mb-4',
        cancelButton: 'bg-slate-100 text-slate-500 px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all mx-2 mb-4'
      },
      buttonsStyling: false,
      inputValidator: (value) => {
        if (!value) return "¡Necesitas escribir un nombre!";
      }
    });

    if (newTitle) {
      await updateVaquitaInfo({ title: newTitle });
    }
  };
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
          <Calculator className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1
              onClick={editTitle}
              className="text-2xl font-black tracking-tight leading-none cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2"
            >
              {title || "Vaquita App"}
              <Pencil className="w-4 h-4 text-slate-300" />
            </h1>
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter border border-slate-200">ID: {vaquitaId}</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-bold uppercase">
            <Cloud className="w-3 h-3" /> Nube Activa
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 border border-indigo-100">
          {copyFeedback ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copyFeedback ? "¡Copiado!" : "Compartir enlace"}
        </button>
        <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <Settings className="w-4 h-4 text-slate-400 mr-2" />
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-sm">
            <option value="$">$ (Peso/Dólar)</option>
            <option value="€">€ (Euro)</option>
            <option value="¢">¢ (Colón)</option>
            <option value="S/">S/ (Sol)</option>
            <option value="Bs.">Bs. (Bolívar)</option>
          </select>
        </div>
        <button onClick={onReset} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Limpiar todo">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button onClick={onLeave} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="Salir de la vaquita">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
