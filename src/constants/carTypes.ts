export const CAR_TYPE_ALL = '전체 차량';

/** car_type 27종 + 전체 */
export const CAR_TYPE_OPTIONS: string[] = [
  CAR_TYPE_ALL,
  '경차',
  '준중형 세단',
  '중형 세단',
  '대형 세단',
  '소형 세단',
  '세단',
  '전기 세단',
  '럭셔리 세단',
  '플래그십 세단',
  '중형 SUV',
  '대형 SUV',
  '전기 SUV',
  '럭셔리 SUV',
  '대형 럭셔리 SUV',
  '오프로드 SUV',
  'SUV',
  '승합차',
  '대형 승합차',
  '미니밴',
  '대형 미니밴',
  'MPV',
  '해치백',
  '소형 해치백',
  '경형 하이브리드',
  '슈퍼카',
  '스포츠카',
  '픽업 트럭',
];

export const DEFAULT_CAR_TYPE = CAR_TYPE_ALL;

export function matchesCarTypeLabel(typeLabel: string, selectedType: string): boolean {
  if (!selectedType || selectedType === CAR_TYPE_ALL) return true;
  return typeLabel.includes(selectedType);
}
