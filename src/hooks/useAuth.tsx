import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface UserProfile {
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'ACTIVE' | 'INACTIVE';
}

interface AuthContextType {
  user: User | null;
  role: 'ADMIN' | 'EMPLOYEE' | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAIN_ADMIN = 'alex.b19h@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === MAIN_ADMIN) {
          setRole('ADMIN');
        } else {
          try {
            // Check users collection
            const q = query(collection(db, 'users'), where('email', '==', u.email?.toLowerCase()));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const userData = querySnapshot.docs[0].data() as UserProfile;
              if (userData.status === 'INACTIVE') {
                await signOut(auth);
                throw new Error('Usuario desactivado');
              }
              setRole(userData.role);
            } else {
              // If not found, default to employee or kick out?
              // For safety, let's say employee
              setRole('EMPLOYEE');
            }
          } catch (e) {
            console.error(e);
            setRole('EMPLOYEE');
          }
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
