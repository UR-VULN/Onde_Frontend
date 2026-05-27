import { create } from 'zustand';

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
  
  // Reservation modifiers
  addReservation: (res: MyPageReservation) => void;
  cancelReservation: (id: string) => void;
}

export const useTravelStore = create<TravelState>((set) => ({
  activePortal: 'cust',
  activePage: 'flight',
  
  isLoggedIn: false,
  username: '',
  mileage: 35000,
  
  reservations: [
    {
      id: 'res-1',
      category: 'stay',
      title: '🏡 도쿄 신주쿠 펜트하우스 스위트',
      badge: '이용 예정',
      badgeType: 'confirmed',
      date: '2026. 10. 24 ~ 10. 27 (3박 4일)',
      details: '정원: 게스트 2명 | 결제: ₩700,000 (마일리지 35,000 P 차감 적용 완료)',
      price: '₩700,000'
    },
    {
      id: 'res-2',
      category: 'flight',
      title: '✈️ 대한항공 KE-023 편',
      badge: '발권 완료',
      badgeType: 'issued',
      date: '10월 24일 14:30 출발',
      details: '구간: 인천(ICN) ➔ 도쿄 나리타(NRT) | 비즈니스 클래스 12A 좌석',
      price: '₩450,000'
    },
    {
      id: 'res-3',
      category: 'car',
      title: '🚗 제네시스 G90 럭셔리 세단',
      badge: '예약 확정',
      badgeType: 'reserved',
      date: '2026. 10. 24 ~ 10. 29 (5일 대여)',
      details: '인수: 도쿄 나리타 공항 ONDE Drive 전용 지점 (완전 자차 포함)',
      price: '₩750,000'
    },
    {
      id: 'res-4',
      category: 'ins',
      title: '🛡️ ONDE Protect 안심 여행자 보험',
      badge: '가입 완료',
      badgeType: 'active',
      date: '2026. 07. 01 ~ 07. 10 (10일 보장)',
      details: '플랜: DELUXE 보장 플랜 (해외 의료비/휴대품 분실 보장 한도 증액)',
      price: '₩22,500'
    }
  ],
  
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
    const activePage = role === 'cust' ? 'flight' : 'flight'; // Default to flight for B-team focus
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
    activePage: 'flight',
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
  
  addReservation: (res) => set((state) => ({
    reservations: [res, ...state.reservations]
  })),
  
  cancelReservation: (id) => set((state) => ({
    reservations: state.reservations.filter((r) => r.id !== id)
  }))
}));
