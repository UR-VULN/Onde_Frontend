import { userAxios } from '@/api/axiosInstance';
import { unwrapApi } from '@/utils/apiResponse';

export type BackendPostType = 'REVIEW' | 'COMPANION' | 'STAY' | 'FOOD' | 'PHOTO' | 'TIP';

export interface PostDto {
  postId: number;
  title: string;
  type: string;
  authorName: string;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
  createdAt: string;
  content?: string;
  rating?: number;
}

export interface PostsListResponse {
  posts: PostDto[];
  totalCount: number;
}

export const fetch_posts_api = async (params?: {
  type?: BackendPostType | string;
  page?: number;
  size?: number;
}): Promise<{ success: boolean; data: PostsListResponse; message: string }> => {
  const raw = await userAxios.get('/api/v1/posts', { params });
  const res = unwrapApi<PostDto[] | PostsListResponse>(raw);
  if (Array.isArray(res.data)) {
    return {
      success: res.success,
      message: res.message,
      data: { posts: res.data, totalCount: res.data.length },
    };
  }
  const list = res.data as PostsListResponse;
  return {
    success: res.success,
    message: res.message,
    data: {
      posts: list.posts ?? [],
      totalCount: list.totalCount ?? list.posts?.length ?? 0,
    },
  };
};

export interface CreatePostPayload {
  type: BackendPostType;
  title: string;
  content: string;
  rating: number;
  images?: File[];
}

export const create_post_api = async (
  payload: CreatePostPayload
): Promise<{ success: boolean; data: PostDto; message: string }> => {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('content', payload.content);
  form.append('type', payload.type);
  form.append('rating', String(payload.rating));
  payload.images?.forEach((file) => form.append('images', file));

  const raw = await userAxios.post('/api/v1/posts', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const res = unwrapApi<PostDto>(raw);
  return { success: res.success, data: res.data, message: res.message };
};

export const delete_post_api = async (
  postId: number
): Promise<{ success: boolean; message: string }> => {
  const raw = await userAxios.delete(`/api/v1/posts/${postId}`);
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};

export const like_post_api = async (
  postId: number
): Promise<{ success: boolean; message: string }> => {
  const raw = await userAxios.post(`/api/v1/posts/${postId}/likes`);
  const res = unwrapApi<unknown>(raw);
  return { success: res.success, message: res.message };
};
