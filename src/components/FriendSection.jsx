import React, { useState } from 'react';
import { UserPlus, Check, X, Edit2, Trash2 } from 'lucide-react';
import { showAlert } from '../utils/swal';

const FriendSection = ({ friends, onAdd, onUpdate, onRemove, user }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [friendExempt, setFriendExempt] = useState(false);
  const [friendCoveredBy, setFriendCoveredBy] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editExempt, setEditExempt] = useState(false);
  const [editCoveredBy, setEditCoveredBy] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = friendName.trim();
    if (!trimmedName) {
      await showAlert("Campo requerido", "Por favor ingresa un nombre.", "warning");
      return;
    }
    setIsSaving(true);
    try {
      await onAdd(trimmedName, friendPhone, null, friendExempt, friendCoveredBy);
      setFriendName('');
      setFriendPhone('');
      setFriendExempt(false);
      setFriendCoveredBy(null);
    } finally {
      setIsSaving(false);
    }
  };

  const startEdit = (friend) => {
    setEditingId(friend.id);
    setEditName(friend.name);
    setEditPhone(friend.phone);
    setEditExempt(friend.exempt || false);
    setEditCoveredBy(friend.coveredBy || null);
  };

  const handleUpdate = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      await showAlert("Campo requerido", "El nombre no puede estar vacío.", "warning");
      return;
    }
    onUpdate(editingId, trimmedName, editPhone, editExempt, editCoveredBy);
    setEditingId(null);
  };

  const addMe = () => {
    if (user && !user.isAnonymous) {
      const myName = user.displayName || user.email?.split('@')[0] || "Yo";
      const myPhone = user.phoneNumber || "";
      onAdd(myName, myPhone, user.uid);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Amigos
        </h2>
        <div className="flex items-center gap-2">
          {user && !user.isAnonymous && !friends.some(f => f.phone === user.phoneNumber?.replace(/\D/g, '')) && (
            <button
              onClick={addMe}
              className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors uppercase tracking-tighter border border-indigo-100"
            >
              + Soy Yo
            </button>
          )}
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label={isFormVisible ? "Ocultar formulario de amigos" : "Mostrar formulario de amigos"}
          >
            {isFormVisible ? 'Ocultar' : 'Añadir'}
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className={`flex-col gap-2 mb-6 ${isFormVisible ? 'flex' : 'hidden'}`}>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            placeholder="Nombre"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            disabled={isSaving}
          />
          <input
            placeholder="Teléfono"
            value={friendPhone}
            onChange={(e) => setFriendPhone(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
            disabled={isSaving}
          />
        </div>
        
        {/* Checkbox Invitado */}
        <label className="flex items-center gap-2 text-sm text-slate-600 px-1 cursor-pointer">
          <input
            type="checkbox"
            checked={friendExempt}
            onChange={(e) => {
              setFriendExempt(e.target.checked);
              if (e.target.checked) {
                setFriendCoveredBy(null); // Si es invitado, no puede tener coveredBy
              }
            }}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            disabled={isSaving}
          />
          <span className="font-medium">🎁 Esta persona está invitada (no paga)</span>
        </label>

        {/* Select para quién cubre su cuota */}
        {!friendExempt && (
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1 px-1">
              ¿Alguien cubrirá su cuota?
            </label>
            <select
              value={friendCoveredBy || ''}
              onChange={(e) => setFriendCoveredBy(e.target.value || null)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={isSaving}
            >
              <option value="">Pagará por sí mismo/a</option>
              {friends
                .filter(f => !f.exempt) // No mostrar invitados como opciones
                .map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} cubrirá esta cuota
                  </option>
                ))}
            </select>
          </div>
        )}

        <button
          disabled={isSaving}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? '...' : 'Añadir'}
        </button>
      </form>

      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {friends.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-2 italic">Sin amigos registrados</p>
        ) : (
          friends.map(f => (
            <div key={f.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
              {editingId === f.id ? (
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      placeholder="Teléfono"
                    />
                  </div>
                  
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editExempt}
                      onChange={(e) => {
                        setEditExempt(e.target.checked);
                        if (e.target.checked) {
                          setEditCoveredBy(null);
                        }
                      }}
                      className="w-3 h-3 rounded"
                    />
                    <span>🎁 Invitado</span>
                  </label>

                  {!editExempt && (
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">
                        ¿Quién cubre?
                      </label>
                      <select
                        value={editCoveredBy || ''}
                        onChange={(e) => setEditCoveredBy(e.target.value || null)}
                        className="w-full px-2 py-1 border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">Pagará por sí mismo/a</option>
                        {friends
                          .filter(friend => !friend.exempt && friend.id !== editingId)
                          .map(friend => (
                            <option key={friend.id} value={friend.id}>
                              {friend.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={handleUpdate} 
                      className="flex-1 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Guardar
                    </button>
                    <button 
                      onClick={() => setEditingId(null)} 
                      className="flex-1 bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors flex items-center justify-center gap-1"
                    >
                      <X className="w-3 h-3" /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-700 text-xs">{f.name}</span>
                    
                    {f.exempt && (
                      <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
                        🎁 Invitado
                      </span>
                    )}
                    
                    {f.coveredBy && (() => {
                      const coveringFriend = friends.find(friend => friend.id === f.coveredBy);
                      if (!coveringFriend || coveringFriend.exempt) return null;
                      return (
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
                          💸 {coveringFriend.name} cubre
                        </span>
                      );
                    })()}
                    
                    {f.phone && (
                      <span className="text-[10px] text-slate-400">{f.phone}</span>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => startEdit(f)} className="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors active:scale-90">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onRemove(f.id)} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors active:scale-90">
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
  );
};

export default FriendSection;
