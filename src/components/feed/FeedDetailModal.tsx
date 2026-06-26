import React, { useEffect, useState } from 'react';
import type { FeedItem } from '@/types/feed';
import { getCategoryAvatar, formatDate, getCategoryLabel, renderStars } from './feedHelpers';
import { useTravelStore } from '@/store/useTravelStore';
import {
  fetch_comments_api,
  create_comment_api,
  update_comment_api,
  delete_comment_api,
  update_post_api,
  delete_post_api,
  type CommentDto
} from '@/api/postsApi';

interface FeedDetailModalProps {
  feed: FeedItem | null;
  onClose: () => void;
  onFeedUpdated?: (updated: FeedItem) => void;
  onFeedDeleted?: (postId: number) => void;
}

export const FeedDetailModal: React.FC<FeedDetailModalProps> = ({
  feed,
  onClose,
  onFeedUpdated,
  onFeedDeleted
}) => {
  const { isLoggedIn, username, nickname, addToast, openAuthModal } = useTravelStore();

  const [comments, setComments] = useState<CommentDto[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSecretComment, setIsSecretComment] = useState(false);

  // Edit Comment state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editCommentSecret, setEditCommentSecret] = useState(false);

  // Edit Post state
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postRating, setPostRating] = useState(5);

  // Load comments
  const loadComments = async () => {
    if (!feed) return;
    try {
      const res = await fetch_comments_api(feed.postId);
      if (res.success) {
        setComments(res.data);
      }
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    if (feed) {
      loadComments();
      setPostTitle(feed.location);
      setPostContent(feed.content);
      setPostRating(feed.rating);
      setIsEditingPost(false);
    }
  }, [feed]);

  if (!feed) return null;

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      addToast('댓글을 작성하려면 로그인이 필요합니다.', 'warning');
      openAuthModal();
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await create_comment_api(feed.postId, {
        content: commentText,
        isSecret: isSecretComment
      });
      if (res.success) {
        addToast('댓글이 성공적으로 등록되었습니다.', 'success');
        setCommentText('');
        setIsSecretComment(false);
        loadComments();
      } else {
        addToast(res.message || '댓글 등록에 실패했습니다.', 'warning');
      }
    } catch {
      addToast('댓글 등록 중 오류가 발생했습니다.', 'warning');
    }
  };

  // Edit Comment Submit
  const handleCommentUpdateSubmit = async (commentId: number) => {
    if (!editCommentText.trim()) return;
    try {
      const res = await update_comment_api(commentId, {
        content: editCommentText,
        isSecret: editCommentSecret
      });
      if (res.success) {
        addToast('댓글이 수정되었습니다.', 'success');
        setEditingCommentId(null);
        loadComments();
      } else {
        addToast(res.message || '댓글 수정에 실패했습니다.', 'warning');
      }
    } catch {
      addToast('댓글 수정 중 오류가 발생했습니다.', 'warning');
    }
  };

  // Delete comment
  const handleCommentDelete = async (commentId: number) => {
    if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) return;
    try {
      const res = await delete_comment_api(commentId);
      if (res.success) {
        addToast('댓글이 삭제되었습니다.', 'success');
        loadComments();
      } else {
        addToast(res.message || '댓글 삭제에 실패했습니다.', 'warning');
      }
    } catch {
      addToast('댓글 삭제 중 오류가 발생했습니다.', 'warning');
    }
  };

  // Edit Post Submit
  const handlePostUpdateSubmit = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      addToast('제목과 내용을 입력해주세요.', 'warning');
      return;
    }
    try {
      const res = await update_post_api(feed.postId, {
        title: postTitle,
        content: postContent,
        rating: postRating,
        type: (feed.category as string) === 'ALL' ? 'REVIEW' : (feed.category as any)
      });
      if (res.success) {
        addToast('게시글이 성공적으로 수정되었습니다.', 'success');
        setIsEditingPost(false);
        if (onFeedUpdated) {
          onFeedUpdated({
            ...feed,
            location: postTitle,
            content: postContent,
            rating: postRating
          });
        }
      } else {
        addToast(res.message || '게시글 수정에 실패했습니다.', 'warning');
      }
    } catch {
      addToast('게시글 수정 중 오류가 발생했습니다.', 'warning');
    }
  };

  // Delete Post
  const handlePostDelete = async () => {
    if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    try {
      const res = await delete_post_api(feed.postId);
      if (res.success) {
        addToast('게시글이 삭제되었습니다.', 'success');
        if (onFeedDeleted) {
          onFeedDeleted(feed.postId);
        }
        onClose();
      } else {
        addToast(res.message || '게시글 삭제에 실패했습니다.', 'warning');
      }
    } catch {
      addToast('게시글 삭제 중 오류가 발생했습니다.', 'warning');
    }
  };

  // Check if current user is post author
  const getDisplayName = (name: string) => {
    if (!name) return '';
    return name.includes('@') ? name.split('@')[0] : name;
  };
  const isPostAuthor = username && (nickname ? nickname === feed.author : getDisplayName(username) === feed.author);

  return (
    <div 
      className="premium-popup-backdrop"
      style={{ display: 'flex' }}
      onClick={onClose}
    >
      <div 
        className="app-modal select-none animate-[zoomIn_0.25s_ease]" 
        style={{ width: '1050px', maxWidth: '95%', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'row', height: '620px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose} 
          className="absolute top-4 right-4 text-xl text-white hover:scale-110 active:scale-95 transition-all text-shadow-[0_1px_4px_black] z-10 bg-none border-none cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
        
        {/* Left Image Area */}
        <div style={{ flex: 1.1, background: '#000', height: '100%', position: 'relative' }}>
          <img 
            src={feed.img} 
            alt={feed.location} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <span className="feed-tag-badge" style={{ bottom: '20px', left: '20px', fontSize: '0.85rem' }}>
            {getCategoryLabel(feed.category)}
          </span>
        </div>
        
        {/* Right Information Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', height: '100%', background: 'white' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '2rem', flexShrink: 0, userSelect: 'none' }}>
                {getCategoryAvatar(feed.category)}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>{feed.author}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px', fontWeight: 600 }}>
                  <span>{formatDate(feed.date)}</span>
                  {!isEditingPost && <span style={{ color: 'var(--text-dark)', fontWeight: 800 }}>{feed.location} 여행</span>}
                </div>
              </div>
            </div>

            {/* Post Owner Controls */}
            {isPostAuthor && !isEditingPost && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setIsEditingPost(true)}
                  className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all font-bold text-xs"
                >
                  <i className="fa-solid fa-pen-to-square"></i> 수정
                </button>
                <button 
                  onClick={handlePostDelete}
                  className="px-3 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all font-bold text-xs"
                >
                  <i className="fa-solid fa-trash-can"></i> 삭제
                </button>
              </div>
            )}
          </div>
          
          {/* Main Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minHeight: 0 }}>
            {isEditingPost ? (
              /* Post Edit Form */
              <div className="space-y-4 pr-1" style={{ display: 'flex', flexDirection: 'column' }}>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">여행지 / 위치</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">만족도 (1~5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPostRating(num)}
                        className={`text-xl ${num <= postRating ? 'text-[#f5b041]' : 'text-slate-200'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="block text-xs font-bold text-slate-500 mb-1">내용</label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm h-32 resize-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setIsEditingPost(false)}
                    className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handlePostUpdateSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                  >
                    저장 완료
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Mode: Post Content & Comments */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Rating stars inside Detail Modal */}
                <div className="text-[#f5b041] text-[12px] mb-2">
                  {renderStars(feed.rating)}
                </div>

                {/* Scrollable travel story content */}
                <div className="text-slate-700 font-semibold text-sm mb-4 border-b pb-4">
                  {feed.content}
                </div>

                {/* Comments Section */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <h4 className="text-xs font-bold text-slate-600 mb-2">댓글 ({comments.length})</h4>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '0.8rem' }} className="space-y-3 pr-1">
                    {comments.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs font-bold">
                        등록된 댓글이 없습니다.
                      </div>
                    ) : (
                      comments.map((c) => {
                        const isCommentOwner = c.isMine === true;
                        return (
                          <div key={c.commentId} className="bg-slate-50/70 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-700">{c.authorName}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">
                                  {new Date(c.createdAt).toLocaleString('ko-KR', { hour12: false })}
                                </span>
                                {c.isSecret && (
                                  <i className="fa-solid fa-lock text-[10px] text-slate-400" title="비밀 댓글"></i>
                                )}
                                {isCommentOwner && (
                                  <div className="flex gap-1.5 ml-1">
                                    <button
                                      onClick={() => {
                                        setEditingCommentId(c.commentId);
                                        setEditCommentText(c.content);
                                        setEditCommentSecret(c.isSecret);
                                      }}
                                      className="text-blue-500 hover:text-blue-700 text-[10px] bg-none border-none cursor-pointer"
                                    >
                                      수정
                                    </button>
                                    <button
                                      onClick={() => handleCommentDelete(c.commentId)}
                                      className="text-red-500 hover:text-red-700 text-[10px] bg-none border-none cursor-pointer"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {editingCommentId === c.commentId ? (
                              <div className="mt-1 flex flex-col gap-2">
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  className="w-full p-2 border rounded-xl text-xs h-16 resize-none"
                                />
                                <div className="flex justify-between items-center">
                                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={editCommentSecret}
                                      onChange={(e) => setEditCommentSecret(e.target.checked)}
                                    />
                                    비밀 댓글 설정 🔒
                                  </label>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="px-2 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold hover:bg-slate-300"
                                    >
                                      취소
                                    </button>
                                    <button
                                      onClick={() => handleCommentUpdateSubmit(c.commentId)}
                                      className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700"
                                    >
                                      수정 완료
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-600 font-medium whitespace-pre-wrap">{c.content}</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Comment Input */}
                  <form onSubmit={handleCommentSubmit} className="mt-auto pt-2 border-t flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={isLoggedIn ? "따뜻한 댓글을 남겨보세요..." : "댓글을 작성하려면 로그인이 필요합니다."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={!isLoggedIn}
                        className="flex-1 px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!isLoggedIn || !commentText.trim()}
                        className="px-4 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                      >
                        등록
                      </button>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSecretComment}
                          onChange={(e) => setIsSecretComment(e.target.checked)}
                          disabled={!isLoggedIn}
                        />
                        비밀 댓글로 등록하기 🔒
                      </label>
                    </div>
                  </form>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
