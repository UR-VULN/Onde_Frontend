export function hasDisplayImage(url?: string | null): boolean {
  return Boolean(url?.trim());
}

export function hasDisplayPrice(price?: number | null): boolean {
  return price != null && price > 0;
}

export function hasDisplayRating(rating?: number | null): boolean {
  return rating != null && rating > 0;
}

export function formatKrwPrice(price: number): string {
  return `₩${price.toLocaleString('ko-KR')}`;
}

export function formatKrwPriceOrDash(price?: number | null, suffix = ''): string {
  if (!hasDisplayPrice(price)) return '—';
  return `${formatKrwPrice(price!)}${suffix}`;
}
