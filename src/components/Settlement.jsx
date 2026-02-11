import React, { useState } from 'react';

export default function Settlement({ totals, friends, currency }) {

    {
        friends.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Resumen Individual</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {totals.balances.map((b, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                            <span className="font-bold text-slate-600 text-xs">{b.name}</span>
                            <span className={`font-black text-xs ${b.balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {b.balance >= 0 ? '+' : ''}{currency}{b.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}