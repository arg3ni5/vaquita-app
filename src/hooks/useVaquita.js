import { useState, useEffect, useMemo } from 'react';
import {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
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
  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Data Synchronization
  useEffect(() => {
    if (!user) return;

    const friendsRef = collection(db, 'artifacts', appId, 'public', 'data', 'friends');
    const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');

    const unsubFriends = onSnapshot(friendsRef, (snapshot) => {
      const friendsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFriends(friendsList);
      setLoading(false);
    }, (error) => console.error("Error loading friends:", error));

    const unsubExpenses = onSnapshot(expensesRef, (snapshot) => {
      const expensesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expensesList);
    }, (error) => console.error("Error loading expenses:", error));

    return () => {
      unsubFriends();
      unsubExpenses();
    };
  }, [user]);

  // CRUD Operations
  const addFriend = async (name, phone) => {
    if (!name.trim() || !user) return;
    const friendsRef = collection(db, 'artifacts', appId, 'public', 'data', 'friends');
    await addDoc(friendsRef, {
      name,
      phone: phone.replace(/\D/g, ''),
      createdAt: Date.now()
    });
  };

  const updateFriend = async (id, name, phone) => {
    if (!id || !user) return;
    const friendDoc = doc(db, 'artifacts', appId, 'public', 'data', 'friends', id);
    await updateDoc(friendDoc, {
      name,
      phone: phone.replace(/\D/g, '')
    });
  };

  const removeFriend = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'friends', id));
    const associatedExpenses = expenses.filter(e => e.friendId === id);
    for (const exp of associatedExpenses) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', exp.id));
    }
  };

  const addExpense = async (friendId, amount) => {
    if (!friendId || !amount || !user) return;
    const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');
    await addDoc(expensesRef, {
      friendId,
      amount: parseFloat(amount),
      createdAt: Date.now()
    });
  };

  const updateExpense = async (id, friendId, amount) => {
    if (!id || !user) return;
    const expenseDoc = doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id);
    await updateDoc(expenseDoc, {
      friendId,
      amount: parseFloat(amount)
    });
  };

  const removeExpense = async (id) => {
    if (!user) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'expenses', id));
  };

  const resetAll = async () => {
    if (!user) return;
    const friendsRef = collection(db, 'artifacts', appId, 'public', 'data', 'friends');
    const expensesRef = collection(db, 'artifacts', appId, 'public', 'data', 'expenses');

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
  };
};
