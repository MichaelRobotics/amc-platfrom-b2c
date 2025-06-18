import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, PhoneAuthProvider } from 'firebase/auth';
import { auth } from '@amc-platfrom/firebase-helpers'; // Assuming firebase-helpers exports initialized auth

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // New state for MFA flow
  const [mfaResolver, setMfaResolver] = useState(null);
  const [mfaHint, setMfaHint] = useState(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult(true);
          setUser(user);
          setClaims(idTokenResult.claims);
        } catch (error) {
          console.error("Error fetching user claims:", error);
          await signOut(auth); // Sign out on token error
          setUser(null);
          setClaims(null);
        }
      } else {
        setUser(null);
        setClaims(null);
      }
      setLoading(false);
      setMfaRequired(false); // Reset MFA state on auth change
      setMfaResolver(null);
      setMfaHint(null);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    // Reset previous MFA state before new login attempt
    setMfaRequired(false);
    setMfaResolver(null);
    setMfaHint(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting user and claims
      return { success: true };
    } catch (error) {
      if (error.code === 'auth/multi-factor-required') {
        setMfaRequired(true);
        setMfaResolver(error.resolver);
        setMfaHint(error.resolver.hints[0].phoneNumber);
        return { success: false, mfa: true, error: null };
      }
      console.error("Login error:", error.message);
      return { success: false, mfa: false, error: error.message };
    }
  }, []);

  const resolveMfa = useCallback(async (mfaCode) => {
    if (!mfaResolver) {
      return { success: false, error: "MFA resolver not available." };
    }
    try {
      const phoneAuthCredential = PhoneAuthProvider.credential(mfaResolver.session, mfaCode);
      await mfaResolver.resolveSignIn(phoneAuthCredential);
      // onAuthStateChanged will now fire with the logged-in user
      return { success: true };
    } catch (error) {
      console.error("MFA resolution error:", error);
      return { success: false, error: "Nieprawidłowy kod weryfikacyjny." };
    }
  }, [mfaResolver]);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = {
    user,
    claims,
    loading,
    login,
    logout,
    mfaRequired,
    mfaHint,
    resolveMfa,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};