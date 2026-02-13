import React, { useState } from "react";
import { Settings, RefreshCw, LogOut, Share2, Check, Pencil } from "lucide-react";
import MySwal, { showAlert } from "../utils/swal";
import logo from "../assets/vaquita-logo.png";

const Header = ({ title, updateVaquitaInfo, currency, setCurrency, onReset, vaquitaId, onLeave }) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const copyLink = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("v", vaquitaId);

      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard
          .writeText(url.toString())
          .then(() => {
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
          })
          .catch(() => {
            showAlert(
              "No se pudo copiar el enlace",
              "Por favor, copia el enlace manualmente desde la barra de direcciones.",
              "error"
            );
          });
      } else {
        showAlert(
          "Copiado no disponible",
          "La función de copiado automático no es compatible con este navegador.",
          "warning"
        );
      }
    } catch {
      showAlert(
        "No se pudo generar el enlace",
        "Intenta recargar la página e inténtalo nuevamente.",
        "error"
      );
    }
  };

  const editTitle = async () => {
    const { value: newTitle } = await MySwal.fire({
      title: "Editar nombre",
      input: "text",
      inputValue: title,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      inputValidator: (value) => {
        const trimmed = (value || "").trim();
        if (!trimmed) {
          return "El nombre no puede estar vacío";
        }
        if (trimmed.length > 100) {
          return "El nombre no puede tener más de 100 caracteres";
        }
        // Check for potentially problematic characters
        if (/[<>'"&]/.test(trimmed)) {
          return "El nombre contiene caracteres no permitidos";
        }
        return null;
      },
      customClass: {
        popup: "rounded-[2rem] border-none shadow-2xl bg-white",
        confirmButton: "bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm mx-2 mb-4",
        cancelButton: "bg-slate-100 text-slate-500 px-8 py-3.5 rounded-2xl font-bold text-sm mx-2 mb-4",
      },
      buttonsStyling: false,
    });
    if (newTitle) {
      await updateVaquitaInfo({ title: newTitle });
    }
  };

  return (
    <header className="overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 mb-8 shadow-sm">

      {/* SECCIÓN SUPERIOR: Branding e Info con Sombra hacia abajo */}
      <div className="relative z-10 bg-white p-5 md:p-8 shadow-[0_12px_20px_-10px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Bloque Izquierdo: Logo + Vaquita App */}
          <div className="flex items-center gap-4">
            <img src={logo} alt="Logo" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-800">
              Vaquita <span className="text-indigo-600">App</span>
            </h1>
          </div>

          {/* Bloque Derecho: Nombre de la sala e ID */}
          <div className="flex flex-col items-center md:items-end min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 mb-1">
              <h2
                onClick={editTitle}
                className="text-xl md:text-2xl font-black text-slate-700 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2"
              >
                {title || "Mi Vaquita"}
                <Pencil className="w-4 h-4 text-slate-300 shrink-0" />
              </h2>
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg text-[10px] font-bold border border-slate-200">
                ID: {vaquitaId}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Nube Activa
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: Controles (Blanco Hueso) */}
      <div className="relative z-0 bg-[#F9FBFC] px-5 py-4 md:px-8 flex flex-wrap items-center justify-between gap-4">

        {/* Botón de compartir - Más ancho en móvil */}
        <button
          onClick={copyLink}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-indigo-700 rounded-2xl font-extrabold text-sm hover:shadow-md border border-slate-200/60 transition-all active:scale-95"
        >
          {copyFeedback ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          <span>{copyFeedback ? "¡Copiado!" : "Compartir enlace"}</span>
        </button>

        {/* Grupo de ajustes y salida */}
        <div className="flex items-center justify-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white px-4 py-2 rounded-2xl border border-slate-200/60 shadow-sm">
            <Settings className="w-4 h-4 text-slate-400 mr-2" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer text-sm"
            >
              <option value="$">$ (Peso/Dólar)</option>
              <option value="€">€ (Euro)</option>
              <option value="¢">¢ (Colón)</option>
              <option value="S/">S/ (Sol)</option>
              <option value="Bs.">Bs. (Bolívar)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-2.5 text-red-500 hover:bg-white hover:shadow-md rounded-xl transition-all"
              title="Reiniciar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={onLeave}
              className="p-2.5 text-slate-400 hover:bg-white hover:shadow-md rounded-xl transition-all"
              title="Salir"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;