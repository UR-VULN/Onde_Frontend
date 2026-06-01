import React from 'react';
import { ComingSoonBlock } from '@/components/common/ComingSoonBlock';

export const SellerQAPanel: React.FC = () => {
  return (
    <div className="seller-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">고객 리뷰 및 1:1 이용 문의 응대</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            고객 리뷰 조회·답글 등록 기능은 현재 준비 중입니다.
          </p>
        </div>
      </div>
      <ComingSoonBlock
        title="판매자 리뷰 · Q&A"
        description="고객 리뷰 목록, 호스트 답글 CRUD API가 준비되면 이 화면에서 응대할 수 있습니다."
        iconClass="fa-solid fa-comments"
        minHeight="320px"
      />
    </div>
  );
};
