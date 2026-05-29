/** Generated from flights_collected.csv — schedule_airline */
export interface FlightAirlineInfo {
  name: string;
  code: string;
  color: string;
}

export const FLIGHT_AIRLINES: FlightAirlineInfo[] = [
  {
    "name": "KLM네덜란드항공",
    "code": "KL",
    "color": "#00A1DE"
  },
  {
    "name": "대한항공",
    "code": "KE",
    "color": "#003580"
  },
  {
    "name": "델타항공",
    "code": "DL",
    "color": "#003366"
  },
  {
    "name": "루프트한자",
    "code": "LH",
    "color": "#05164D"
  },
  {
    "name": "싱가포르항공",
    "code": "SQ",
    "color": "#003366"
  },
  {
    "name": "아메리칸항공",
    "code": "AA",
    "color": "#0078D2"
  },
  {
    "name": "아시아나항공",
    "code": "OZ",
    "color": "#F37321"
  },
  {
    "name": "에미레이트항공",
    "code": "EK",
    "color": "#C8102E"
  },
  {
    "name": "에바항공",
    "code": "BR",
    "color": "#009A44"
  },
  {
    "name": "에어뉴질랜드",
    "code": "NZ",
    "color": "#1A1A1A"
  },
  {
    "name": "에어부산",
    "code": "BX",
    "color": "#E4002B"
  },
  {
    "name": "에어서울",
    "code": "RS",
    "color": "#65207D"
  },
  {
    "name": "에어프랑스",
    "code": "AF",
    "color": "#002157"
  },
  {
    "name": "에티하드항공",
    "code": "EY",
    "color": "#BD8B13"
  },
  {
    "name": "영국항공",
    "code": "BA",
    "color": "#075AAA"
  },
  {
    "name": "유나이티드항공",
    "code": "UA",
    "color": "#002244"
  },
  {
    "name": "일본항공",
    "code": "JL",
    "color": "#CC0000"
  },
  {
    "name": "전일본공수",
    "code": "NH",
    "color": "#003087"
  },
  {
    "name": "제주항공",
    "code": "7C",
    "color": "#FF6B00"
  },
  {
    "name": "진에어",
    "code": "LJ",
    "color": "#3A6C9E"
  },
  {
    "name": "차이나에어라인",
    "code": "CI",
    "color": "#003DA5"
  },
  {
    "name": "카타르항공",
    "code": "QR",
    "color": "#5C0636"
  },
  {
    "name": "캐세이퍼시픽",
    "code": "CX",
    "color": "#006564"
  },
  {
    "name": "콴타스항공",
    "code": "QF",
    "color": "#E0001B"
  },
  {
    "name": "타이항공",
    "code": "TG",
    "color": "#6B1888"
  },
  {
    "name": "터키항공",
    "code": "TK",
    "color": "#C70A0C"
  },
  {
    "name": "티웨이항공",
    "code": "TW",
    "color": "#E31E24"
  },
  {
    "name": "핀에어",
    "code": "AY",
    "color": "#002F87"
  }
];

export const AIRLINE_COLORS_BY_NAME: Record<string, string> = {
  "KLM네덜란드항공": "#00A1DE",
  "대한항공": "#003580",
  "델타항공": "#003366",
  "루프트한자": "#05164D",
  "싱가포르항공": "#003366",
  "아메리칸항공": "#0078D2",
  "아시아나항공": "#F37321",
  "에미레이트항공": "#C8102E",
  "에바항공": "#009A44",
  "에어뉴질랜드": "#1A1A1A",
  "에어부산": "#E4002B",
  "에어서울": "#65207D",
  "에어프랑스": "#002157",
  "에티하드항공": "#BD8B13",
  "영국항공": "#075AAA",
  "유나이티드항공": "#002244",
  "일본항공": "#CC0000",
  "전일본공수": "#003087",
  "제주항공": "#FF6B00",
  "진에어": "#3A6C9E",
  "차이나에어라인": "#003DA5",
  "카타르항공": "#5C0636",
  "캐세이퍼시픽": "#006564",
  "콴타스항공": "#E0001B",
  "타이항공": "#6B1888",
  "터키항공": "#C70A0C",
  "티웨이항공": "#E31E24",
  "핀에어": "#002F87"
};

export const AIRLINE_COLORS_BY_CODE: Record<string, string> = {
  "KL": "#00A1DE",
  "KE": "#003580",
  "DL": "#003366",
  "LH": "#05164D",
  "SQ": "#003366",
  "AA": "#0078D2",
  "OZ": "#F37321",
  "EK": "#C8102E",
  "BR": "#009A44",
  "NZ": "#1A1A1A",
  "BX": "#E4002B",
  "RS": "#65207D",
  "AF": "#002157",
  "EY": "#BD8B13",
  "BA": "#075AAA",
  "UA": "#002244",
  "JL": "#CC0000",
  "NH": "#003087",
  "7C": "#FF6B00",
  "LJ": "#3A6C9E",
  "CI": "#003DA5",
  "QR": "#5C0636",
  "CX": "#006564",
  "QF": "#E0001B",
  "TG": "#6B1888",
  "TK": "#C70A0C",
  "TW": "#E31E24",
  "AY": "#002F87"
};

export function getAirlineColor(nameOrCode: string): string {
  return (
    AIRLINE_COLORS_BY_NAME[nameOrCode] ??
    AIRLINE_COLORS_BY_CODE[nameOrCode] ??
    '#005ce6'
  );
}
