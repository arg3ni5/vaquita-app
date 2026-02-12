import { useState, useEffect, useMemo } from 'react';
import {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut
} from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { auth, db, appId } from '../firebase';

export const useVaquita = () => {
  const [vaquitaId, setVaquitaId] = useState(() => localStorage.getItem('vaquitaId') || '');
  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(() => !!localStorage.getItem('vaquitaId'));
  const [currency, setCurrency] = useState('¢');

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof globalThis.__initial_auth_token !== 'undefined' && globalThis.__initial_auth_token) {
          await signInWithCustomToken(auth, globalThis.__initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Error:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Synchronization
  useEffect(() => {
    if (!user || !vaquitaId) return;

    const friendsRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'friends');
    const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'expenses');

    const unsubFriends = onSnapshot(friendsRef, (snapshot) => {
      const friendsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriends(friendsList);
      setDataLoading(false);
    }, (error) => {
      console.error("Error loading friends:", error);
      setDataLoading(false);
    });

    const unsubExpenses = onSnapshot(expensesRef, (snapshot) => {
      const expensesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesList);
    }, (error) => console.error("Error loading expenses:", error));

    return () => {
      unsubFriends();
      unsubExpenses();
    };
  }, [user, vaquitaId]);

  // Auth Operations
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google Login Error:", error);
      throw error;
    }
  };

  const loginWithPhone = async (phoneNumber, recaptchaContainerId) => {
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible'
      });
      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error) {
      console.error("Phone Login Error:", error);
      throw error;
    }
  };

  const logout = async () => await signOut(auth);

  // CRUD Operations
  const selectVaquita = (id) => {
    const cleanId = id.trim().toLowerCase().replace(/\s+/g, '-');
    if (cleanId) {
      setDataLoading(true);
      setVaquitaId(cleanId);
      localStorage.setItem('vaquitaId', cleanId);
    }
  };

  const leaveVaquita = () => {
    setVaquitaId('');
    setDataLoading(false);
    localStorage.removeItem('vaquitaId');
    setFriends([]);
    setExpenses([]);
  };

  const addFriend = async (name, phone) => {
    if (!name.trim() || !user || !vaquitaId) return;
    const friendsRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'friends');
    await addDoc(friendsRef, {
      name,
      phone: phone.replace(/\D/g, ''),
      createdAt: Date.now()
    });
  };

  const updateFriend = async (id, name, phone) => {
    if (!id || !user || !vaquitaId) return;
    const friendDoc = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'friends', id);
    await updateDoc(friendDoc, {
      name,
      phone: phone.replace(/\D/g, '')
    });
  };

  const removeFriend = async (id) => {
    if (!user || !vaquitaId) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'friends', id));
    const associatedExpenses = expenses.filter(e => e.friendId === id);
    for (const exp of associatedExpenses) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'expenses', exp.id));
    }
  };

  const addExpense = async (friendId, amount) => {
    if (!friendId || !amount || !user || !vaquitaId) return;
    const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'expenses');
    await addDoc(expensesRef, {
      friendId,
      amount: parseFloat(amount),
      createdAt: Date.now()
    });
  };

  const updateExpense = async (id, friendId, amount) => {
    if (!id || !user || !vaquitaId) return;
    const expenseDoc = doc(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'expenses', id);
    await updateDoc(expenseDoc, {
      friendId,
      amount: parseFloat(amount)
    });
  };

  const removeExpense = async (id) => {
    if (!user || !vaquitaId) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'expenses', id));
  };

  const resetAll = async () => {
    if (!user || !vaquitaId) return;
    const friendsRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'friends');
    const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'sessions', vaquitaId, 'expenses');

    const fDocs = await getDocs(friendsRef);
    const eDocs = await getDocs(expensesRef);

    for (const d of fDocs.docs) await deleteDoc(d.ref);
    for (const d of eDocs.docs) await deleteDoc(d.ref);
  };

  // Calculations
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

    const debtors = balances.filter(b => b.balance < -0.01).map(b => ({ ...b, balance: Math.abs(b.balance) }));
    const creditors = balances.filter(b => b.balance > 0.01);

    const transactions = [];
    const tempDebtors = [...debtors].sort((a, b) => b.balance - a.balance);
    const tempCreditors = [...creditors].sort((a, b) => b.balance - a.balance);

    let d = 0, c = 0;
    while (d < tempDebtors.length && c < tempCreditors.length) {
      const amount = Math.min(tempDebtors[d].balance, tempCreditors[c].balance);
      if (amount > 0.01) {
        transactions.push({ from: tempDebtors[d].name, fromPhone: tempDebtors[d].phone, to: tempCreditors[c].name, amount });
      }
      tempDebtors[d].balance -= amount;
      tempCreditors[c].balance -= amount;
      if (tempDebtors[d].balance < 0.01) d++;
      if (tempCreditors[c].balance < 0.01) c++;
    }

    return { total, average, transactions, balances };
  }, [friends, expenses]);

  return {
    vaquitaId,
    selectVaquita,
    leaveVaquita,
    loginWithGoogle,
    loginWithPhone,
    logout,
    friends,
    expenses,
    loading: authLoading || (!!vaquitaId && dataLoading && friends.length === 0),
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
  };
};
