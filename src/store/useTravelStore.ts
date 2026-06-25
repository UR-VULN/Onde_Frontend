import { create } from 'zustand';
import type { MemberProfileDto } from '@/api/userApi';
import { clearAllAuthCookies } from '@/utils/authCookies';
import { setPostLogoutRedirect } from '@/utils/authSession';

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
  isLoggedIn: boolean;
  username: string;
  name: string;
  nickname: string;
  memberId: number | null;
  memberRole: string | null;
  mileage: number;
  walletBalance: number;
  membershipGrade: string;

  reservations: MyPageReservation[];
  toastStack: ToastItem[];

  isWelcomePopupOpen: boolean;
  isSellerPendingPopupOpen: boolean;
  isConfirmPopupOpen: boolean;
  confirmCallback: ((choice: boolean) => void) | null;
  confirmTitle?: string;
  confirmDescription?: string;
  confirmYesLabel?: string;
  confirmNoLabel?: string;

  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';

  login: (
    username: string,
    apiRole: string,
    profile?: MemberProfileDto,
    memberId?: number | null,
    name?: string,
    nickname?: string
  ) => void;
  setMemberProfile: (profile: MemberProfileDto, walletBalance?: number) => void;
  logout: (options?: { redirectTo?: string }) => void;

  addToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;

  openWelcomePopup: () => void;
  closeWelcomePopup: () => void;
  openSellerPendingPopup: () => void;
  closeSellerPendingPopup: () => void;

  openConfirmPopup: (
    callback: (choice: boolean) => void,
    options?: { title?: string; description?: string; yesLabel?: string; noLabel?: string }
  ) => void;
  closeConfirmPopup: (choice: boolean) => void;

  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'signup') => void;

  signupSuccess: (username: string, role: 'cust' | 'sell' | 'adm') => void;
  addReservation: (res: MyPageReservation) => void;
  setReservations: (list: MyPageReservation[]) => void;
  cancelReservation: (id: string) => void;
}

export const useTravelStore = create<TravelState>((set) => ({
  isLoggedIn: false,
  username: '',
  name: '',
  nickname: '',
  memberId: null,
  memberRole: null,
  mileage: 0,
  walletBalance: 0,
  membershipGrade: '',

  reservations: [],
  toastStack: [],
  isWelcomePopupOpen: false,
  isSellerPendingPopupOpen: false,
  isConfirmPopupOpen: false,
  confirmCallback: null,
  isAuthModalOpen: false,
  authModalTab: 'login',

  login: (username, apiRole, profile, memberId = null, name = '', nickname = '') =>
    set({
      isLoggedIn: true,
      username,
      name,
      nickname,
      memberId,
      memberRole: apiRole,
      mileage: profile?.mileage ?? 0,
      membershipGrade: profile?.membershipGrade ?? '',
      isAuthModalOpen: false,
    }),

  setMemberProfile: (profile, walletBalance) =>
    set({
      mileage: profile.mileage,
      walletBalance: walletBalance ?? profile.walletBalance ?? 0,
      membershipGrade: profile.membershipGrade,
    }),

  logout: async (options) => {
    const redirectTo = options?.redirectTo;
    if (redirectTo) {
      setPostLogoutRedirect(redirectTo);
    }
    
    try {
      const { logout_api } = await import('@/api/authApi');
      await logout_api();
    } catch (err) {
      console.warn('Server logout failed:', err);
    }

    clearAllAuthCookies();
    set({
      isLoggedIn: false,
      username: '',
      memberId: null,
      memberRole: null,
      mileage: 0,
      walletBalance: 0,
      membershipGrade: '',
      reservations: [],
    });
    if (redirectTo) {
      window.location.replace(redirectTo);
    }
  },


  addToast: (message, type = 'success') =>
    set((state) => {
      const id = Math.random().toString();
      setTimeout(() => {
        useTravelStore.getState().removeToast(id);
      }, 1500);
      return { toastStack: [...state.toastStack, { id, message, type }] };
    }),

  removeToast: (id) =>
    set((state) => ({
      toastStack: state.toastStack.filter((t) => t.id !== id),
    })),

  openWelcomePopup: () => set({ isWelcomePopupOpen: true }),
  closeWelcomePopup: () => set({ isWelcomePopupOpen: false }),
  openSellerPendingPopup: () => set({ isSellerPendingPopupOpen: true }),
  closeSellerPendingPopup: () => set({ isSellerPendingPopupOpen: false }),

  openConfirmPopup: (callback, options) =>
    set({
      isConfirmPopupOpen: true,
      confirmCallback: callback,
      confirmTitle: options?.title,
      confirmDescription: options?.description,
      confirmYesLabel: options?.yesLabel,
      confirmNoLabel: options?.noLabel,
    }),

  closeConfirmPopup: (choice) =>
    set((state) => {
      if (state.confirmCallback) {
        state.confirmCallback(choice);
      }
      return {
        isConfirmPopupOpen: false,
        confirmCallback: null,
        confirmTitle: undefined,
        confirmDescription: undefined,
        confirmYesLabel: undefined,
        confirmNoLabel: undefined,
      };
    }),

  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),

  /** 판매자 가입 완료 — 승인 대기 안내만 (로그인 상태는 설정하지 않음) */
  signupSuccess: (_username, role) => {
    if (role !== 'sell') return;

    set({ isAuthModalOpen: false });
    setTimeout(() => set({ isSellerPendingPopupOpen: true }), 450);
  },

  addReservation: (res) =>
    set((state) => ({
      reservations: [res, ...state.reservations],
    })),

  setReservations: (list) => set({ reservations: list }),

  cancelReservation: (id) =>
    set((state) => ({
      reservations: state.reservations.filter((r) => r.id !== id),
    })),
}));
