import { useState, useEffect, useMemo, useCallback } from "react";
import {
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, getDocs, setDoc, serverTimestamp, runTransaction } from "firebase/firestore";
import { auth, db, appId } from "../firebase";
import { AuthError } from "../utils/AuthError";
import { sanitizeId, sanitizeName } from "../utils/sanitization";

export const useVaquita = () => {
  const [vaquitaId, setVaquitaId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("v");
    if (urlId) {
      const cleanId = sanitizeId(urlId);
      if (cleanId) {
        localStorage.setItem("vaquitaId", cleanId);
        return cleanId;
      }
    }
    return localStorage.getItem("vaquitaId") || "";
  });
  const [friends, setFriends] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [history, setHistory] = useState([]);
  const [settlements, setSettlements] = useState({});
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(() => !!localStorage.getItem("vaquitaId"));
  const [currency, setInternalCurrency] = useState("¢");
  const [title, setTitle] = useState("");
  const [userVaquitas, setUserVaquitas] = useState([]);

  // Watch for URL parameter changes
  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const urlId = params.get("v");
      if (urlId) {
        const cleanId = sanitizeId(urlId);
        if (cleanId && cleanId !== vaquitaId) {
          localStorage.setItem("vaquitaId", cleanId);
          setVaquitaId(cleanId);
        }
      }
    };

    // Listen for popstate events (browser back/forward)
    window.addEventListener("popstate", handleUrlChange);
    
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, [vaquitaId]);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof globalThis.__initial_auth_token !== "undefined" && globalThis.__initial_auth_token) {
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

    const sessionRef = doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId);
    const unsubSession = onSnapshot(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.currency) setInternalCurrency(data.currency);
        if (data.title) setTitle(data.title);
      } else {
        // Initialize metadata if it doesn't exist
        setDoc(sessionRef, { title: vaquitaId, currency: "¢", createdAt: serverTimestamp() }, { merge: true });
      }
    });

    const friendsRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "friends");
    const expensesRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "expenses");
    const settlementsRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "settlements");

    const unsubFriends = onSnapshot(
      friendsRef,
      (snapshot) => {
        const friendsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFriends(friendsList);
        setDataLoading(false);
      },
      (error) => {
        console.error("Error loading friends:", error);
        setDataLoading(false);
      },
    );

    const unsubExpenses = onSnapshot(
      expensesRef,
      (snapshot) => {
        const expensesList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setExpenses(expensesList);
      },
      (error) => {
        console.error("Error loading expenses:", error);
      },
    );

    const unsubSettlements = onSnapshot(
      settlementsRef,
      (snapshot) => {
        const settMap = {};
        snapshot.docs.forEach((doc) => {
          settMap[doc.id] = doc.data().paid;
        });
        setSettlements(settMap);
      },
      (error) => {
        console.error("Error loading settlements:", error);
      },
    );

    return () => {
      unsubSession();
      unsubFriends();
      unsubExpenses();
      setHistory([]);
      unsubSettlements();
    };
  }, [user, vaquitaId]);

  // Fetch user's vaquitas
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setUserVaquitas([]);
      return;
    }

    const userVaquitasRef = collection(db, "artifacts", appId, "public", "data", "users", user.uid, "sessions");
    const unsub = onSnapshot(
      userVaquitasRef,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Sort by lastVisited descending
        list.sort((a, b) => {
          const timeA = a.lastVisited?.toMillis ? a.lastVisited.toMillis() : (a.lastVisited || 0);
          const timeB = b.lastVisited?.toMillis ? b.lastVisited.toMillis() : (b.lastVisited || 0);
          return timeB - timeA;
        });
        setUserVaquitas(list);
      },
      (error) => {
        console.error("Error fetching user's vaquitas:", error);
        setUserVaquitas([]);
      },
    );

    return () => unsub();
  }, [user]);

  // Helper function to register/update user's vaquita session
  const saveUserVaquitaSession = useCallback(async (sessionVaquitaId, sessionTitle) => {
    if (!user || user.isAnonymous) return;

    const userVaquitaRef = doc(db, "artifacts", appId, "public", "data", "users", user.uid, "sessions", sessionVaquitaId);

    try {
      await setDoc(
        userVaquitaRef,
        {
          title: sessionTitle,
          lastVisited: serverTimestamp(),
        },
        { merge: true },
      );
    } catch (error) {
      console.error("Failed to register/update vaquita session:", error);
    }
  }, [user]);

  const registerUserSession = useCallback(async () => {
    if (!user || user.isAnonymous || !vaquitaId) return;

    const isParticipant = friends.some(
      (f) => f.uid === user.uid || (user.phoneNumber && f.phone === user.phoneNumber.replace(/\D/g, "")),
    );

    if (!isParticipant) return;

    const sessionTitle = title ? sanitizeName(title) : vaquitaId;
    await saveUserVaquitaSession(vaquitaId, sessionTitle);
  }, [user, vaquitaId, friends, title, saveUserVaquitaSession]);

  // Automatically register/update current vaquita if user is a participant
  useEffect(() => {
    if (friends.length > 0) {
      registerUserSession();
    }
  }, [friends.length, registerUserSession]);

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
      // Basic E.164 validation: must start with '+' and contain digits only after that.
      if (phoneNumber === null || phoneNumber.trim() === "") {
        throw new AuthError("Missing phone number", "auth/missing-phone-number");
      }
      if (typeof phoneNumber !== "string") {
        throw new AuthError("Invalid phone number format. Use E.164 format, e.g. +15551234567", "auth/invalid-phone-number");
      }
      const trimmedPhoneNumber = phoneNumber.trim();
      const e164Pattern = /^\+[1-9]\d{1,14}$/;

      if (!e164Pattern.test(trimmedPhoneNumber)) {
        throw new AuthError("Invalid phone number format. Use E.164 format, e.g. +15551234567", "auth/invalid-phone-number");
      }

      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: "invisible",
      });

      return await signInWithPhoneNumber(auth, trimmedPhoneNumber, recaptchaVerifier);
    } catch (error) {
      console.error("Phone Login Error:", error);
      throw error;
    }
  };

  const logout = async () => signOut(auth);

  // CRUD Operations
  const selectVaquita = (id) => {
    const cleanId = sanitizeId(id);
    if (cleanId) {
      setDataLoading(true);
      setVaquitaId(cleanId);
      localStorage.setItem("vaquitaId", cleanId);

      const url = new URL(window.location.href);
      url.searchParams.set("v", cleanId);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const leaveVaquita = () => {
    setVaquitaId("");
    setDataLoading(false);
    localStorage.removeItem("vaquitaId");
    setFriends([]);
    setExpenses([]);
    setSettlements({});

    const url = new URL(window.location.href);
    url.searchParams.delete("v");
    window.history.replaceState({}, "", url.toString());
  };

  const addFriend = async (name, phone, friendUid = null, exempt = false) => {
    if (!name.trim() || !user || !vaquitaId) return;
    const friendsRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "friends");
    const friendData = {
      name,
      phone: phone.replace(/\D/g, ""),
      createdAt: Date.now(),
      exempt: exempt || false,
    };
    if (friendUid) friendData.uid = friendUid;

    await addDoc(friendsRef, friendData);

    // Register if it's the current user
    if (
      !user.isAnonymous &&
      (friendUid === user.uid || (user.phoneNumber && friendData.phone === user.phoneNumber.replace(/\D/g, "")))
    ) {
      const sessionTitle = title ? sanitizeName(title) : vaquitaId;
      await saveUserVaquitaSession(vaquitaId, sessionTitle);
    }
  };

  const updateFriend = async (id, name, phone, exempt = false) => {
    if (!id || !user || !vaquitaId) return;
    const friendDoc = doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "friends", id);
    await updateDoc(friendDoc, {
      name,
      phone: phone.replace(/\D/g, ""),
      exempt: exempt || false,
    });
  };

  const removeFriend = async (id) => {
    if (!user || !vaquitaId) return;
    await deleteDoc(doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "friends", id));
    const associatedExpenses = expenses.filter((e) => e.friendId === id);
    for (const exp of associatedExpenses) {
      await deleteDoc(doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "expenses", exp.id));
    }
  };

  const addExpense = async (friendId, amount, description = "", coversFor = []) => {
    if (!friendId || !amount || !user || !vaquitaId) return;
    const expensesRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "expenses");
    await addDoc(expensesRef, {
      friendId,
      amount: parseFloat(amount),
      description: description.trim(),
      coversFor: coversFor || [],
      createdAt: Date.now(),
    });
  };

  const updateExpense = async (id, friendId, amount, description = "", coversFor = []) => {
    if (!id || !user || !vaquitaId) return;
    const expenseDoc = doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "expenses", id);
    await updateDoc(expenseDoc, {
      friendId,
      amount: parseFloat(amount),
      description: description.trim(),
      coversFor: coversFor || [],
    });
  };

  const removeExpense = async (id) => {
    if (!user || !vaquitaId) return;
    await deleteDoc(doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "expenses", id));
  };

  const updateVaquitaInfo = async (updates) => {
    if (!user || !vaquitaId) return;
    
    // Whitelist of allowed fields
    const allowedFields = ['title', 'currency'];
    const sanitizedUpdates = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        // Validate and sanitize each field
        if (key === 'title' && typeof value === 'string') {
          const sanitized = sanitizeName(value);
          if (sanitized.length > 0 && sanitized.length <= 100) {
            sanitizedUpdates[key] = sanitized;
          }
        } else if (key === 'currency' && typeof value === 'string') {
          // Whitelist of allowed currencies
          const allowedCurrencies = ['$', '€', '¢', 'S/', 'Bs.'];
          if (allowedCurrencies.includes(value)) {
            sanitizedUpdates[key] = value;
          }
        }
      }
    }
    
    if (Object.keys(sanitizedUpdates).length > 0) {
      const sessionRef = doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId);
      await setDoc(sessionRef, sanitizedUpdates, { merge: true });
    }
  };

  const resetAll = async () => {
    if (!user || !vaquitaId) return;
    const friendsRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "friends");
    const expensesRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "expenses");
    const settlementsRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "settlements");

    const fDocs = await getDocs(friendsRef);
    const eDocs = await getDocs(expensesRef);
    const sDocs = await getDocs(settlementsRef);

    for (const d of fDocs.docs) await deleteDoc(d.ref);
    for (const d of eDocs.docs) await deleteDoc(d.ref);
    for (const d of sDocs.docs) await deleteDoc(d.ref);
  };

  const toggleSettlementPaid = async (fromId, toId) => {
    if (!user || !vaquitaId) return;
    const id = `${fromId}_${toId}`;
    const settlementRef = doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "settlements", id);
    
    await runTransaction(db, async (transaction) => {
      const settlementDoc = await transaction.get(settlementRef);
      const currentPaid = settlementDoc.exists() ? settlementDoc.data().paid : false;
      transaction.set(settlementRef, { paid: !currentPaid }, { merge: true });
    });
  };

  const archiveVaquita = async () => {
    if (!user || !vaquitaId || friends.length === 0) return;

    const historyRef = collection(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "history");

    // Create a lookup map for better performance
    const friendsMap = Object.fromEntries(friends.map((f) => [f.id, f.name]));

    await addDoc(historyRef, {
      title: title || "Mi Vaquita",
      currency,
      total: totals.total,
      average: totals.average,
      friends: friends.map((f) => ({
        name: f.name,
        totalSpent: expenses
          .filter((e) => e.friendId === f.id)
          .reduce((sum, e) => sum + e.amount, 0),
      })),
      expenses: expenses.map((e) => ({
        friendId: e.friendId,
        friendName: friendsMap[e.friendId] || 'Unknown',
        amount: e.amount,
        createdAt: e.createdAt,
      })),
      transactions: totals.transactions,
      createdAt: Date.now(),
    });

    await resetAll();
  };

  const deleteHistoryItem = async (historyId) => {
    if (!user || !vaquitaId || !historyId) return;
    const historyDoc = doc(db, "artifacts", appId, "public", "data", "sessions", vaquitaId, "history", historyId);
    await deleteDoc(historyDoc);
  };

  // Calculations
  const totals = useMemo(() => {
    if (friends.length === 0) return { total: 0, average: 0, transactions: [], balances: [] };

    // Filtrar amigos que SÍ pagan (no están exentos)
    const payingFriends = friends.filter(f => !f.exempt);
    const payingFriendsCount = payingFriends.length;

    if (payingFriendsCount === 0) {
      return { 
        total: 0, 
        average: 0, 
        transactions: [], 
        balances: [],
        exemptCount: friends.length,
        payingFriendsCount: 0
      };
    }

    // Calcular cuánto pagó cada amigo y cuántas cuotas cubre
    const spentPerFriend = friends.map((f) => {
      // Gastos donde esta persona pagó directamente
      const directExpenses = expenses
        .filter((e) => e.friendId === f.id)
        .reduce((sum, e) => sum + e.amount, 0);

      // Contar cuántas cuotas cubre (incluyendo la suya si pagó)
      let quotasCovered = 0;
      
      // Solo contar cuotas si no está exento
      if (!f.exempt) {
        if (directExpenses > 0) {
          quotasCovered = 1; // Su propia cuota
          
          // Más las cuotas de otros que cubrió
          expenses
            .filter((e) => e.friendId === f.id && e.coversFor && e.coversFor.length > 0)
            .forEach((e) => {
              quotasCovered += e.coversFor.length;
            });
        } else {
          // Si no ha pagado nada, aún debe su propia cuota
          quotasCovered = 1;
        }
      }

      return { 
        ...f, 
        totalSpent: directExpenses,
        quotasCovered 
      };
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    // Dividir entre los que pagan (no exentos)
    const average = total / payingFriendsCount;

    // Calcular balances
    const balances = spentPerFriend.map((f) => {
      if (f.exempt) {
        // Los invitados no deben nada
        return {
          id: f.id,
          name: f.name,
          phone: f.phone,
          exempt: f.exempt,
          balance: 0,
          shouldPay: 0,
          paid: f.totalSpent,
        };
      }

      // Cuánto DEBERÍA pagar (cuotas que cubre × promedio)
      const shouldPay = f.quotasCovered * average;
      
      // Balance: lo que pagó - lo que debería pagar
      const balance = f.totalSpent - shouldPay;

      return {
        id: f.id,
        name: f.name,
        phone: f.phone,
        exempt: f.exempt,
        balance,
        shouldPay,
        paid: f.totalSpent,
      };
    });

    // Deudores y acreedores (solo los que pagan)
    const debtors = balances
      .filter((b) => !b.exempt && b.balance < -0.01)
      .map((b) => ({ ...b, balance: Math.abs(b.balance) }));
    
    const creditors = balances
      .filter((b) => !b.exempt && b.balance > 0.01);

    // Generar transacciones
    const transactions = [];
    const tempDebtors = [...debtors].sort((a, b) => b.balance - a.balance);
    const tempCreditors = [...creditors].sort((a, b) => b.balance - a.balance);

    let d = 0, c = 0;
    while (d < tempDebtors.length && c < tempCreditors.length) {
      const amount = Math.min(tempDebtors[d].balance, tempCreditors[c].balance);
      if (amount > 0.01) {
        const fromId = tempDebtors[d].id;
        const toId = tempCreditors[c].id;
        const settleId = `${fromId}_${toId}`;
        transactions.push({
          from: tempDebtors[d].name,
          fromId,
          fromPhone: tempDebtors[d].phone,
          to: tempCreditors[c].name,
          toId,
          toPhone: tempCreditors[c].phone,
          amount,
          paid: !!settlements[settleId],
        });
      }
      tempDebtors[d].balance -= amount;
      tempCreditors[c].balance -= amount;
      if (tempDebtors[d].balance < 0.01) d++;
      if (tempCreditors[c].balance < 0.01) c++;
    }

    return { 
      total, 
      average, 
      transactions, 
      balances,
      payingFriendsCount,
      exemptCount: friends.length - payingFriendsCount
    };
  }, [friends, expenses, settlements]);

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
    userVaquitas,
    currency,
    setCurrency: async (c) => {
      const previousCurrency = currency;
      try {
        // Optimistic local update
        setInternalCurrency(c);
        await updateVaquitaInfo({ currency: c });
      } catch (error) {
        // Roll back on error
        setInternalCurrency(previousCurrency);
        console.error("Failed to update currency:", error);
      }
    },
    title,
    updateVaquitaInfo,
    addFriend,
    updateFriend,
    removeFriend,
    addExpense,
    updateExpense,
    removeExpense,
    resetAll,
    archiveVaquita,
    deleteHistoryItem,
    history,
    toggleSettlementPaid,
    totals,
  };
};
