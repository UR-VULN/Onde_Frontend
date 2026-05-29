import type { PostDto } from '@/api/postsApi';

export interface FeedItem {
  id: string;
  postId: number;
  category: 'STAY' | 'FOOD' | 'PHOTO' | 'TIP';
  author: string;
  location: string;
  date: string;
  img: string;
  content: string;
  rating: number;
}

const FEED_CATEGORIES = new Set<FeedItem['category']>(['STAY', 'FOOD', 'PHOTO', 'TIP']);

function toFeedCategory(type: string): FeedItem['category'] {
  const upper = type.toUpperCase();
  return FEED_CATEGORIES.has(upper as FeedItem['category']) ? (upper as FeedItem['category']) : 'TIP';
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
    content: p.title,
    rating: 5,
  };
}
