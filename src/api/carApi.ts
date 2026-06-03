import { userAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';
import { getMemberId } from '@/utils/authCookies';

export interface CarSearchParams {
  location?: string;
  pickup: string;
  returnTime: string;
  carType?: string;
  sort?: string;
}

interface BackendCarItem {
  id?: number;
  carId?: number;
  modelName: string;
  carType: string;
  price?: number;
  dailyPrice?: number;
}

export interface CarListItemDto {
  carId: number;
  modelName: string;
  carType: string;
  dailyPrice: number;
}

export interface CarListResponse {
  cars: CarListItemDto[];
  totalCount: number;
}

export interface CarSearchFormParams {
  pickupSpot: string;
  pickupDate: string;
  returnDate: string;
  carType: string;
  page?: number;
  size?: number;
}

export interface CarDto {
  id: number;
  carId: number;
  name: string;
  type: string;
  typeLabel: string;
  description: string;
  imageUrl?: string;
  pricePerDay: number;
  seats?: number;
  fuel?: string;
  tags: string[];
}

export interface CarSearchResponse {
  total: number;
  page: number;
  size: number;
  cars: CarDto[];
}

function toDateTime(dateStr: string, time = '10:00:00'): string {
  return `${dateStr}T${time}`;
}

function mapBackendCar(item: BackendCarItem): CarListItemDto {
  return {
    carId: Number(item.carId ?? item.id ?? 0),
    modelName: item.modelName,
    carType: item.carType,
    dailyPrice: Number(item.dailyPrice ?? item.price ?? 0),
  };
}

const CAR_IMAGE_MAP: Record<string, string> = {
  "Audi A4": "Audi A4.jpg",
  "BMW 3 Series": "BMW 3 Series.avif",
  "BMW X5": "BMW X5.jpg",
  "Bentley Bentayga": "Bentley Bentayga.avif",
  "Cadillac Escalade": "Cadillac Escalade.jpg",
  "Chevrolet Corvette": "Chevrolet Corvette.jpg",
  "Chevrolet Suburban": "Chevrolet Suburban.jpg",
  "EV6": "EV6.jpg",
  "Ferrari 488 GTB": "Ferrari 488 GTB.jpg",
  "Ford F-150": "Ford F-150.jpg",
  "Ford Focus": "Ford Focus.jpg",
  "Ford Mustang": "Ford Mustang.jpg",
  "G80 전기": "G80 전기.avif",
  "GV80": "GV80.avif",
  "Honda City": "Honda City.jpg",
  "Honda Fit": "Honda Fit.avif",
  "Honda Odyssey": "Honda Odyssey.avif",
  "Jeep Wrangler": "Jeep Wrangler.jpg",
  "K3 세단": "K3 세단.jpg",
  "K5 LPi": "K5 LPi.jpg",
  "Lamborghini Huracan": "Lamborghini Huracan.jpg",
  "Mercedes C-Class": "Mercedes C-Class.avif",
  "Mercedes S-Class": "Mercedes S-Class.jpg",
  "Mitsubishi Pajero": "Mitsubishi Pajero.jpg",
  "Nissan Note": "Nissan Note.jpg",
  "Nissan Patrol": "Nissan Patrol.jpg",
  "Nissan X-Trail": "Nissan X-Trail.jpg",
  "Range Rover Sport": "Range Rover Sport.jpg",
  "Renault Clio": "Renault Clio.jpg",
  "Tesla Model 3": "Tesla Model 3.jpg",
  "Tesla Model Y": "Tesla Model Y.jpg",
  "Toyota Alphard": "Toyota Alphard.jpg",
  "Toyota Aqua": "Toyota Aqua.jpg",
  "Toyota Camry": "Toyota Camry.avif",
  "Toyota Corolla": "Toyota Corolla.jpg",
  "Toyota Fortuner": "Toyota Fortuner.jpg",
  "Toyota Innova": "Toyota Innova.jpg",
  "Toyota Land Cruiser": "Toyota Land Cruiser.jpg",
  "Toyota RAV4 Hybrid": "Toyota RAV4 Hybrid.jpg",
  "Toyota Vios": "Toyota Vios.jpg",
  "Volkswagen Golf": "Volkswagen Golf.jpg",
  "Volkswagen Tiguan": "Volkswagen Tiguan.jpg",
  "그랜저 GN7": "그랜저 GN7.jpg",
  "레이 EV": "레이EV.jpg",
  "스타리아": "스타리아.jpg",
  "스포티지 하이브리드": "스포티지 하이브리드.jpg",
  "싼타페 TM": "싼타페 TM.jpg",
  "쏘나타 DN8": "쏘나타 DN8.jpg",
  "아반떼 CN7": "아반떼 CN7.jpg",
  "아이오닉6": "아이오닉6.jpg",
  "카니발 4세대": "카니발 4세대.jpg",
  "캐스퍼 1.0T": "캐스퍼 1.0T.jpg",
  "투싼 하이브리드": "투싼 하이브리드.jpg",
  "팰리세이드": "팰리세이드.jpg"
};

function mapCarListItemToDto(item: CarListItemDto): CarDto {
  const filename = CAR_IMAGE_MAP[item.modelName];
  const imageUrl = filename ? `http://localhost:9000/onde-local/car/${filename}` : undefined;
  return {
    id: item.carId,
    carId: item.carId,
    name: item.modelName,
    type: item.carType,
    typeLabel: item.carType,
    description: item.modelName,
    pricePerDay: item.dailyPrice,
    tags: [item.carType],
    imageUrl,
  };
}


export const search_cars_list_api = async (
  params: CarSearchParams
): Promise<{ success: boolean; data: CarListResponse; message: string }> => {
  const raw = await userAxios.get('/api/v1/cars/search', { params });
  const res = unwrapApi<{ cars: BackendCarItem[]; totalCount?: number }>(raw);
  const cars = (res.data?.cars ?? []).map(mapBackendCar);
  return {
    success: res.success,
    message: res.message,
    data: { cars, totalCount: Number(res.data?.totalCount ?? cars.length) },
  };
};

export const search_cars_api = async (
  params: CarSearchFormParams
): Promise<{ success: boolean; data: CarSearchResponse; message: string }> => {
  const res = await search_cars_list_api({
    location: params.pickupSpot || undefined,
    carType: params.carType === 'ALL' ? undefined : params.carType,
    pickup: toDateTime(params.pickupDate),
    returnTime: toDateTime(params.returnDate, '18:00:00'),
  });

  if (!res.success || !res.data) {
    return { success: false, data: { total: 0, page: 0, size: 20, cars: [] }, message: res.message };
  }

  const page = params.page ?? 0;
  const size = params.size ?? 20;
  return {
    success: true,
    message: res.message,
    data: {
      total: res.data.totalCount,
      page,
      size,
      cars: res.data.cars.map(mapCarListItemToDto),
    },
  };
};

export const get_car_detail_api = async (
  carId: number
): Promise<{ success: boolean; data: CarDto; message: string }> => {
  const today = new Date().toISOString().split('T')[0];
  const end = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
  const res = await search_cars_list_api({
    pickup: toDateTime(today),
    returnTime: toDateTime(end, '18:00:00'),
  });
  const found = res.data?.cars.find((c) => c.carId === carId);
  if (!found) {
    return { success: false, data: {} as CarDto, message: '차량을 찾을 수 없습니다.' };
  }
  return { success: true, data: mapCarListItemToDto(found), message: '조회되었습니다.' };
};

export interface CarReservationPayload {
  memberId?: number;
  carId: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
}

export interface CarReservationResponse {
  reservationId: number;
  status: string;
  message: string;
}

export const book_car_api = async (
  payload: CarReservationPayload
): Promise<{ success: boolean; data: CarReservationResponse & { totalPrice: number }; message: string }> => {
  const memberId = payload.memberId ?? getMemberId();
  if (!memberId) {
    return {
      success: false,
      message: '로그인이 필요합니다.',
      data: { reservationId: 0, status: '', message: '', totalPrice: 0 },
    };
  }
  const raw = await userAxios.post('/api/v1/reservations/cars', {
    memberId,
    carId: payload.carId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    totalPrice: payload.totalPrice,
  });
  const res = unwrapApi<{ reservationId: number; status: string; message?: string }>(raw);
  return {
    success: res.success,
    message: res.message,
    data: {
      reservationId: res.data.reservationId,
      status: String(res.data.status),
      message: res.data.message ?? res.message,
      totalPrice: payload.totalPrice,
    },
  };
};
