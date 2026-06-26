import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login_api, signup_api, admin_login_api } from '@/api/authApi';
import { fetch_member_identity_api, fetch_member_profile_api, fetch_member_me_api } from '@/api/userApi';
import { USER_API_BASE } from '@/constants/apiConfig';
import { DEFAULT_MEMBERSHIP_GRADE } from '@/constants/appConstants';
import { useTravelStore } from '@/store/useTravelStore';
import { getDefaultPathForRole } from '@/utils/memberRole';
import { extractApiErrorMessage } from '@/utils/apiResponse';
import { validatePassword } from '@/utils/passwordPolicy';

const LOGIN_CREDENTIALS_INVALID_MESSAGE = '이메일 또는 비밀번호가 올바르지 않습니다.';

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

  const validateLoginCredentials = (email: string, password: string) => {
    if (!email || !password) {
      addToast(LOGIN_CREDENTIALS_INVALID_MESSAGE, 'warning');
      return false;
    }
    if (!emailRegex.test(email)) {
      addToast(LOGIN_CREDENTIALS_INVALID_MESSAGE, 'warning');
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
    options?: { successToast?: string; showWelcomePopup?: boolean; passwordChangeRequired?: boolean }
  ) => {
    closeAuthModal();
    const targetPath = getDefaultPathForRole(apiRole);
    navigate(targetPath, { replace: true });

    window.setTimeout(() => {
      login(email, apiRole, profile, memberId, name, nickname);
      if (options?.passwordChangeRequired) {
        addToast('비밀번호 사용 기간이 만료되었습니다. 프로필에서 비밀번호를 변경해 주세요.', 'warning');
      } else {
        addToast(options?.successToast ?? '🔑 로그인이 완료되었습니다!', 'success');
      }

      if (options?.showWelcomePopup) {
        setTimeout(() => useTravelStore.getState().openWelcomePopup(), 450);
      }
    }, 0);
  };

  const establishSession = async (
    email: string,
    password: string,
    options?: { successToast?: string; showWelcomePopup?: boolean }
  ): Promise<boolean> => {
    const data = await login_api({ email, password });
    if (!data?.role) {
      return false;
    }

    const sessionOptions = { skipErrorRedirect: true as const };

    let memberId = 0;
    try {
      const identityRes = await fetch_member_identity_api();
      if (identityRes.success && identityRes.data?.memberId) {
        memberId = identityRes.data.memberId;
      }
    } catch {
      return false;
    }
    if (!memberId) {
      return false;
    }

    let realName = '';
    let realNickname = '';
    try {
      const meRes = await fetch_member_me_api(sessionOptions);
      if (meRes.success && meRes.data) {
        realName = meRes.data.name || '';
        realNickname = meRes.data.nickname || '';
      }
    } catch {
      // ignore
    }

    let profile = { mileage: 0, membershipGrade: DEFAULT_MEMBERSHIP_GRADE };
    try {
      const profileRes = await fetch_member_profile_api(sessionOptions);
      if (profileRes.success && profileRes.data) {
        profile = profileRes.data;
      }
    } catch {
      // 마일리지 API 실패 시 기본값 유지
    }

    finishLogin(email, data.role, memberId, profile, realName, realNickname, {
      ...options,
      passwordChangeRequired: data.passwordChangeRequired,
    });
    return true;
  };

  const handleLogin = async (email: string, password: string) => {
    if (!validateLoginCredentials(email, password)) return;

    setIsLoading(true);

    try {
      const ok = await establishSession(email, password);
      if (!ok) {
        addToast(LOGIN_CREDENTIALS_INVALID_MESSAGE, 'warning');
      }
    } catch (err: unknown) {
      const status =
        err != null && typeof err === 'object' && 'status' in err
          ? Number((err as { status?: number }).status)
          : undefined;
      if (status === 423) {
        addToast(
          extractApiErrorMessage(
            err,
            '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.',
          ),
          'warning',
        );
      } else {
        addToast(LOGIN_CREDENTIALS_INVALID_MESSAGE, 'warning');
      }
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
    if (!data?.role) {
      return false;
    }

    let memberId = 0;
    try {
      const identityRes = await fetch_member_identity_api();
      if (identityRes.success && identityRes.data?.memberId) {
        memberId = identityRes.data.memberId;
      }
    } catch {
      return false;
    }
    if (!memberId) {
      return false;
    }

    const profile = { mileage: 0, membershipGrade: 'ADMIN' };

    finishLogin(email, data.role, memberId, profile, '관리자', 'Admin', {
      ...options,
      passwordChangeRequired: data.passwordChangeRequired,
    });
    return true;
  };

  const handleAdminLogin = async (email: string, password: string) => {
    if (!validateLoginCredentials(email, password)) return;

    setIsLoading(true);

    try {
      const ok = await establishAdminSession(email, password);
      if (!ok) {
        addToast(LOGIN_CREDENTIALS_INVALID_MESSAGE, 'warning');
      }
    } catch (err: unknown) {
      const status =
        err != null && typeof err === 'object' && 'status' in err
          ? Number((err as { status?: number }).status)
          : undefined;
      if (status === 423) {
        addToast(
          extractApiErrorMessage(
            err,
            '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요.',
          ),
          'warning',
        );
      } else {
        addToast(LOGIN_CREDENTIALS_INVALID_MESSAGE, 'warning');
      }
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

    const passwordError = validatePassword(password);
    if (passwordError) {
      addToast(passwordError, 'warning');
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
      addToast(extractApiErrorMessage(err, '회원가입에 실패했습니다.'), 'warning');
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
