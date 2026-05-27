export interface MockUser {
  email: string;
  password:  string;
  username: string;
  role: 'cust' | 'sell' | 'adm';
}

export const MOCK_USERS: MockUser[] = [
  {
    email: 'test@test.com',
    password: 'test',
    username: '테스터현민',
    role: 'cust'
  },
  {
    email: 'seller@test.com',
    password: 'test',
    username: '파트너현민',
    role: 'sell'
  },
  {
    email: 'admin@test.com',
    password: 'test',
    username: '어드민현민',
    role: 'adm'
  }
];
