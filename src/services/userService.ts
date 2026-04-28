import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE';
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: any;
}

export const UserService = {
  async getAll(): Promise<UserProfile[]> {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
  },

  async create(user: Omit<UserProfile, 'id' | 'createdAt'>) {
    return await addDoc(collection(db, 'users'), {
      ...user,
      createdAt: serverTimestamp()
    });
  },

  async update(id: string, user: Partial<UserProfile>) {
    const docRef = doc(db, 'users', id);
    await updateDoc(docRef, user);
  },

  async delete(id: string) {
    const docRef = doc(db, 'users', id);
    await deleteDoc(docRef);
  }
};
