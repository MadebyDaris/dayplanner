import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const signUp = async (email, password, displayName) => {
        try {
        setError('');
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update the user's display name
        if (displayName && result.user) {
            await updateProfile(result.user, {
            displayName: displayName
            });
        }

        return result;
        } catch (error) {
        setError(error.message);
        throw error;
        }
    };
    const signIn = async (email, password) => {
        try {
            setError('');
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setError(error.message);
            throw error;
        }
    }
    const signInWithGoogle = async () => {
        try {
        setError('');
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
        } catch (error) {
        setError(error.message);
        throw error;
        }
    };
    const logout = async () => {
        try {
        setError('');
        return await signOut(auth);
        } catch (error) {
        setError(error.message);
        throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
        setError('');
        return await sendPasswordResetEmail(auth, email);
        } catch (error) {
        setError(error.message);
        throw error;
        }
    };

    // Listen for authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
        });

    return unsubscribe;
  }, []);

  const value = {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    loading,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};