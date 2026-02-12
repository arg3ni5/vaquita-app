import React from 'react';
import { Cloud } from 'lucide-react';
import { useVaquita } from './hooks/useVaquita';
import Header from './components/Header';
import FriendSection from './components/FriendSection';
import ExpenseSection from './components/ExpenseSection';
import SummarySection from './components/SummarySection';

const App = () => {
  const {
    friends,
    expenses,
    loading,
    user,
    currency,
    setCurrency,
    addFriend,
    updateFriend,
    removeFriend,
    addExpense,
    updateExpense,
    removeExpense,
    resetAll,
    totals
  } = useVaquita();

  const handleReset = async () => {
    if (confirm('¿Borrar TODOS los datos de la nube definitivamente?')) {
      await resetAll();
    }
  };

  const handleRemoveFriend = async (id) => {
    if (confirm('¿Eliminar a este amigo? Se borrarán también sus gastos.')) {
      await removeFriend(id);
    }
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center animate-pulse">
          <Cloud className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Conectando a la nube...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Header
          currency={currency}
          setCurrency={setCurrency}
          onReset={handleReset}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <FriendSection
              friends={friends}
              onAdd={addFriend}
              onUpdate={updateFriend}
              onRemove={handleRemoveFriend}
            />
            <ExpenseSection
              expenses={expenses}
              friends={friends}
              currency={currency}
              onAdd={addExpense}
              onUpdate={updateExpense}
              onRemove={removeExpense}
            />
          </div>

          <div className="lg:col-span-7">
            <SummarySection
              totals={totals}
              friends={friends}
              currency={currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
