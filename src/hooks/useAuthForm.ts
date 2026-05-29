import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login_api, signup_api } from '@/api/authApi';
import { fetch_member_profile_api } from '@/api/userApi';
import { DEFAULT_MEMBERSHIP_GRADE } from '@/constants/appConstants';
import { useTravelStore } from '@/store/useTravelStore';
import { persistAuthSession } from '@/utils/authCookies';
import { getDefaultPathForRole } from '@/utils/memberRole';

export const useAuthForm = () => {
  const navigate = useNavigate();
  const { login, signupSuccess, closeAuthModal, addToast } = useTravelStore();
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
    profile: { mileage: number; membershipGrade: string }
  ) => {
    login(email, apiRole, profile, memberId);
    addToast('🔑 로그인이 완료되었습니다!', 'success');
    closeAuthModal();
    navigate(getDefaultPathForRole(apiRole), { replace: true });
  };

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      addToast('이메일과 비밀번호를 모두 입력해주세요.', 'warning');
      return;
    }

    if (!validateEmail(email)) return;

    setIsLoading(true);

    try {
      const res = await login_api({ email, password });
      if (!res.success || !res.data) {
        addToast(res.message || '로그인에 실패했습니다.', 'warning');
        return;
      }

      persistAuthSession({
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
        memberId: res.data.memberId,
        role: res.data.role,
        username: email,
        expiresIn: res.data.expiresIn,
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

      finishLogin(email, res.data.role, res.data.memberId, profile);
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
    isEmailChecked: boolean;
    name?: string;
  }) => {
    const { email, password, passwordConfirm, role, isEmailChecked, name } = payload;

    if (!email || !password || !passwordConfirm) {
      addToast('모든 항목을 입력해주세요.', 'warning');
      return;
    }

    if (!validateEmail(email)) return;

    if (!isEmailChecked) {
      addToast('이메일 중복 확인을 먼저 해주세요.', 'warning');
      return;
    }

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
      await signup_api({
        email,
        password,
        name: name || email.split('@')[0],
        role: apiRole,
      });
      signupSuccess(email, role);
      addToast('회원가입이 완료되었습니다.', 'success');
      if (role === 'cust') {
        navigate('/', { replace: true });
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

  const handleSocialLogin = (_platform: 'Kakao' | 'Google') => {
    // 소셜 로그인은 추후 OAuth 연동
  };

  return {
    isLoading,
    handleLogin,
    handleSignup,
    handleSocialLogin,
    validateEmail,
  };
};
