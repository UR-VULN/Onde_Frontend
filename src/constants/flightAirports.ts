/** Generated from flights_collected.csv */
export interface FlightAirportOption {
  value: string;
  label: string;
}

export const AIRPORT_LABELS: Record<string, string> = {
  "BCN": "BCN · 바르셀로나",
  "BKK": "BKK · 방콕",
  "CDG": "CDG · 파리",
  "CEB": "CEB · 세부",
  "CJJ": "CJJ · 청주",
  "CJU": "CJU · 제주",
  "DAD": "DAD · 다낭",
  "DPS": "DPS · 발리",
  "DXB": "DXB · 두바이",
  "FCO": "FCO · 로마",
  "FUK": "FUK · 후쿠오카",
  "GMP": "GMP · 김포",
  "HKG": "HKG · 홍콩",
  "ICN": "ICN · 인천",
  "JFK": "JFK · 뉴욕",
  "KAG": "KAG · 강릉",
  "KIX": "KIX · 오사카",
  "LAS": "LAS · 라스베이거스",
  "LAX": "LAX · 로스앤젤레스",
  "LHR": "LHR · 런던",
  "NRT": "NRT · 도쿄 나리타",
  "PUS": "PUS · 부산",
  "PVG": "PVG · 상하이",
  "SIN": "SIN · 싱가포르",
  "SYD": "SYD · 시드니",
  "TAE": "TAE · 대구",
  "TPE": "TPE · 타이베이"
};

export const FLIGHT_DEPARTURE_AIRPORTS: FlightAirportOption[] = [
  {
    "value": "CJJ",
    "label": "CJJ · 청주"
  },
  {
    "value": "CJU",
    "label": "CJU · 제주"
  },
  {
    "value": "GMP",
    "label": "GMP · 김포"
  },
  {
    "value": "ICN",
    "label": "ICN · 인천"
  },
  {
    "value": "NRT",
    "label": "NRT · 도쿄 나리타"
  },
  {
    "value": "PUS",
    "label": "PUS · 부산"
  },
  {
    "value": "SIN",
    "label": "SIN · 싱가포르"
  },
  {
    "value": "TAE",
    "label": "TAE · 대구"
  }
];

export const FLIGHT_ARRIVAL_AIRPORTS: FlightAirportOption[] = [
  {
    "value": "BCN",
    "label": "BCN · 바르셀로나"
  },
  {
    "value": "BKK",
    "label": "BKK · 방콕"
  },
  {
    "value": "CDG",
    "label": "CDG · 파리"
  },
  {
    "value": "CEB",
    "label": "CEB · 세부"
  },
  {
    "value": "CJU",
    "label": "CJU · 제주"
  },
  {
    "value": "DAD",
    "label": "DAD · 다낭"
  },
  {
    "value": "DPS",
    "label": "DPS · 발리"
  },
  {
    "value": "DXB",
    "label": "DXB · 두바이"
  },
  {
    "value": "FCO",
    "label": "FCO · 로마"
  },
  {
    "value": "FUK",
    "label": "FUK · 후쿠오카"
  },
  {
    "value": "HKG",
    "label": "HKG · 홍콩"
  },
  {
    "value": "ICN",
    "label": "ICN · 인천"
  },
  {
    "value": "JFK",
    "label": "JFK · 뉴욕"
  },
  {
    "value": "KAG",
    "label": "KAG · 강릉"
  },
  {
    "value": "KIX",
    "label": "KIX · 오사카"
  },
  {
    "value": "LAS",
    "label": "LAS · 라스베이거스"
  },
  {
    "value": "LAX",
    "label": "LAX · 로스앤젤레스"
  },
  {
    "value": "LHR",
    "label": "LHR · 런던"
  },
  {
    "value": "NRT",
    "label": "NRT · 도쿄 나리타"
  },
  {
    "value": "PUS",
    "label": "PUS · 부산"
  },
  {
    "value": "PVG",
    "label": "PVG · 상하이"
  },
  {
    "value": "SIN",
    "label": "SIN · 싱가포르"
  },
  {
    "value": "SYD",
    "label": "SYD · 시드니"
  },
  {
    "value": "TPE",
    "label": "TPE · 타이베이"
  }
];

export const DEFAULT_FLIGHT_DEPARTURE = 'ICN';
export const DEFAULT_FLIGHT_ARRIVAL = 'NRT';

export function formatAirportLabel(code: string): string {
  return AIRPORT_LABELS[code] ?? code;
}
