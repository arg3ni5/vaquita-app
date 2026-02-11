import React, { useState, useMemo } from 'react';
import {
  Trash2, 
  Calculator,
  ArrowRight, 
  RefreshCw,
  MessageCircle,
  CheckCircle2,
  Settings,
  UserPlus,
  Receipt,
  Edit2,
  Check,
  X,
  History
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Settlement from './components/Settlement';

const App = () => {
  // Estados principales
  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currency, setCurrency] = useState('¢');

  // Estados de formularios (Agregar Amigo)
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');

  // Estados de Edición de Amigos
  const [editingFriendId, setEditingFriendId] = useState(null);
  const [editFriendName, setEditFriendName] = useState('');
  const [editFriendPhone, setEditFriendPhone] = useState('');

  // Estados de formularios (Agregar Gasto)
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Estados de Edición de Gastos
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editFriendId, setEditFriendId] = useState('');
  const [editAmount, setEditAmount] = useState('');

  // --- Lógica de Amigos ---
  const addFriend = (e) => {
    e.preventDefault();
    if (!friendName.trim()) return;
    const newFriend = {
      id: Date.now(),
      name: friendName,
      phone: friendPhone.replace(/\D/g, '')
    };
    setFriends([...friends, newFriend]);
    setFriendName('');
    setFriendPhone('');
  };

  const startEditFriend = (friend) => {
    setEditingFriendId(friend.id);
    setEditFriendName(friend.name);
    setEditFriendPhone(friend.phone);
  };

  const saveEditFriend = () => {
    setFriends(friends.map(f => 
      f.id === editingFriendId 
        ? { ...f, name: editFriendName, phone: editFriendPhone.replace(/\D/g, '') }
        : f
    ));
    setEditingFriendId(null);
  };

  const removeFriend = (id) => {
    if (confirm('¿Eliminar a este amigo? Se borrarán también sus gastos.')) {
      setFriends(friends.filter(f => f.id !== id));
      setExpenses(expenses.filter(e => e.friendId !== id));
    }
  };

  // --- Lógica de Gastos ---
  const addExpense = (e) => {
    e.preventDefault();
    if (!selectedFriendId || !expenseAmount) return;
    const newExpense = {
      id: Date.now(),
      friendId: parseInt(selectedFriendId),
      amount: parseFloat(expenseAmount)
    };
    setExpenses([...expenses, newExpense]);
    setExpenseAmount('');
    setSelectedFriendId('');
  };

  const startEditExpense = (expense) => {
    setEditingExpenseId(expense.id);
    setEditFriendId(expense.friendId);
    setEditAmount(expense.amount);
  };

  const saveEditExpense = () => {
    setExpenses(expenses.map(exp => 
      exp.id === editingExpenseId 
        ? { ...exp, friendId: parseInt(editFriendId), amount: parseFloat(editAmount) }
        : exp
    ));
    setEditingExpenseId(null);
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // --- Cálculos dinámicos ---
  const totals = useMemo(() => {
    if (friends.length === 0) return { total: 0, average: 0, transactions: [], balances: [] };

    const spentPerFriend = friends.map(f => {
      const totalSpent = expenses
        .filter(e => e.friendId === f.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...f, totalSpent };
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const average = total / friends.length;
    
    const balances = spentPerFriend.map(f => ({
      name: f.name,
      phone: f.phone,
      balance: f.totalSpent - average
    }));

    const debtors = balances
      .filter(b => b.balance < -0.01)
      .map(b => ({ ...b, balance: Math.abs(b.balance) }))
      .sort((a, b) => b.balance - a.balance);
    
    const creditors = balances
      .filter(b => b.balance > 0.01)
      .sort((a, b) => b.balance - a.balance);

    const transactions = [];
    let dIdx = 0;
    let cIdx = 0;

    const tempDebtors = JSON.parse(JSON.stringify(debtors));
    const tempCreditors = JSON.parse(JSON.stringify(creditors));

    while (dIdx < tempDebtors.length && cIdx < tempCreditors.length) {
      const amount = Math.min(tempDebtors[dIdx].balance, tempCreditors[cIdx].balance);
      
      if (amount > 0.01) {
        transactions.push({
          from: tempDebtors[dIdx].name,
          fromPhone: tempDebtors[dIdx].phone,
          to: tempCreditors[cIdx].name,
          amount: amount
        });
      }

      tempDebtors[dIdx].balance -= amount;
      tempCreditors[cIdx].balance -= amount;

      if (tempDebtors[dIdx].balance < 0.01) dIdx++;
      if (tempCreditors[cIdx].balance < 0.01) cIdx++;
    }

    return { total, average, transactions, balances, spentPerFriend };
  }, [friends, expenses]);

  const resetAll = () => {
    if (confirm('¿Borrar todos los datos?')) {
      setFriends([]);
      setExpenses([]);
      setEditingExpenseId(null);
      setEditingFriendId(null);
    }
  };

  const sendWhatsApp = (t) => {
    const wave = "\u{1F44B}"; // 👋
    const cow = "\u{1F404}";  // 🐄
    const message = `¡Hola ${t.from}! ${wave} Según las cuentas de la Vaquita ${cow}, te toca pagar ${currency}${t.amount.toFixed(2)} a ${t.to}. ¡Gracias!`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${t.fromPhone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  const getFriendName = (id) => friends.find(f => f.id === id)?.name || 'Desconocido';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header & Configuración */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Vaquita <span className="text-indigo-600">App</span></h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <Settings className="w-4 h-4 text-slate-400 mr-2" />
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer"
              >
                <option value="$">$ (Peso/Dólar)</option>
                <option value="€">€ (Euro)</option>
                <option value="¢">¢ (Colón)</option>
                <option value="S/">S/ (Sol)</option>
                <option value="Bs.">Bs. (Bolívar/Boliviano)</option>
                <option value="Q">Q (Quetzal)</option>
              </select>
            </div>
            <button onClick={resetAll} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Limpiar todo">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna 1: Amigos y Gastos */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Gestión de Amigos (EDITABLE) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> 1. Lista de Amigos
              </h2>
              <form onSubmit={addFriend} className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                  placeholder="Nombre"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
                <input
                  placeholder="Teléfono"
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                />
                <button className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm">
                  Añadir
                </button>
              </form>

              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                {friends.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-2 italic">No hay amigos registrados</p>
                ) : (
                  friends.map(f => (
                    <div key={f.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
                      {editingFriendId === f.id ? (
                        <div className="flex flex-1 flex-col sm:flex-row gap-2">
                          <input
                            value={editFriendName}
                            onChange={(e) => setEditFriendName(e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <input
                            value={editFriendPhone}
                            onChange={(e) => setEditFriendPhone(e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <div className="flex gap-1">
                            <button onClick={saveEditFriend} className="p-1.5 text-white bg-emerald-500 rounded-lg hover:bg-emerald-600">
                              <Check className="w-3 h-3" />
                            </button>
                            <button onClick={() => setEditingFriendId(null)} className="p-1.5 text-slate-400 bg-white border border-slate-200 rounded-lg hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="truncate flex-1">
                            <p className="font-bold text-slate-700 text-xs truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-400">{f.phone || 'Sin teléfono'}</p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button onClick={() => startEditFriend(f)} className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => removeFriend(f.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Registro de Gastos */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Receipt className="w-4 h-4" /> 2. Nuevo Gasto
              </h2>
              <form onSubmit={addExpense} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={selectedFriendId}
                  onChange={(e) => setSelectedFriendId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm cursor-pointer"
                >
                  <option value="">¿Quién pagó?</option>
                  {friends.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
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
                <button className="sm:col-span-2 bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">
                  Registrar Pago
                </button>
              </form>
            </div>

            {/* Historial de Gastos (EDITABLE) */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <History className="w-4 h-4" /> 3. Historial de Gastos
              </h2>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {expenses.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4 italic">No hay gastos registrados</p>
                ) : (
                  expenses.map(exp => (
                    <div key={exp.id} className="bg-slate-50 rounded-2xl p-3 border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                      {editingExpenseId === exp.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={editFriendId}
                              onChange={(e) => setEditFriendId(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            >
                              {friends.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingExpenseId(null)} className="p-1.5 text-slate-400 hover:text-red-500 bg-white rounded-lg border border-slate-100">
                              <X className="w-4 h-4" />
                            </button>
                            <button onClick={saveEditExpense} className="p-1.5 text-white bg-emerald-500 rounded-lg hover:bg-emerald-600">
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{getFriendName(exp.friendId)}</p>
                            <p className="text-xs text-indigo-600 font-bold">{currency}{exp.amount.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => startEditExpense(exp)} 
                              className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                              title="Editar gasto"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => removeExpense(exp.id)} 
                              className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              title="Eliminar gasto"
                            >
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

          {/* Columna 2: Resumen y Liquidación */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Dashboard */}
            <Dashboard totals={totals} friends={friends} currency={currency} />

            {/* Cuentas por Saldar */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[400px]">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                Liquidación Final
              </h2>

              <div className="space-y-4">
                {totals.transactions.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium italic text-sm">
                      {friends.length < 2 ? 'Añade más amigos para calcular.' : '¡Todo está saldado!'}
                    </p>
                  </div>
                ) : (
                  totals.transactions.map((t, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100 gap-4 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[70px]">
                          <span className="text-[10px] font-black text-red-500 uppercase block mb-1 tracking-tighter">Debe</span>
                          <span className="font-bold text-slate-800 text-sm">{t.from}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300" />
                        <div className="text-center min-w-[70px]">
                          <span className="text-[10px] font-black text-emerald-500 uppercase block mb-1 tracking-tighter">Cobra</span>
                          <span className="font-bold text-slate-800 text-sm">{t.to}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100">
                        <span className="text-xl font-black text-slate-900">
                          {currency}{t.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        {t.fromPhone && (
                          <button
                            onClick={() => sendWhatsApp(t)}
                            className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-all shadow-sm flex items-center gap-2 font-bold text-xs active:scale-95"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Cobrar
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Balances Individuales */}
            <Settlement totals={totals} friends={friends} currency={currency} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;