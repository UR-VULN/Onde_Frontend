import { userAxios } from '@/api/axiosInstance';

export interface PostDto {
  postId: number;
  title: string;
  content: string;
  type: 'FEED' | 'DIARY';
  status: 'ACTIVE' | 'BLINDED';
  authorName: string;
  imageUrls: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  type: 'FEED' | 'DIARY';
  images?: File[];
}

// 1. 게시글 목록 조회
export const get_posts_api = async (type?: string, page: number = 0, size: number = 20): Promise<{ success: boolean; data: PostDto[]; message: string }> => {
  return userAxios.get('/api/v1/posts', {
    params: { type, page, size }
  });
};

// 2. 게시글 등록 (Multipart/form-data)
export const create_post_api = async (payload: CreatePostPayload): Promise<{ success: boolean; message: string }> => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('content', payload.content);
  formData.append('type', payload.type);
  
  if (payload.images) {
    payload.images.forEach((image) => {
      formData.append('images', image);
    });
  }

  return userAxios.post('/api/v1/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 3. 게시글 삭제
export const delete_post_api = async (postId: number): Promise<{ success: boolean; message: string }> => {
  return userAxios.delete(`/api/v1/posts/${postId}`);
};
