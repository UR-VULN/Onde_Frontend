export interface MockUser {
  email: string;
  password: string;
  username: string;
  role: 'cust' | 'sell' | 'adm';
  status: 'active' | 'pending';
  memberId: number;
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
    memberId: 1001,
    mileage: 0,
    membershipGrade: 'GOLD MEMBER',
  },
  {
    email: 'seller@test.com',
    password: 'test',
    username: '파트너현민',
    role: 'sell',
    status: 'active',
    memberId: 2001,
    mileage: 0,
    membershipGrade: 'PARTNER',
  },
  {
    email: 'seller_pending@test.com',
    password: 'test',
    username: '대기판매자',
    role: 'sell',
    status: 'pending',
    memberId: 2002,
    mileage: 0,
    membershipGrade: 'PARTNER',
  },
  {
    email: 'admin@test.com',
    password: 'test',
    username: '어드민현민',
    role: 'adm',
    status: 'active',
    memberId: 9001,
    mileage: 0,
    membershipGrade: 'STAFF',
  },
];
