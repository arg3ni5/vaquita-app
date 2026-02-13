import React, { useState } from 'react';
import { Receipt, History, Edit2, Trash2, Check, X } from 'lucide-react';
import { showAlert } from '../utils/swal';

const ExpenseSection = ({ expenses, friends, currency, onAdd, onUpdate, onRemove }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFriendId, setEditFriendId] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount);
    if (!selectedFriendId) {
      await showAlert("Campo requerido", "Selecciona quién pagó.", "warning");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      await showAlert("Monto inválido", "Ingresa un monto válido mayor a 0.", "warning");
      return;
    }
    setIsSaving(true);
    try {
      await onAdd(selectedFriendId, expenseAmount, expenseDescription);
      setExpenseAmount('');
      setExpenseDescription('');
      setSelectedFriendId('');
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (expense) => {
    setEditingId(expense.id);
    setEditFriendId(expense.friendId);
    setEditAmount(expense.amount);
    setEditDescription(expense.description || '');
  };

  const handleUpdate = async () => {
    const amount = parseFloat(editAmount);
    if (!editFriendId) {
      await showAlert("Campo requerido", "Selecciona un amigo.", "warning");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      await showAlert("Monto inválido", "Ingresa un monto válido mayor a 0.", "warning");
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(editingId, editFriendId, editAmount, editDescription);
      setEditingId(null);
    } catch (error) {
      console.error('Error al actualizar el gasto:', error);
      await showAlert("Error", "No se pudo actualizar el gasto. Inténtalo de nuevo.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const getFriendName = (id) => friends.find(f => f.id === id)?.name || '?';

  return (
    <div className="space-y-6">
      {/* Registro de Gastos */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Receipt className="w-4 h-4" /> 2. Registrar Pago
          </h2>
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="lg:hidden text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
            aria-label={isFormVisible ? "Ocultar formulario de gastos" : "Mostrar formulario de gastos"}
          >
            {isFormVisible ? 'Ocultar' : 'Gastos'}
          </button>
        </div>
        <form onSubmit={handleSubmit} className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${isFormVisible ? '' : 'hidden'} lg:grid`}>
          <select
            value={selectedFriendId}
            onChange={(e) => setSelectedFriendId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm cursor-pointer"
          >
            <option value="">¿Quién pagó?</option>
            {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">{currency}</span>
            <input
              type="number"
              placeholder="Monto"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>
          <input
            type="text"
            placeholder="Descripción (ej. Pizza, Gasolina...)"
            value={expenseDescription}
            onChange={(e) => setExpenseDescription(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
          <button
            disabled={isSaving}
            className="sm:col-span-2 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Registrando...' : 'Registrar Pago'}
          </button>
        </form>
      </div>

      {/* Historial */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <History className="w-4 h-4" /> 3. Historial
        </h2>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {expenses.length === 0 ? (
            <p className="text-center text-slate-400 text-xs py-2 italic">No hay gastos registrados</p>
          ) : (
            expenses.map(exp => (
              <div key={exp.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                {editingId === exp.id ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={editFriendId}
                          onChange={(e) => setEditFriendId(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          {friends.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Descripción"
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 bg-white border border-slate-200 rounded-lg active:scale-90">
                        <X className="w-4 h-4" />
                      </button>
                      <button onClick={handleUpdate} className="p-1.5 text-white bg-emerald-500 rounded-lg active:scale-90">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-sm">{getFriendName(exp.friendId)}</p>
                        {exp.description && (
                          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-500 font-medium">
                            {exp.description}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-600 font-bold">{currency}{exp.amount.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(exp)} className="p-2 text-slate-300 hover:text-indigo-500 active:scale-90">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onRemove(exp.id)} className="p-2 text-slate-300 hover:text-red-500 active:scale-90">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseSection;
