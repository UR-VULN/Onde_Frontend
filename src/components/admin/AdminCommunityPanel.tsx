import React, { useEffect, useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  get_admin_posts_api,
  delete_admin_post_api,
  blind_admin_post_api,
  restore_admin_post_api,
  type AdminPostDto
} from '@/api/adminApi';
import { cleanImageUrl } from '@/types/feed';

export const AdminCommunityPanel: React.FC = () => {
  const { addToast, openConfirmPopup } = useTravelStore();
  const [posts, setPosts] = useState<AdminPostDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 상세 보기 모달 상태
  const [selectedPost, setSelectedPost] = useState<AdminPostDto | null>(null);
  // 블라인드 사유 입력 모달 상태
  const [blindPostId, setBlindPostId] = useState<number | null>(null);
  const [blindReason, setBlindReason] = useState('');

  const loadPosts = async (currentStatus = statusFilter, currentPage = page) => {
    try {
      const res = await get_admin_posts_api(currentStatus, currentPage, 10);
      if (res.success && res.data) {
        setPosts(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      }
    } catch {
      addToast('여행기 목록을 불러오는 데 실패했습니다.', 'warning');
    }
  };

  useEffect(() => {
    loadPosts(statusFilter, page);
  }, [statusFilter, page]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handlePostDetail = async (postId: number) => {
    try {
      // 목록에 이미 있는 데이터를 먼저 가져와서 모달을 띄우고 디테일을 최신화할 수 있습니다.
      const found = posts.find(p => p.postId === postId);
      if (found) {
        setSelectedPost(found);
      }
    } catch {
      addToast('상세 정보를 가져올 수 없습니다.', 'warning');
    }
  };

  const handleDelete = (postId: number) => {
    openConfirmPopup(async (confirmed) => {
      if (!confirmed) return;
      const res = await delete_admin_post_api(postId);
      if (res.success) {
        addToast('게시글을 정상적으로 강제 삭제 처리했습니다.', 'success');
        setSelectedPost(null);
        loadPosts();
      } else {
        addToast(res.message || '삭제에 실패했습니다.', 'warning');
      }
    }, {
      title: '게시글 강제 삭제',
      description: `선택한 #${postId} 여행기를 영구 삭제(DELETED 상태 변경)하시겠습니까?`,
      yesLabel: '삭제',
      noLabel: '취소'
    });
  };

  const handleBlindSubmit = async () => {
    if (!blindPostId) return;
    if (!blindReason.trim()) {
      addToast('블라인드 사유를 입력해주세요.', 'warning');
      return;
    }
    const res = await blind_admin_post_api(blindPostId, blindReason);
    if (res.success) {
      addToast('게시글을 블라인드 처리하고 작성자에게 알림을 발송했습니다.', 'success');
      setBlindPostId(null);
      setBlindReason('');
      setSelectedPost(null);
      loadPosts();
    } else {
      addToast(res.message || '블라인드 처리에 실패했습니다.', 'warning');
    }
  };

  const handleRestore = (postId: number) => {
    openConfirmPopup(async (confirmed) => {
      if (!confirmed) return;
      const res = await restore_admin_post_api(postId);
      if (res.success) {
        addToast('게시글을 정상 복구하고 작성자에게 알림을 발송했습니다.', 'success');
        setSelectedPost(null);
        loadPosts();
      } else {
        addToast(res.message || '복구 처리에 실패했습니다.', 'warning');
      }
    }, {
      title: '게시글 복구',
      description: `블라인드 상태인 #${postId} 여행기를 복구(ACTIVE 상태 변경)하시겠습니까?`,
      yesLabel: '복구',
      noLabel: '취소'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'status-active';
      case 'BLINDED':
        return 'status-pending';
      case 'DELETED':
        return 'status-rejected';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="admin-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">전사 여행기(커뮤니티) 통합 관리</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            사용자들이 작성한 여행 피드 목록을 모니터링하고, 블라인드 처리 및 강제 삭제할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="data-table-container">
        {/* 필터 헤더 */}
        <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h4 style={{ fontWeight: 700 }}>
            <i className="fa-solid fa-square-rss" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
            등록된 여행기 목록 ({totalElements}건)
          </h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>상태 필터:</span>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="form-input"
              style={{ width: 140, padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">전체보기</option>
              <option value="ACTIVE">활성 (ACTIVE)</option>
              <option value="BLINDED">블라인드 (BLINDED)</option>
              <option value="DELETED">삭제됨 (DELETED)</option>
            </select>
          </div>
        </div>

        {/* 테이블 */}
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>테마 카테고리</th>
              <th>제목 (장소)</th>
              <th>작성자</th>
              <th>평점</th>
              <th className="text-center">상태</th>
              <th className="text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, idx) => (
              <tr key={post.postId ? `admin-post-${post.postId}` : `admin-post-idx-${idx}`}>
                <td className="font-black">#{post.postId}</td>
                <td>
                  <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem' }}>
                    {post.type}
                  </span>
                </td>
                <td className="font-semibold cursor-pointer text-primary hover:underline" onClick={() => handlePostDetail(post.postId)}>
                  {post.title}
                </td>
                <td className="font-semibold">{post.authorName || `User-${post.postId}`}</td>
                <td className="font-black text-amber-500">★ {post.rating}</td>
                <td className="text-center">
                  <span className={`status-badge ${getStatusBadgeClass(post.status)}`}>
                    {post.status}
                  </span>
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    className="btn-secondary text-[11px] py-1 px-3"
                    onClick={() => handlePostDetail(post.postId)}
                  >
                    상세 및 제어
                  </button>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400 font-bold">
                  등록된 여행기 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* 페이징 */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem 0' }}>
            <button
              type="button"
              disabled={page === 0}
              className="btn-secondary text-[11px] py-1 px-3"
              onClick={() => setPage(p => Math.max(0, p - 1))}
            >
              이전
            </button>
            <span style={{ alignSelf: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1}
              className="btn-secondary text-[11px] py-1 px-3"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 1. 여행기 상세 및 권한 제어 모달 */}
      {selectedPost && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', borderRadius: '1.5rem', width: '90%', maxWidth: '600px', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="badge" style={{ background: '#e6f0ff', color: 'var(--primary)', fontWeight: 800 }}>
                {selectedPost.type}
              </span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}
                onClick={() => setSelectedPost(null)}
              >
                &times;
              </button>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>{selectedPost.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                작성자: {selectedPost.authorName} | 작성일: {selectedPost.createdAt?.replace('T', ' ')}
              </p>
            </div>

            {selectedPost.imageUrls && selectedPost.imageUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {selectedPost.imageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={cleanImageUrl(url)}
                    alt="여행 이미지"
                    style={{ height: '140px', borderRadius: '12px', objectFit: 'cover' }}
                  />
                ))}
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', minHeight: '80px', whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>
              {selectedPost.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className={`status-badge ${getStatusBadgeClass(selectedPost.status)}`}>
                현재 상태: {selectedPost.status}
              </span>
              <span className="font-bold text-amber-500">★ {selectedPost.rating} / 5.0</span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem' }}>
              {/* 복구 기능은 SUPER_ADMIN 및 USER_ADMIN 가능 */}
              {selectedPost.status === 'BLINDED' && (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ background: '#10b981', flex: 1 }}
                  onClick={() => handleRestore(selectedPost.postId)}
                >
                  게시글 복구
                </button>
              )}

              {selectedPost.status === 'ACTIVE' && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ color: '#d97706', border: '1px solid #f59e0b', background: '#fffbeb', flex: 1 }}
                  onClick={() => {
                    setBlindPostId(selectedPost.postId);
                    setBlindReason('');
                  }}
                >
                  블라인드 처리
                </button>
              )}

              {selectedPost.status !== 'DELETED' && (
                <button
                  type="button"
                  className="btn-secondary text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100"
                  style={{ flex: 1 }}
                  onClick={() => handleDelete(selectedPost.postId)}
                >
                  강제 삭제
                </button>
              )}

              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 0.5 }}
                onClick={() => setSelectedPost(null)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. 블라인드 사유 입력 팝업 모달 */}
      {blindPostId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', borderRadius: '1.25rem', width: '90%', maxWidth: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>게시글 블라인드 사유 입력</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              블라인드 사유는 작성한 회원에게 푸시 알림으로 전송됩니다.
            </p>
            <textarea
              className="form-input"
              style={{ width: '100%', height: '80px', padding: '0.5rem', fontSize: '0.85rem' }}
              placeholder="예: 부적절한 광고성 홍보 글입니다."
              value={blindReason}
              onChange={(e) => setBlindReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ background: '#f59e0b', flex: 1 }}
                onClick={handleBlindSubmit}
              >
                확인
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setBlindPostId(null)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
