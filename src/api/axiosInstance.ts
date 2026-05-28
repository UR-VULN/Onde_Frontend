import axios from 'axios';

// 일반 사용자 서비스용 Axios 인스턴스 (Port 8080)
export const userAxios = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 본사 관리자 백오피스 서비스용 Axios 인스턴스 (Port 8081)
export const adminAxios = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 판매자(셀러) 파트너 포탈 서비스용 Axios 인스턴스 (Port 8081, 별도 경로)
export const sellerAxios = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// JWT 토큰 주입용 인터셉터 설정
const injectToken = (config: any) => {
  const token = localStorage.getItem('onde_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

userAxios.interceptors.request.use(injectToken, (error) => Promise.reject(error));
adminAxios.interceptors.request.use(injectToken, (error) => Promise.reject(error));
sellerAxios.interceptors.request.use(injectToken, (error) => Promise.reject(error));

// 공통 에러 처리 응답 인터셉터
const handleResponseError = (error: any) => {
  console.error('[API ERROR INTERCEPTOR]:', error);
  // 공통 에러 반환 구조 (ApiResponse 형식에 맞춤)
  const errorData = error.response?.data;
  return Promise.reject(errorData || { success: false, error: { message: '네트워크 연결 오류가 발생했습니다.' } });
};

userAxios.interceptors.response.use((response) => response.data, handleResponseError);
adminAxios.interceptors.response.use((response) => response.data, handleResponseError);
sellerAxios.interceptors.response.use((response) => response.data, handleResponseError);
