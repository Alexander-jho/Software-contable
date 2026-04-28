import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface CompanySettings {
  name: string;
  nit: string;
  tel: string;
  manager: string;
  address: string;
  slogan: string;
  logoUrl: string;
}

const SETTINGS_ID = 'main_config';

export const SettingsService = {
  async get(): Promise<CompanySettings> {
    const docRef = doc(db, 'settings', SETTINGS_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as CompanySettings;
    }
    
    // Default fallback
    return {
      name: "DISTRIBUIDORA QUE POLLO",
      nit: "PENDIENTE",
      tel: "317 331 5203",
      manager: "JORGE LUIS",
      address: "Consulte con administración",
      slogan: "Pollo Semicriollo - Calidad Superior",
      logoUrl: ""
    };
  },

  async update(settings: CompanySettings) {
    const docRef = doc(db, 'settings', SETTINGS_ID);
    await setDoc(docRef, settings);
  }
};
