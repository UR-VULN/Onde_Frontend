import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login_api, signup_api, admin_login_api } from '@/api/authApi';
import { fetch_member_profile_api, fetch_member_me_api } from '@/api/userApi';
import { USER_API_BASE } from '@/constants/apiConfig';
import { DEFAULT_MEMBERSHIP_GRADE } from '@/constants/appConstants';
import { useTravelStore } from '@/store/useTravelStore';
import { persistAuthSession } from '@/utils/authCookies';
import { getDefaultPathForRole } from '@/utils/memberRole';

export const useAuthForm = () => {
  const navigate = useNavigate();
  const { login, signupSuccess, closeAuthModal, openAuthModal, addToast } = useTravelStore();
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email: string) => {
    if (!email) {
      addToast('이메일을 입력해주세요.', 'warning');
      return false;
    }
    if (!emailRegex.test(email)) {
      addToast('올바른 이메일 형식이 아닙니다.', 'warning');
      return false;
    }
    return true;
  };

  const finishLogin = (
    email: string,
    apiRole: string,
    memberId: number,
    profile: { mileage: number; membershipGrade: string },
    name: string,
    nickname: string,
    options?: { successToast?: string; showWelcomePopup?: boolean }
  ) => {
    login(email, apiRole, profile, memberId, name, nickname);
    addToast(options?.successToast ?? '🔑 로그인이 완료되었습니다!', 'success');
    closeAuthModal();
    navigate(getDefaultPathForRole(apiRole), { replace: true });

    if (options?.showWelcomePopup) {
      setTimeout(() => useTravelStore.getState().openWelcomePopup(), 450);
    }
  };

  const establishSession = async (
    email: string,
    password: string,
    options?: { successToast?: string; showWelcomePopup?: boolean }
  ): Promise<boolean> => {
    const data = await login_api({ email, password });
    if (!data?.memberId) {
      return false;
    }

    persistAuthSession({
      accessToken: data.accessToken || '',
      refreshToken: data.refreshToken || '',
      memberId: data.memberId,
      role: data.role,
      username: email,
      expiresIn: data.expiresIn,
    });

    let realName = '';
    let realNickname = '';
    try {
      const meRes = await fetch_member_me_api();
      if (meRes.success && meRes.data) {
        realName = meRes.data.name || '';
        realNickname = meRes.data.nickname || '';
      }
    } catch {
      // ignore
    }

    persistAuthSession({
      accessToken: data.accessToken || '',
      refreshToken: data.refreshToken || '',
      memberId: data.memberId,
      role: data.role,
      username: email,
      name: realName,
      nickname: realNickname,
      expiresIn: data.expiresIn,
    });

    let profile = { mileage: 0, membershipGrade: DEFAULT_MEMBERSHIP_GRADE };
    try {
      const profileRes = await fetch_member_profile_api();
      if (profileRes.success && profileRes.data) {
        profile = profileRes.data;
      }
    } catch {
      // 마일리지 API 실패 시 기본값 유지
    }

    finishLogin(email, data.role, data.memberId, profile, realName, realNickname, options);
    return true;
  };

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      addToast('이메일과 비밀번호를 모두 입력해주세요.', 'warning');
      return;
    }

    if (!validateEmail(email)) return;

    setIsLoading(true);

    try {
      const ok = await establishSession(email, password);
      if (!ok) {
        addToast('로그인에 실패했습니다.', 'warning');
      }
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { error?: { message?: string } })?.error?.message ||
        '이메일 또는 비밀번호가 올바르지 않습니다.';
      addToast(msg, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const establishAdminSession = async (
    email: string,
    password: string,
    options?: { successToast?: string }
  ): Promise<boolean> => {
    const data = await admin_login_api({ email, password });
    if (!data?.memberId) {
      return false;
    }

    persistAuthSession({
      accessToken: data.accessToken || '',
      refreshToken: data.refreshToken || '',
      memberId: data.memberId,
      role: data.role,
      username: email,
      name: '관리자',
      nickname: 'Admin',
      expiresIn: data.expiresIn,
    });

    const profile = { mileage: 0, membershipGrade: 'ADMIN' };

    finishLogin(email, data.role, data.memberId, profile, '관리자', 'Admin', options);
    return true;
  };

  const handleAdminLogin = async (email: string, password: string) => {
    if (!email || !password) {
      addToast('이메일과 비밀번호를 모두 입력해주세요.', 'warning');
      return;
    }

    if (!validateEmail(email)) return;

    setIsLoading(true);

    try {
      const ok = await establishAdminSession(email, password);
      if (!ok) {
        addToast('로그인에 실패했습니다.', 'warning');
      }
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { error?: { message?: string } })?.error?.message ||
        '이메일 또는 비밀번호가 올바르지 않습니다.';
      addToast(msg, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (payload: {
    email: string;
    password: string;
    passwordConfirm: string;
    role: 'cust' | 'sell' | 'adm';
    name?: string;
    phoneNumber?: string;
    nickname?: string;
    age?: number;
  }) => {
    const { email, password, passwordConfirm, role, name, phoneNumber, nickname, age } = payload;

    if (!email || !password || !passwordConfirm) {
      addToast('모든 항목을 입력해주세요.', 'warning');
      return;
    }


    if (!validateEmail(email)) return;

    if (password.length < 8) {
      addToast('비밀번호는 8자 이상이어야 합니다.', 'warning');
      return;
    }

    if (password.length > 20) {
      addToast('비밀번호는 최대 20자까지 가능합니다.', 'warning');
      return;
    }

    if (password !== passwordConfirm) {
      addToast('비밀번호가 다릅니다! 다시 확인해주세요.', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const apiRole = role === 'sell' ? 'SELLER' : 'USER';
      const message = await signup_api({
        email,
        password,
        passwordConfirm,
        role: apiRole,
        name,
        phoneNumber,
        nickname,
        age,
      });


      if (role === 'sell') {
        signupSuccess(email, role);
        addToast(message || '회원가입이 완료되었습니다.', 'success');
        return;
      }

      try {
        const loggedIn = await establishSession(email, password, {
          successToast: message || '회원가입 및 로그인이 완료되었습니다.',
          showWelcomePopup: role === 'cust',
        });
        if (!loggedIn) {
          addToast('가입은 완료되었습니다. 로그인해 주세요.', 'warning');
          openAuthModal('login');
        }
      } catch {
        addToast('가입은 완료되었습니다. 로그인해 주세요.', 'warning');
        openAuthModal('login');
      }
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        (err as { error?: { message?: string } })?.error?.message ||
        '회원가입에 실패했습니다.';
      addToast(msg, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform: 'Kakao' | 'Google') => {
    const provider = platform === 'Kakao' ? 'kakao' : 'google';
    window.location.href = `${USER_API_BASE}/oauth2/authorization/${provider}`;
  };

  return {
    isLoading,
    handleLogin,
    handleAdminLogin,
    handleSignup,
    handleSocialLogin,
    validateEmail,
  };
};
