import { create } from 'zustand';

export const useFinStore = create((set) => ({
  // 1. Estados Globais
  data: null,
  transactions: [],
  accounts: [],
  categories: [],
  cards: [],
  following: [],
  budgets: [],
  goals: [],
  user: null,
  selectedProfile: null,
  userPlan: null, // Guardará 'basic', 'premium' ou 'none'
  loading: true,
  dashboardMode: localStorage.getItem("dashboardMode") || "finance",

  // 2. Ações Inteligentes (Agora aceitam callbacks 'prev' igual ao useState!)
  setData: (updater) => set((state) => ({ 
    data: typeof updater === 'function' ? updater(state.data) : updater 
  })),
  
  setTransactions: (updater) => set((state) => ({ 
    transactions: typeof updater === 'function' ? updater(state.transactions) : updater 
  })),
  
  setAccounts: (updater) => set((state) => ({ 
    accounts: typeof updater === 'function' ? updater(state.accounts) : updater 
  })),
  
  setCategories: (updater) => set((state) => ({ 
    categories: typeof updater === 'function' ? updater(state.categories) : updater 
  })),
  
  setCards: (updater) => set((state) => ({ 
    cards: typeof updater === 'function' ? updater(state.cards) : updater 
  })),
  
  setFollowing: (updater) => set((state) => ({ 
    following: typeof updater === 'function' ? updater(state.following) : updater 
  })),

  setBudgets: (updater) => set((state) => ({ 
    budgets: typeof updater === 'function' ? updater(state.budgets) : updater 
  })),

  setGoals: (updater) => set((state) => ({ 
    goals: typeof updater === 'function' ? updater(state.goals) : updater 
  })),
  
  setUser: (updater) => set((state) => ({ 
    user: typeof updater === 'function' ? updater(state.user) : updater 
  })),


  setUserPlan: (updater) => set((state) => ({ 
    userPlan: typeof updater === 'function' ? updater(state.userPlan) : updater 
  })),
  
  setSelectedProfile: (updater) => set((state) => ({ 
    selectedProfile: typeof updater === 'function' ? updater(state.selectedProfile) : updater 
  })),
  
  setLoading: (updater) => set((state) => ({ 
    loading: typeof updater === 'function' ? updater(state.loading) : updater 
  })),

  setDashboardMode: (mode) => {
    localStorage.setItem("dashboardMode", mode);
    set({ dashboardMode: mode });
  },

  // 3. Ações Otimistas (Opcionais)
  addTransactionOptimistic: (newTx) => 
    set((state) => ({ transactions: [newTx, ...state.transactions] })),
    
  updateTransactionOptimistic: (updatedTx) =>
    set((state) => ({
      transactions: state.transactions.map((t) => 
        t.id === updatedTx.id ? { ...t, ...updatedTx } : t
      )
    })),
}));