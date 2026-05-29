import { create } from 'zustand';
import { MOCK_RESERVATIONS } from '@/constants/mockReservations';
import { DEFAULT_MEMBERSHIP_GRADE } from '@/constants/mockUsers';
import type { MemberProfileDto } from '@/api/userApi';

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
  // Portal Navigation (page routing is now handled by React Router URL)
  activePortal: 'cust' | 'sell' | 'adm';
  
  // User Authentication
  isLoggedIn: boolean;
  username: string;
  memberId: number | null;
  mileage: number;
  membershipGrade: string;
  
  // Mock reservations for testing common cancellation views
  reservations: MyPageReservation[];
  
  // Toast notifications
  toastStack: ToastItem[];
  
  // Custom Global Popups
  isWelcomePopupOpen: boolean;
  isSellerPendingPopupOpen: boolean;
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
  login: (
    username: string,
    role?: 'cust' | 'sell' | 'adm',
    profile?: MemberProfileDto,
    memberId?: number | null
  ) => void;
  setMemberProfile: (profile: MemberProfileDto) => void;
  logout: () => void;
  
  // Common Toast Utilities
  addToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
  
  // Common Welcome Modal Actions
  openWelcomePopup: () => void;
  closeWelcomePopup: () => void;

  // Seller Pending Approval Popup
  openSellerPendingPopup: () => void;
  closeSellerPendingPopup: () => void;
  
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

  isLoggedIn: false,
  username: '',
  memberId: null,
  mileage: 0,
  membershipGrade: '',
  
  reservations: MOCK_RESERVATIONS,
  
  toastStack: [],
  isWelcomePopupOpen: false,
  isSellerPendingPopupOpen: false,
  isConfirmPopupOpen: false,
  confirmCallback: null,
  isAuthModalOpen: false,
  authModalTab: 'login',

  setActivePortal: (portal) => set({ activePortal: portal }),

  login: (username, role = 'cust', profile, memberId = null) => set(() => {
    const activePortal = role;
    if (memberId != null) {
      localStorage.setItem('onde_member_id', String(memberId));
    }
    return { 
      isLoggedIn: true, 
      username,
      memberId,
      mileage: profile?.mileage ?? 0,
      membershipGrade: profile?.membershipGrade ?? '',
      activePortal,
      isAuthModalOpen: false
    };
  }),

  setMemberProfile: (profile) => set({
    mileage: profile.mileage,
    membershipGrade: profile.membershipGrade,
  }),
  
  logout: () => {
    localStorage.removeItem('onde_member_id');
    set({
      isLoggedIn: false,
      username: '',
      memberId: null,
      mileage: 0,
      membershipGrade: '',
      activePortal: 'cust',
    });
  },
  
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

  openSellerPendingPopup: () => set({ isSellerPendingPopupOpen: true }),
  closeSellerPendingPopup: () => set({ isSellerPendingPopupOpen: false }),
  
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
    // 판매자는 관리자 승인이 필요하므로 로그인 처리하지 않고 팝업만 표시
    if (role === 'sell') {
      set({ isAuthModalOpen: false });
      setTimeout(() => set({ isSellerPendingPopupOpen: true }), 450);
      return;
    }

    // 일반 회원 / 관리자 → 즉시 로그인 처리
    set({
      isLoggedIn: true,
      username,
      mileage: 0,
      membershipGrade: DEFAULT_MEMBERSHIP_GRADE,
      activePortal: role,
      isAuthModalOpen: false,
    });

    const toastId = Math.random().toString();
    set((state) => ({
      toastStack: [...state.toastStack, { id: toastId, message: "👥 회원가입이 완료되었습니다!", type: 'success' }]
    }));
    setTimeout(() => useTravelStore.getState().removeToast(toastId), 4500);

    // 일반 고객에게만 웰컴 팝업 표시
    if (role === 'cust') {
      setTimeout(() => set({ isWelcomePopupOpen: true }), 450);
    }
  },
  
  addReservation: (res) => set((state) => ({
    reservations: [res, ...state.reservations]
  })),
  
  cancelReservation: (id) => set((state) => ({
    reservations: state.reservations.filter((r) => r.id !== id)
  }))
}));
