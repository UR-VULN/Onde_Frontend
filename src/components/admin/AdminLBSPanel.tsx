import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';

const MAIL_TEMPLATES = [
  { id: 'booking', label: '[공통] 예약 확인서 HTML 자동 발송 폼' },
  { id: 'receipt', label: '[영수증] 발권 완료 자동 빌드 PDF 영수증' },
  { id: 'notice',  label: '[공지] 서비스 점검 안내 푸시 템플릿' },
];

const DEFAULT_HTML = `<div style="font-family:'Pretendard'; max-width:600px; margin:0 auto; padding:40px; border:1px solid #eee;">
  <h2 style="color:#005ce6;">ONDE 예약 성공 안내</h2>
  <p>안녕하세요, <strong>{{userName}}</strong> 고객님!</p>
  <p>온데를 통해 예약하신 <strong>{{productName}}</strong> 상품의 결제가 정상적으로 완료되었습니다.</p>
  <hr style="border:0; border-top:1px solid #eee; margin:20px 0;">
  <ul style="list-style:none; padding:0;">
    <li>- 예약 번호: {{bookingCode}}</li>
    <li>- 일정: {{dateRange}}</li>
  </ul>
  <p style="font-size:12px; color:#999; margin-top:30px;">본 메일은 발신전용입니다.</p>
</div>`;

const REPORTED_POSTS = [
  { id: 1, content: '부적절한 광고성 댓글 (스팸 의심)', reportedAt: '2026-05-28 09:12', isBlinded: false },
  { id: 2, content: '욕설 포함 의심 게시글 (S3 봇 감지)', reportedAt: '2026-05-28 08:45', isBlinded: false },
];

export const AdminLBSPanel: React.FC = () => {
  const { addToast } = useTravelStore();

  const [markerName, setMarkerName] = useState('도쿄 신주쿠 스시로타운');
  const [latitude, setLatitude] = useState('35.6905');
  const [longitude, setLongitude] = useState('139.7001');
  const [selectedTemplate, setSelectedTemplate] = useState('booking');
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [posts, setPosts] = useState(REPORTED_POSTS);

  const handle_deploy_marker = () => {
    if (!markerName.trim() || !latitude || !longitude) {
      addToast('마커 명칭, 위도, 경도를 모두 입력해 주세요.', 'warning');
      return;
    }
    addToast(`'${markerName}' 마커가 플랫폼 LBS 인덱스 서버에 즉시 배포 완료되었습니다.`, 'success');
  };

  const handle_deploy_template = () => {
    addToast('HTML 알림 템플릿이 전사 이벤트 버스에 무중단 적용 배포되었습니다.', 'success');
  };

  const handle_blind_post = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => p.id === postId ? { ...p, isBlinded: true } : p)
    );
    addToast(`신고 게시글 #${postId}이 블라인드 처리 완료되었습니다.`, 'success');
  };

  return (
    <div className="admin-panel">
      {/* Header Area */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <i className="fa-solid fa-location-crosshairs" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
            LBS 마커 및 알림 에디터
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            지도 마커 수동 매핑 및 시스템 자동 안내 메일 템플릿 실시간 배포 관리 <span style={{ fontSize: '0.8rem' }}>(E팀 전용)</span>
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* LBS Mapping Card */}
        <div className="wizard-container">
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-map-location-dot" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i> LBS 가이드 마커 매핑
          </h4>

          <div className="form-group">
            <label className="form-label">관광지/맛집 공식 명칭</label>
            <input
              type="text"
              value={markerName}
              onChange={(e) => setMarkerName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">위도 (Latitude)</label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">경도 (Longitude)</label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem' }}
            onClick={handle_deploy_marker}
          >
            <i className="fa-solid fa-location-dot" style={{ marginRight: '0.4rem' }}></i> 관광지 마커 실시간 배포
          </button>

          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
              커뮤니티 유해물 모니터링
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: post.isBlinded ? '1px solid var(--border-color)' : '1px solid rgba(255, 90, 95, 0.2)',
                    background: post.isBlinded ? 'var(--bg-light)' : 'rgba(255, 90, 95, 0.04)',
                    padding: '0.8rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    opacity: post.isBlinded ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{post.content}</p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{post.reportedAt}</p>
                  </div>
                  {post.isBlinded ? (
                    <span className="status-badge status-approved">처리완료</span>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', background: 'var(--secondary)' }}
                      onClick={() => handle_blind_post(post.id)}
                    >BLIND</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mail Builder Card */}
        <div className="wizard-container" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-envelope-open-text" style={{ color: '#f59e0b', marginRight: '0.5rem' }}></i> 자동 안내 메일 빌더
          </h4>

          <div className="form-group">
            <label className="form-label">이벤트 템플릿 선택</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="form-input"
            >
              {MAIL_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label className="form-label">HTML / Handlebars 에디터</label>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              style={{
                flex: 1,
                width: '100%',
                background: '#1e1e1e',
                border: '1px solid #333',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                color: '#6ee7b7',
                lineHeight: 1.6,
                minHeight: '280px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', padding: '0.8rem', marginTop: '1rem', background: '#1e293b', border: 'none' }}
            onClick={handle_deploy_template}
          >
            <i className="fa-solid fa-rocket" style={{ marginRight: '0.4rem' }}></i> HTML 템플릿 전사 무중단 배포
          </button>
        </div>
      </div>
    </div>
  );
};
