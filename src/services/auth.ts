import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";

export interface AuthService {
  signUp: (email: string, password: string, name?: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => Promise<void>;
  onAuthChange: (callback: (user: User | null) => void) => () => void;
  getCurrentUser: () => User | null;
}

export const authService: AuthService = {
  signUp: async (email: string, password: string, name?: string) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    if (name && userCredential.user) {
      await updateProfile(userCredential.user, { displayName: name });
    }
    return userCredential.user;
  },

  signIn: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  },

  signInWithGoogle: async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  },

  signOut: async () => {
    await signOut(auth);
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },
};

