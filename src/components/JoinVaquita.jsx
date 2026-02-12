import React, { useState } from 'react';
import { Calculator, ArrowRight, Plus } from 'lucide-react';

const JoinVaquita = ({ onSelect }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSelect(name);
    }
  };

  const generateRandom = () => {
    const randomId = Math.random().toString(36).substring(2, 10);
    onSelect(randomId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Vaquita <span className="text-indigo-600">App</span></h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">¡Bienvenido!</h2>
          <p className="text-slate-500 text-sm mt-2">Crea una nueva vaquita o únete a una existente mediante su nombre o código.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Nombre de la Vaquita
            </label>
            <input
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
