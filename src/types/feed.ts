import type { PostDto } from '@/api/postsApi';

export interface FeedItem {
  id: string;
  postId: number;
  category: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP' | 'REVIEW' | 'COMPANION';
  author: string;
  location: string;
  date: string;
  img: string;
  content: string;
  rating: number;
}

const UI_CATEGORIES = new Set<FeedItem['category']>(['STAY', 'FOOD', 'PHOTO', 'TIP']);

/** UI 카테고리 → 백엔드 PostType */
export function feedCategoryToPostType(category: FeedItem['category']): 'REVIEW' | 'COMPANION' {
  return category === 'TIP' ? 'COMPANION' : 'REVIEW';
}

function toFeedCategory(type: string): FeedItem['category'] {
  const upper = type.toUpperCase();
  if (upper === 'REVIEW') return 'PHOTO';
  if (upper === 'COMPANION') return 'TIP';
  return UI_CATEGORIES.has(upper as FeedItem['category'])
    ? (upper as FeedItem['category'])
    : 'PHOTO';
}

export function postDtoToFeedItem(p: PostDto): FeedItem {
  return {
    id: `feed-${p.postId}`,
    postId: p.postId,
    category: toFeedCategory(p.type),
    author: p.authorName,
    location: p.title,
    date: p.createdAt,
    img: p.thumbnailUrl,
    content: p.content ?? p.title,
    rating: 5,
  };
}
