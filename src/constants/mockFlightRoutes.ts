function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// Build today/tomorrow base times
const TODAY_BASE = new Date();
TODAY_BASE.setHours(0, 0, 0, 0);

export interface MockFlightRoute {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  arrivalAirport: string;
  arrivalCity: string;
  departureTime: string;   // HH:MM
  arrivalTime: string;     // HH:MM
  date: string;            // YYYY-MM-DD (today)
  arrivalDate: string;     // YYYY-MM-DD (today or tomorrow if overnight)
  durationMinutes: number;
  priceFrom: number;
  tags: string[];
  /** 해당 노선의 예약 불가 날짜 목록 (일(day-of-month) 기준). 백엔드 연동 시 대체 */
  unavailableDays: number[];
  /** 1인당 수하물 추가 요금 (원). 백엔드 연동 시 대체 */
  baggageFeePerPerson: number;
}

const d = formatDate(new Date());
const tmr = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));

export const MOCK_FLIGHT_ROUTES: MockFlightRoute[] = [
  {
    id: 'route-icn-nrt-1',
    airline: '아시아나항공',
    airlineCode: 'OZ',
    flightNumber: 'OZ-102',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'NRT',
    arrivalCity: '도쿄 나리타',
    departureTime: '09:00',
    arrivalTime: '11:10',
    date: d,
    arrivalDate: d,
    durationMinutes: 130,
    priceFrom: 320000,
    tags: ['일본', '도쿄', '아시아'],
    unavailableDays: [6, 13, 20, 27],
    baggageFeePerPerson: 50000,
  },
  {
    id: 'route-icn-hnd-1',
    airline: '대한항공',
    airlineCode: 'KE',
    flightNumber: 'KE-703',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'HND',
    arrivalCity: '도쿄 하네다',
    departureTime: '14:30',
    arrivalTime: '16:35',
    date: d,
    arrivalDate: d,
    durationMinutes: 125,
    priceFrom: 350000,
    tags: ['일본', '도쿄', '아시아'],
    unavailableDays: [3, 10, 17, 24],
    baggageFeePerPerson: 50000,
  },
  {
    id: 'route-icn-pvg-1',
    airline: '아시아나항공',
    airlineCode: 'OZ',
    flightNumber: 'OZ-361',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'PVG',
    arrivalCity: '상하이 푸동',
    departureTime: '10:20',
    arrivalTime: '11:50',
    date: d,
    arrivalDate: d,
    durationMinutes: 90,
    priceFrom: 280000,
    tags: ['중국', '상하이', '아시아'],
    unavailableDays: [5, 12, 19, 26],
    baggageFeePerPerson: 40000,
  },
  {
    id: 'route-icn-sin-1',
    airline: '싱가포르항공',
    airlineCode: 'SQ',
    flightNumber: 'SQ-602',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'SIN',
    arrivalCity: '싱가포르',
    departureTime: '23:55',
    arrivalTime: '05:35',
    date: d,
    arrivalDate: tmr,
    durationMinutes: 400,
    priceFrom: 580000,
    tags: ['싱가포르', '동남아', '아시아'],
    unavailableDays: [2, 9, 16, 23],
    baggageFeePerPerson: 60000,
  },
  {
    id: 'route-icn-bkk-1',
    airline: '대한항공',
    airlineCode: 'KE',
    flightNumber: 'KE-657',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'BKK',
    arrivalCity: '방콕 수완나품',
    departureTime: '18:40',
    arrivalTime: '22:30',
    date: d,
    arrivalDate: d,
    durationMinutes: 350,
    priceFrom: 420000,
    tags: ['태국', '방콕', '동남아'],
    unavailableDays: [4, 11, 18, 25],
    baggageFeePerPerson: 55000,
  },
  {
    id: 'route-icn-cdg-1',
    airline: '에어프랑스',
    airlineCode: 'AF',
    flightNumber: 'AF-267',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'CDG',
    arrivalCity: '파리 샤를드골',
    departureTime: '13:00',
    arrivalTime: '18:40',
    date: d,
    arrivalDate: d,
    durationMinutes: 700,
    priceFrom: 1200000,
    tags: ['프랑스', '파리', '유럽'],
    unavailableDays: [7, 14, 21, 28],
    baggageFeePerPerson: 80000,
  },
  {
    id: 'route-icn-lax-1',
    airline: '대한항공',
    airlineCode: 'KE',
    flightNumber: 'KE-017',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'LAX',
    arrivalCity: '로스앤젤레스',
    departureTime: '17:25',
    arrivalTime: '12:35',
    date: d,
    arrivalDate: d,
    durationMinutes: 645,
    priceFrom: 980000,
    tags: ['미국', '로스앤젤레스', '미주'],
    unavailableDays: [1, 8, 15, 22, 29],
    baggageFeePerPerson: 80000,
  },
  {
    id: 'route-icn-lhr-1',
    airline: '영국항공',
    airlineCode: 'BA',
    flightNumber: 'BA-018',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'LHR',
    arrivalCity: '런던 히드로',
    departureTime: '12:40',
    arrivalTime: '17:10',
    date: d,
    arrivalDate: d,
    durationMinutes: 710,
    priceFrom: 1150000,
    tags: ['영국', '런던', '유럽'],
    unavailableDays: [3, 10, 17, 24],
    baggageFeePerPerson: 80000,
  },
  {
    id: 'route-icn-dxb-1',
    airline: '에미레이트',
    airlineCode: 'EK',
    flightNumber: 'EK-323',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'DXB',
    arrivalCity: '두바이',
    departureTime: '21:40',
    arrivalTime: '03:10',
    date: d,
    arrivalDate: tmr,
    durationMinutes: 550,
    priceFrom: 780000,
    tags: ['UAE', '두바이', '중동'],
    unavailableDays: [6, 12, 18, 24],
    baggageFeePerPerson: 70000,
  },
  {
    id: 'route-icn-syd-1',
    airline: '콴타스',
    airlineCode: 'QF',
    flightNumber: 'QF-127',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'SYD',
    arrivalCity: '시드니',
    departureTime: '20:30',
    arrivalTime: '08:05',
    date: d,
    arrivalDate: tmr,
    durationMinutes: 635,
    priceFrom: 920000,
    tags: ['호주', '시드니', '오세아니아'],
    unavailableDays: [5, 11, 17, 23, 29],
    baggageFeePerPerson: 75000,
  },
  {
    id: 'route-icn-hkg-1',
    airline: '캐세이퍼시픽',
    airlineCode: 'CX',
    flightNumber: 'CX-417',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'HKG',
    arrivalCity: '홍콩',
    departureTime: '08:00',
    arrivalTime: '10:50',
    date: d,
    arrivalDate: d,
    durationMinutes: 210,
    priceFrom: 380000,
    tags: ['홍콩', '아시아', '단거리'],
    unavailableDays: [4, 11, 18, 25],
    baggageFeePerPerson: 45000,
  },
  {
    id: 'route-icn-kul-1',
    airline: '말레이시아항공',
    airlineCode: 'MH',
    flightNumber: 'MH-066',
    departureAirport: 'ICN',
    departureCity: '인천',
    arrivalAirport: 'KUL',
    arrivalCity: '쿠알라룸푸르',
    departureTime: '16:20',
    arrivalTime: '22:10',
    date: d,
    arrivalDate: d,
    durationMinutes: 390,
    priceFrom: 520000,
    tags: ['말레이시아', '동남아', '아시아'],
    unavailableDays: [2, 8, 14, 20, 26],
    baggageFeePerPerson: 60000,
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const SHUFFLED_FLIGHT_ROUTES = shuffleArray(MOCK_FLIGHT_ROUTES);
