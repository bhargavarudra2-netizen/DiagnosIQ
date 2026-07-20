import { create } from 'zustand';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUserSession: (user: User | null, session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUserSession: (user, session) => set({ user, session, loading: false }),
  setLoading: (loading) => set({ loading }),
  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, loading: false });
  },
}));
