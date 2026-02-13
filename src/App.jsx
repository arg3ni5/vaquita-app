import { useState } from 'react';
import { Cloud, ListFilter, PlusCircle } from 'lucide-react';
import { useVaquita } from './hooks/useVaquita';
import { showConfirm } from './utils/swal';
import Header from './components/Header';
import JoinVaquita from './components/JoinVaquita';
import FriendSection from './components/FriendSection';
import ExpenseSection from './components/ExpenseSection';
import SummarySection from './components/SummarySection';

const App = () => {
  const {
    vaquitaId,
    selectVaquita,
    leaveVaquita,
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
    loginWithGoogle,
    loginWithPhone,
    logout,
    totals,
    title,
    updateVaquitaInfo,
    toggleSettlementPaid
  } = useVaquita();

  const [showForms, setShowForms] = useState(false);

  const handleReset = async () => {
    const result = await showConfirm('¿Estás seguro?', '¿Borrar TODOS los datos de la nube definitivamente?');
    if (result.isConfirmed) {
      await resetAll();
    }
  };

  const handleRemoveFriend = async (id) => {
    const result = await showConfirm('¿Eliminar amigo?', '¿Eliminar a este amigo? Se borrarán también sus gastos.');
    if (result.isConfirmed) {
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

  if (!vaquitaId) {
    return (
      <JoinVaquita
        onSelect={selectVaquita}
        user={user}
        loginWithGoogle={loginWithGoogle}
        loginWithPhone={loginWithPhone}
        logout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <Header
          title={title}
          updateVaquitaInfo={updateVaquitaInfo}
          currency={currency}
          setCurrency={setCurrency}
          onReset={handleReset}
          vaquitaId={vaquitaId}
          onLeave={leaveVaquita}
        />

        {/* Mobile Toggle Button */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowForms(!showForms)}
            className="w-full bg-white border border-slate-200 text-slate-700 py-4 rounded-[2rem] font-black shadow-sm flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest"
          >
            {showForms ? (
              <><ListFilter className="w-5 h-5 text-indigo-500" /> Ver Resumen</>
            ) : (
              <><PlusCircle className="w-5 h-5 text-indigo-500" /> Amigos y Gastos</>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`lg:col-span-5 space-y-6 ${showForms ? 'block' : 'hidden lg:block'}`}>
            <FriendSection
              friends={friends}
              onAdd={addFriend}
              onUpdate={updateFriend}
              onRemove={handleRemoveFriend}
              user={user}
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
              vaquitaId={vaquitaId}
              title={title}
              toggleSettlementPaid={toggleSettlementPaid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
