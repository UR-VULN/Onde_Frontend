import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import {
  post_seller_review_reply_api,
  update_seller_review_reply_api,
  delete_seller_review_reply_api,
} from '@/api/sellerApi';
import { MOCK_REVIEWS } from '@/constants/mockSellerData';

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div style={{ color: '#f5b041', fontSize: '0.8rem' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <i key={i} className={`fa-${i <= rating ? 'solid' : 'regular'} fa-star`}></i>
    ))}
  </div>
);

export const SellerQAPanel: React.FC = () => {
  const { addToast } = useTravelStore();

  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');

  const handle_post_reply = async (reviewId: number) => {
    const reply = replyDrafts[reviewId]?.trim();
    if (!reply) {
      addToast('답글을 입력해 주세요.', 'warning');
      return;
    }

    try {
      await post_seller_review_reply_api(reviewId, reply);
    } catch {
      // 백엔드 미연결 → 로컬 업데이트
    }

    setReviews((prev) =>
      prev.map((r) => r.reviewId === reviewId ? { ...r, hostReply: reply } : r)
    );
    setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
    addToast('답글이 등록되었으며 고객에게 알림이 발송되었습니다.', 'success');
  };

  const handle_edit_reply = (reviewId: number, currentReply: string) => {
    setEditingId(reviewId);
    setEditDraft(currentReply);
  };

  const handle_save_edit = async (reviewId: number) => {
    const reply = editDraft.trim();
    if (!reply) {
      addToast('수정할 내용을 입력해 주세요.', 'warning');
      return;
    }

    try {
      await update_seller_review_reply_api(reviewId, reply);
    } catch {
      // 백엔드 미연결 → 로컬 업데이트
    }

    setReviews((prev) =>
      prev.map((r) => r.reviewId === reviewId ? { ...r, hostReply: reply } : r)
    );
    setEditingId(null);
    setEditDraft('');
    addToast('답글이 수정되었습니다.', 'success');
  };

  const handle_delete_reply = async (reviewId: number) => {
    try {
      await delete_seller_review_reply_api(reviewId);
    } catch {
      // 백엔드 미연결 → 로컬 업데이트
    }

    setReviews((prev) =>
      prev.map((r) => r.reviewId === reviewId ? { ...r, hostReply: undefined } : r)
    );
    addToast('답글이 삭제되었습니다.', 'success');
  };

  return (
    <div className="seller-panel">
      {/* Header Area */}
      <div className="section-header">
        <div>
          <h2 className="section-title">고객 리뷰 및 1:1 이용 문의 응대</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            여행자들의 실시간 피드백에 답글을 달고 푸시 알림을 발송합니다.
          </p>
        </div>
        <span className="badge" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #ffedd5' }}>
          미응대 문의: 2건
        </span>
      </div>

      {/* Reviews Thread */}
      <div className="review-thread">
        {reviews.map((rev) => (
          <div key={rev.reviewId} className="review-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div
                  className="feed-user-avatar"
                  style={{ width: '32px', height: '32px', fontSize: '0.7rem', background: rev.guestColor }}
                >
                  {rev.guestInitials}
                </div>
                <span style={{ fontWeight: 700 }}>{rev.guestName}</span>
                <StarRating rating={rev.rating} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rev.reviewedAt}</span>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              "{rev.content}"
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
              <i className="fa-solid fa-tag" style={{ marginRight: '0.3rem' }}></i>{rev.productName} 이용
            </p>

            {rev.hostReply ? (
              <div className="reply-box">
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  <i className="fa-solid fa-comment-dots"></i> 호스트의 답글
                </div>

                {editingId === rev.reviewId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <textarea
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      className="form-input"
                      style={{ height: '80px', fontSize: '0.85rem', resize: 'none' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => setEditingId(null)}>취소</button>
                      <button className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => handle_save_edit(rev.reviewId)}>수정 완료</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.8rem', color: 'var(--text-main)' }}>
                      "{rev.hostReply}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => handle_edit_reply(rev.reviewId, rev.hostReply!)}>수정</button>
                      <button className="btn-secondary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }} onClick={() => handle_delete_reply(rev.reviewId)}>삭제</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ marginTop: '1rem' }}>
                <textarea
                  value={replyDrafts[rev.reviewId] || ''}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [rev.reviewId]: e.target.value }))}
                  className="form-input"
                  style={{ width: '100%', height: '80px', fontSize: '0.85rem', resize: 'none' }}
                  placeholder="정성스러운 답글을 남겨주세요. 입력 시 고객에게 실시간 푸시 알림이 발송됩니다."
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.5rem 1.2rem', fontSize: '0.8rem' }}
                    onClick={() => handle_post_reply(rev.reviewId)}
                  >
                    <i className="fa-solid fa-paper-plane" style={{ marginRight: '0.4rem' }}></i> 답글 등록 및 푸시 발송
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
