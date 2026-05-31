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
  const res = (await userAxios.get('/api/v1/posts', { params })) as {
    success: boolean;
    data: PostsListResponse | PostDto[];
    message: string;
  };
  if (!res.success || !res.data) return { success: res.success, data: { posts: [], totalCount: 0 }, message: res.message };
  if (Array.isArray(res.data)) {
    return {
      success: true,
      message: res.message,
      data: {
        posts: res.data,
        totalCount: res.data.length,
      },
    };
  }
  return res as { success: boolean; data: PostsListResponse; message: string };
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
