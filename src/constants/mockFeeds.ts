export interface FeedItem {
  id: string;
  category: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP';
  author: string;
  location: string;
  date: string;
  img: string;
  content: string;
  rating: number;
}

export const MOCK_FEEDS: FeedItem[] = [
  {
    id: 'feed-1',
    category: 'STAY',
    author: '서지우',
    location: '도쿄',
    date: '2026. 10. 15',
    img: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
    content: '위치가 정말 환상적입니다. 신주쿠역에서 걸어서 5분 거리라 도쿄 어디든 이동하기 편했어요. 고층 펜트하우스라 밤에 보는 야경은 평생 잊을 수 없을 것 같네요! 호스트도 매우 친절하고 대만족입니다.',
    rating: 5
  },
  {
    id: 'feed-2',
    category: 'FOOD',
    author: '민경훈',
    location: '파리',
    date: '2026. 09. 22',
    img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
    content: '온데 투어를 통해 에펠탑 프라이빗 맛집 투어를 예약했는데 정말 만족스러웠어요. 골목길 안쪽에 숨겨진 로컬 크루아상 맛집과 미슐랭 프렌치 레스토랑의 경험은 최고였습니다!',
    rating: 4.5
  },
  {
    id: 'feed-3',
    category: 'PHOTO',
    author: '한소희',
    location: '스위스',
    date: '2026. 08. 11',
    img: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800',
    content: '침실 창문 너머로 웅장한 마테호른 만년설이 걸리는 순간은 마치 그림 같았습니다. 아침 햇살에 분홍빛으로 물드는 설산을 찍기 위해 5시부터 대기했는데 생애 최고의 인생샷을 건졌어요!',
    rating: 5
  },
  {
    id: 'feed-4',
    category: 'STAY',
    author: '김태희',
    location: '발리',
    date: '2026. 07. 30',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    content: '밀림 속에 완벽하게 고립된 정글 럭셔리 풀빌라에서 꿈만 같은 일주일을 보냈습니다. 아침마다 플로팅 조식을 수영장에 띄워 먹으며 들었던 정글 새소리는 일상에서 쌓였던 번아웃을 완벽하게 치유해주었어요.',
    rating: 5
  },
  {
    id: 'feed-6',
    category: 'PHOTO',
    author: '차은우',
    location: '두바이',
    date: '2026. 04. 02',
    img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800',
    content: '두바이 팜 주메이라에서 붉게 흩날리는 사막의 붉은 노을과 초고층 빌딩 스카이라인이 조화를 이루는 비주얼은 장관이었습니다. 고급 리조트 발코니에서 선베드에 누워 칵테일 한 잔 마시며 담았던 이 순간은 잊히지 않을 것입니다.',
    rating: 5
  }
];

// Centralized Mock Upload Sample Images
export const MOCK_FEED_IMAGES = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=800'
];

// Centralized Default Placeholder Image
export const DEFAULT_FEED_PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800';
