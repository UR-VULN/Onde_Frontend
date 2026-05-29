import { userAxios } from '@/api/axiosInstance';

export interface PostDto {
  postId: number;
  title: string;
  type: string;
  authorName: string;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
  createdAt: string;
}

export interface PostsListResponse {
  posts: PostDto[];
  totalCount: number;
}

export const fetch_posts_api = async (params?: {
  type?: string;
  page?: number;
  size?: number;
}): Promise<{ success: boolean; data: PostsListResponse; message: string }> => {
  return userAxios.get('/api/v1/posts', { params });
};

export interface CreatePostPayload {
  type: string;
  title: string;
  content: string;
  thumbnailUrl: string;
  location?: string;
  rating?: number;
}

export const create_post_api = async (
  payload: CreatePostPayload
): Promise<{ success: boolean; data: PostDto; message: string }> => {
  return userAxios.post('/api/v1/posts', payload);
};
