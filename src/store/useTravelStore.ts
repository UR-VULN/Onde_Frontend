import { create } from 'zustand';
import { MOCK_RESERVATIONS } from '@/constants/mockReservations';

export interface MyPageReservation {
  id: string;
  category: 'stay' | 'flight' | 'car' | 'ins';
  title: string;
  badge: string;
  badgeType: string;
  date: string;
  details: string;
  price: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

interface TravelState {
  // Portal & Page Navigation
  activePortal: 'cust' | 'sell' | 'adm';
  activePage: 'home' | 'flight' | 'car' | 'ins' | 'map' | 'feed' | 'mypage';
  
  // User Authentication
  isLoggedIn: boolean;
  username: string;
  mileage: number;
  
  // Mock reservations for testing common cancellation views
  reservations: MyPageReservation[];
  
  // Toast notifications
  toastStack: ToastItem[];
  
  // Custom Global Popups
  isWelcomePopupOpen: boolean;
  isConfirmPopupOpen: boolean;
  confirmCallback: ((choice: boolean) => void) | null;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmYesLabel?: string;
  confirmNoLabel?: string;
  
  // Global Auth Modal (Login/Signup tabbed modal)
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';

  // Actions
  setActivePortal: (portal: 'cust' | 'sell' | 'adm') => void;
  setActivePage: (page: 'home' | 'flight' | 'car' | 'ins' | 'map' | 'feed' | 'mypage') => void;
  login: (username: string, role?: 'cust' | 'sell' | 'adm') => void;
  logout: () => void;
  
  // Common Toast Utilities
  addToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  
  // Common Welcome Modal Actions
  openWelcomePopup: () => void;
  closeWelcomePopup: () => void;
  
  // Common Confirm Dialog Utility
  openConfirmPopup: (
    callback: (choice: boolean) => void, 
    options?: { title?: string; description?: string; yesLabel?: string; noLabel?: string }
  ) => void;
  closeConfirmPopup: (choice: boolean) => void;
  
  // Common Auth Modal Actions
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'signup') => void;
  
  // Atomic Business Actions
  signupSuccess: (username: string, role: 'cust' | 'sell' | 'adm') => void;
  
  // Reservation modifiers
  addReservation: (res: MyPageReservation) => void;
  cancelReservation: (id: string) => void;
}

export const useTravelStore = create<TravelState>((set) => ({
  activePortal: 'cust',
  activePage: 'home',
  
  isLoggedIn: false,
  username: '',
  mileage: 35000,
  
  reservations: MOCK_RESERVATIONS,
  
  toastStack: [],
  isWelcomePopupOpen: false,
  isConfirmPopupOpen: false,
  confirmCallback: null,
  isAuthModalOpen: false,
  authModalTab: 'login',

  setActivePortal: (portal) => set({ activePortal: portal }),
  setActivePage: (page) => set({ activePage: page }),
  
  login: (username, role = 'cust') => set(() => {
    const activePortal = role;
    const activePage = 'home'; // Default to home (stay) as main page
    return { 
      isLoggedIn: true, 
      username, 
      mileage: 35050,
      activePortal,
      activePage,
      isAuthModalOpen: false
    };
  }),
  
  logout: () => set({ 
    isLoggedIn: false, 
    username: '', 
    activePage: 'home',
    activePortal: 'cust'
  }),
  
  addToast: (message, type = 'success') => set((state) => {
    const id = Math.random().toString();
    setTimeout(() => {
      useTravelStore.getState().removeToast(id);
    }, 4500);
    return { toastStack: [...state.toastStack, { id, message, type }] };
  }),
  
  removeToast: (id) => set((state) => ({
    toastStack: state.toastStack.filter((t) => t.id !== id)
  })),
  
  openWelcomePopup: () => set({ isWelcomePopupOpen: true }),
  closeWelcomePopup: () => set({ isWelcomePopupOpen: false }),
  
  openConfirmPopup: (callback, options) => set({ 
    isConfirmPopupOpen: true, 
    confirmCallback: callback,
    confirmTitle: options?.title,
    confirmDescription: options?.description,
    confirmYesLabel: options?.yesLabel,
    confirmNoLabel: options?.noLabel
  }),
  closeConfirmPopup: (choice) => set((state) => {
    if (state.confirmCallback) {
      state.confirmCallback(choice);
    }
    return { 
      isConfirmPopupOpen: false, 
      confirmCallback: null,
      confirmTitle: undefined,
      confirmDescription: undefined,
      confirmYesLabel: undefined,
      confirmNoLabel: undefined
    };
  }),

  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
  
  signupSuccess: (username, role) => {
    // 1. Perform Login
    const activePortal = role;
    const activePage = 'home'; // Default focus on stay/home
    set({ 
      isLoggedIn: true, 
      username, 
      mileage: 35050,
      activePortal,
      activePage,
      isAuthModalOpen: false 
    });

    // 2. Add Toast Notification
    const toastId = Math.random().toString();
    set((state) => ({
      toastStack: [...state.toastStack, { id: toastId, message: "👥 회원가입이 완료되었습니다!", type: 'success' }]
    }));
    setTimeout(() => useTravelStore.getState().removeToast(toastId), 4500);

    // 3. Trigger Welcome Popup with delay for smoother transition
    setTimeout(() => {
      set({ isWelcomePopupOpen: true });
    }, 450);
  },
  
  addReservation: (res) => set((state) => ({
    reservations: [res, ...state.reservations]
  })),
  
  cancelReservation: (id) => set((state) => ({
    reservations: state.reservations.filter((r) => r.id !== id)
  }))
}));
