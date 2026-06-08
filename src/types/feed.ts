import type { PostDto, BackendPostType } from '@/api/postsApi';

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
export function feedCategoryToPostType(category: FeedItem['category']): BackendPostType {
  return category as BackendPostType;
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
  let displayContent = p.content ?? p.title;
  let rating = p.rating ?? 5;

  const ratingRegex = /\n\n평점:\s*([0-5](?:\.[0-9]+)?)\/5$/;
  const match = displayContent.match(ratingRegex);
  if (match) {
    if (p.rating === undefined || p.rating === null || p.rating === 5) {
      rating = parseFloat(match[1]);
    }
    displayContent = displayContent.replace(ratingRegex, '');
  }

  return {
    id: `feed-${p.postId}`,
    postId: p.postId,
    category: toFeedCategory(p.type),
    author: p.authorName,
    location: p.title,
    date: p.createdAt,
    img: p.thumbnailUrl,
    content: displayContent,
    rating: rating,
  };
}
