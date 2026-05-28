export interface MockUser {
  email: string;
  password: string;
  username: string;
  role: 'cust' | 'sell' | 'adm';
  status: 'active' | 'pending'; // pending = 관리자 승인 대기 중
}

export const MOCK_USERS: MockUser[] = [
  {
    email: 'test@test.com',
    password: 'test',
    username: '테스터현민',
    role: 'cust',
    status: 'active',
  },
  {
    email: 'seller@test.com',
    password: 'test',
    username: '파트너현민',
    role: 'sell',
    status: 'active',   // 관리자 승인 완료된 판매자
  },
  {
    email: 'seller_pending@test.com',
    password: 'test',
    username: '대기판매자',
    role: 'sell',
    status: 'pending',  // 관리자 승인 대기 중인 판매자
  },
  {
    email: 'admin@test.com',
    password: 'test',
    username: '어드민현민',
    role: 'adm',
    status: 'active',
  },
];
