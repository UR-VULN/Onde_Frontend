export interface FlightAirlineInfo {
  name: string;
  code: string;
  color: string;
}

export const FLIGHT_AIRLINES: FlightAirlineInfo[] = [
  {
    "name": "에어 루나",
    "code": "LN",
    "color": "#E6B800"
  },
  {
    "name": "제니스 항공",
    "code": "ZH",
    "color": "#3E1B5B"
  },
  {
    "name": "스카이웨이",
    "code": "SW",
    "color": "#00BFFF"
  },
  {
    "name": "실버 에어로",
    "code": "SA",
    "color": "#A9ACB6"
  },
  {
    "name": "캐세이 윙스",
    "code": "CW",
    "color": "#008080"
  },
  {
    "name": "지니 패스",
    "code": "GP",
    "color": "#FF5733"
  },
  {
    "name": "티플라이",
    "code": "TF",
    "color": "#82C91E"
  }
];

export const AIRLINE_COLORS_BY_NAME: Record<string, string> = {
  "에어 루나": "#E6B800",
  "제니스 항공": "#3E1B5B",
  "스카이웨이": "#00BFFF",
  "실버 에어로": "#A9ACB6",
  "캐세이 윙스": "#008080",
  "지니 패스": "#FF5733",
  "티플라이": "#82C91E"
};

export const AIRLINE_COLORS_BY_CODE: Record<string, string> = {
  "LN": "#E6B800",
  "ZH": "#3E1B5B",
  "SW": "#00BFFF",
  "SA": "#A9ACB6",
  "CW": "#008080",
  "GP": "#FF5733",
  "TF": "#82C91E"
};

export function getAirlineColor(nameOrCode: string): string {
  return (
    AIRLINE_COLORS_BY_NAME[nameOrCode] ??
    AIRLINE_COLORS_BY_CODE[nameOrCode] ??
    '#005ce6'
  );
}
