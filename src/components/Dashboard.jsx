import React from 'react';

export default function Dashboard({ totals, friends, currency }) {
    return (

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
    );
}