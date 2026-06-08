import type { SellerCarModelGroup } from '@/api/sellerApi';
import { get_seller_inventory_calendar_api } from '@/api/sellerApi';

export type SellerCarDayCell = { stock: number; price: number; isClosed?: boolean };

/** 차종 그룹 내 모든 차량의 일별 재고를 합산 */
export async function fetchMergedCarGroupCalendar(
  group: SellerCarModelGroup,
  monthStr: string
): Promise<Record<number, SellerCarDayCell>> {
  const responses = await Promise.all(
    group.vehicles.map((v) =>
      get_seller_inventory_calendar_api({
        propertyKey: `car-${v.propertyId}`,
        month: monthStr,
      })
    )
  );

  const merged: Record<number, SellerCarDayCell> = {};

  for (const res of responses) {
    if (!res.success || !res.data) continue;
    Object.entries(res.data).forEach(([day, cell]) => {
      const d = Number(day);
      const prev = merged[d];
      const stock = (prev?.stock ?? 0) + cell.stock;
      merged[d] = {
        stock,
        price: prev?.price ?? cell.price,
        isClosed: stock === 0,
      };
    });
  }

  return merged;
}

/** 차종 그룹 총 재고를 차량 대수에 분배 (나머지는 앞쪽 차량에 +1) */
export function distributeStockAcrossVehicles(total: number, vehicleCount: number): number[] {
  if (vehicleCount <= 0) return [];
  const base = Math.floor(total / vehicleCount);
  const remainder = total % vehicleCount;
  return Array.from({ length: vehicleCount }, (_, i) => base + (i < remainder ? 1 : 0));
}
