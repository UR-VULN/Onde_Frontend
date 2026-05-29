import { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { MOCK_USERS } from '@/constants/mockUsers';

export const useAuthForm = () => {
  const { login, signupSuccess, closeAuthModal, addToast } = useTravelStore();
  const [isLoading, setIsLoading] = useState(false);

  // Email Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email: string) => {
    if (!email) {
      addToast("이메일을 입력해주세요.", "warning");
      return false;
    }
    if (!emailRegex.test(email)) {
      addToast("올바른 이메일 형식이 아닙니다.", "warning");
      return false;
    }
    return true;
  };

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      addToast("이메일과 비밀번호를 모두 입력해주세요.", "warning");
      return;
    }

    if (!validateEmail(email)) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const matchedUser = MOCK_USERS.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      // 판매자 중 미승인(pending) 계정은 로그인 차단
      if (matchedUser.role === 'sell' && matchedUser.status === 'pending') {
        addToast("⏳ 관리자가 계정을 승인하기 전까지 로그인할 수 없습니다. 잠시만 기다려 주세요.", "warning");
        setIsLoading(false);
        return;
      }
      login(matchedUser.email, matchedUser.role, {
        mileage: matchedUser.mileage,
        membershipGrade: matchedUser.membershipGrade,
      });
      addToast("🔑 로그인이 완료되었습니다!", "success");
      closeAuthModal();
    } else {
      addToast("이메일 또는 비밀번호가 올바르지 않습니다.", "warning");
      setIsLoading(false);
    }
  };

  const handleSignup = async (payload: any) => {
    const { email, password, passwordConfirm, role, isEmailChecked } = payload;

    if (!email || !password || !passwordConfirm) {
      addToast("모든 항목을 입력해주세요.", "warning");
      return;
    }

    if (!validateEmail(email)) return;

    if (!isEmailChecked) {
      addToast("이메일 중복 확인을 먼저 해주세요.", "warning");
      return;
    }

    if (password.length < 8) {
      addToast("비밀번호는 8자 이상이어야 합니다.", "warning");
      return;
    }

    if (password.length > 20) {
      addToast("비밀번호는 최대 20자까지 가능합니다.", "warning");
      return;
    }

    if (password !== passwordConfirm) {
      addToast("비밀번호가 다릅니다! 다시 확인해주세요.", "warning");
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    signupSuccess(email, role);
  };

  const handleSocialLogin = (_platform: 'Kakao' | 'Google') => {
    // 현재는 클릭 시 디자인만 확인 가능하도록 비워둔 상태입니다.
  };

  return {
    isLoading,
    handleLogin,
    handleSignup,
    handleSocialLogin,
    validateEmail
  };
};
