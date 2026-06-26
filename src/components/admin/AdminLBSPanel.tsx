import React, { useState } from 'react';
import { useTravelStore } from '@/store/useTravelStore';
import { ComingSoonBlock } from '@/components/common/ComingSoonBlock';
import { deploy_property_marker_api } from '@/api/adminApi';
import { canDeployLbsMarkers } from '@/utils/adminPermissions';
import { extractApiErrorMessage } from '@/utils/apiResponse';

export const AdminLBSPanel: React.FC = () => {
  const { addToast, memberRole } = useTravelStore();
  const canDeploy = canDeployLbsMarkers(memberRole);

  const [markerName, setMarkerName] = useState('서울 한남 더 테라스');
  const [latitude, setLatitude] = useState('37.5344');
  const [longitude, setLongitude] = useState('127.0026');

  const handle_deploy_marker = async () => {
    if (!markerName.trim() || !latitude || !longitude) {
      addToast('마커 명칭, 위도, 경도를 모두 입력해 주세요.', 'warning');
      return;
    }
    try {
      const res = await deploy_property_marker_api({
        name: markerName.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        category: 'ATTRACTION',
      });
      if (res.success) {
        addToast(`'${markerName}' 마커가 LBS에 배포되었습니다.`, 'success');
      } else {
        addToast(res.message || '마커 배포에 실패했습니다.', 'warning');
      }
    } catch (err: unknown) {
      addToast(extractApiErrorMessage(err, '마커 배포 중 오류가 발생했습니다.'), 'warning');
    }
  };

  return (
    <div className="admin-panel">
      <div className="section-header">
        <div>
          <h2 className="section-title">LBS 마커 및 알림 에디터</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            지도 마커 수동 매핑 및 시스템 자동 안내 메일 템플릿 관리
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="wizard-container">
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-map-location-dot" style={{ color: 'var(--primary)', marginRight: '0.5rem' }}></i>
            LBS 가이드 마커 매핑
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

          {canDeploy ? (
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem' }}
              onClick={handle_deploy_marker}
            >
              <i className="fa-solid fa-location-dot" style={{ marginRight: '0.4rem' }}></i>
              관광지 마커 실시간 배포
            </button>
          ) : (
            <p
              className="text-[11px] font-bold text-slate-400 text-center py-3 mb-4"
              style={{ background: 'var(--bg-light)', borderRadius: 'var(--radius-md)' }}
            >
              LBS 마커 배포는 최고 관리자(SUPER_ADMIN)만 이용할 수 있습니다.
            </p>
          )}

          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '1rem',
              }}
            >
              커뮤니티 유해물 모니터링
            </p>
            <ComingSoonBlock
              title="신고 게시글 목록"
              description="신고된 게시글 조회 API가 준비되면 이 영역에서 목록 확인 및 블라인드 처리가 가능합니다."
              iconClass="fa-solid fa-flag"
              minHeight="160px"
            />
          </div>
        </div>

        <div className="wizard-container">
          <h4 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>
            <i className="fa-solid fa-envelope-open-text" style={{ color: '#f59e0b', marginRight: '0.5rem' }}></i>
            자동 안내 메일 빌더
          </h4>
          <ComingSoonBlock
            title="메일 템플릿 배포"
            description="HTML 템플릿 저장·배포 API가 준비되면 예약/결제/취소 등 자동 메일을 편집·배포할 수 있습니다."
            iconClass="fa-solid fa-envelope"
            minHeight="360px"
          />
        </div>
      </div>
    </div>
  );
};
