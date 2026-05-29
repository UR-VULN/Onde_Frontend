export interface MockUser {
  email: string;
  password: string;
  username: string;
  role: 'cust' | 'sell' | 'adm';
  status: 'active' | 'pending'; // pending = 관리자 승인 대기 중
  /** 로그인 API 연동 전 임시 프로필 (실서비스는 fetch_member_profile_api) */
  mileage: number;
  membershipGrade: string;
}

export const DEFAULT_MEMBERSHIP_GRADE = 'BASIC MEMBER';

export const MOCK_USERS: MockUser[] = [
  {
    email: 'test@test.com',
    password: 'test',
    username: '테스터현민',
    role: 'cust',
    status: 'active',
    mileage: 0,
    membershipGrade: 'GOLD MEMBER',
  },
  {
    email: 'seller@test.com',
    password: 'test',
    username: '파트너현민',
    role: 'sell',
    status: 'active',
    mileage: 0,
    membershipGrade: 'PARTNER',
  },
  {
    email: 'seller_pending@test.com',
    password: 'test',
    username: '대기판매자',
    role: 'sell',
    status: 'pending',
    mileage: 0,
    membershipGrade: 'PARTNER',
  },
  {
    email: 'admin@test.com',
    password: 'test',
    username: '어드민현민',
    role: 'adm',
    status: 'active',
    mileage: 0,
    membershipGrade: 'STAFF',
  },
];
