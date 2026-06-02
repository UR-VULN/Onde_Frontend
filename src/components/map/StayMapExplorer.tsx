import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetch_properties_in_bounds_api } from '@/api/propertiesApi';
import { mapStayToStayDto } from '@/api/stayApi';
import type { MapStayItem } from '@/types/mapStay';
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MAP_SEARCH_DEBOUNCE_MS,
  MAP_VIEWPORT_MARKER_LIMIT,
} from '@/constants/mapConfig';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  boundsFromLeaflet,
  filterStaysByQuery,
  filterStaysInBounds,
  type MapBounds,
} from '@/utils/mapStayFilters';
import { propertyMarkerToMapStay } from '@/utils/mapPropertyMarkers';
import { StayMapList } from '@/components/map/StayMapList';
import { StayDetailModal } from '@/components/stay/StayDetailModal';
import { formatKrwPrice, hasDisplayPrice, hasDisplayRating } from '@/utils/listingDisplay';

function createStayIcon(isSelected: boolean): L.DivIcon {
  return L.divIcon({
    className: 'onde-map-marker-wrap',
    html: `<span class="onde-map-marker${isSelected ? ' is-selected' : ''}"><i class="fa-solid fa-hotel"></i></span>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: MapBounds) => void }) {
  const map = useMap();

  useEffect(() => {
    onBoundsChange(boundsFromLeaflet(map.getBounds()));
  }, [map, onBoundsChange]);

  useMapEvents({
    moveend: () => onBoundsChange(boundsFromLeaflet(map.getBounds())),
    zoomend: () => onBoundsChange(boundsFromLeaflet(map.getBounds())),
  });

  return null;
}

function MapFlyToTarget({
  target,
}: {
  target: { latitude: number; longitude: number; zoom?: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.latitude, target.longitude], target.zoom ?? Math.max(map.getZoom(), 13), {
      duration: 0.55,
    });
  }, [map, target?.latitude, target?.longitude, target?.zoom]);

  return null;
}

interface StayMapExplorerProps {
  searchQuery: string;
}

export const StayMapExplorer: React.FC<StayMapExplorerProps> = ({ searchQuery }) => {
  const debouncedQuery = useDebouncedValue(searchQuery, MAP_SEARCH_DEBOUNCE_MS);
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const apiBounds = useDebouncedValue(bounds, MAP_SEARCH_DEBOUNCE_MS);
  const [mapStays, setMapStays] = useState<MapStayItem[]>([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ latitude: number; longitude: number; zoom?: number } | null>(
    null
  );
  const [detailStay, setDetailStay] = useState<MapStayItem | null>(null);

  const handleBoundsChange = useCallback((next: MapBounds) => {
    setBounds(next);
  }, []);

  useEffect(() => {
    if (!apiBounds) return;
    let cancelled = false;
    (async () => {
      setLoadingMap(true);
      try {
        const res = await fetch_properties_in_bounds_api({
          swLat: apiBounds.south,
          swLng: apiBounds.west,
          neLat: apiBounds.north,
          neLng: apiBounds.east,
        });
        if (cancelled || !res.success || !res.data) return;
        const stays = res.data.properties
          .map(propertyMarkerToMapStay)
          .filter((s): s is MapStayItem => s != null);
        setMapStays(stays);
      } catch {
        if (!cancelled) setMapStays([]);
      } finally {
        if (!cancelled) setLoadingMap(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBounds?.south, apiBounds?.north, apiBounds?.west, apiBounds?.east]);

  const queryFiltered = useMemo(
    () => filterStaysByQuery(mapStays, debouncedQuery),
    [mapStays, debouncedQuery]
  );

  const visibleStays = useMemo(() => {
    const inView = filterStaysInBounds(queryFiltered, bounds);
    return inView.slice(0, MAP_VIEWPORT_MARKER_LIMIT);
  }, [queryFiltered, bounds]);

  const handleSelectStay = useCallback((stay: MapStayItem) => {
    setSelectedId(stay.id);
    setFlyTarget({ latitude: stay.latitude, longitude: stay.longitude, zoom: 14 });
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) return;
    if (queryFiltered.length === 0) return;
    const first = queryFiltered[0];
    setFlyTarget({ latitude: first.latitude, longitude: first.longitude, zoom: 12 });
  }, [debouncedQuery, queryFiltered]);

  const selectedStay = useMemo(
    () => visibleStays.find((s) => s.id === selectedId) ?? queryFiltered.find((s) => s.id === selectedId) ?? null,
    [visibleStays, queryFiltered, selectedId]
  );

  return (
    <>
      <div className="map-explorer">
        <aside className="map-list">
          <h4 className="map-list-title">
            <i className="fa-solid fa-map-pin"></i>
            주변 숙소{' '}
            <span className="map-list-count">
              ({visibleStays.length}
              {loadingMap ? ' · 조회 중' : ''})
            </span>
          </h4>
          <p className="map-list-hint">지도 이동 시 현재 화면 안 숙소만 표시합니다.</p>
          <StayMapList
            stays={visibleStays}
            selectedId={selectedId}
            onSelect={handleSelectStay}
            onDetail={setDetailStay}
          />
        </aside>

        <div className="map-view">
          <MapContainer
            center={[DEFAULT_MAP_CENTER.latitude, DEFAULT_MAP_CENTER.longitude]}
            zoom={DEFAULT_MAP_ZOOM}
            className="map-canvas"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapBoundsTracker onBoundsChange={handleBoundsChange} />
            <MapFlyToTarget target={flyTarget} />
            {visibleStays.map((stay) => (
              <Marker
                key={stay.id}
                position={[stay.latitude, stay.longitude]}
                icon={createStayIcon(selectedId === stay.id)}
                eventHandlers={{
                  click: () => handleSelectStay(stay),
                }}
              />
            ))}
          </MapContainer>
          {selectedStay && (
            <div className="map-floating-card">
              <strong>{selectedStay.title}</strong>
              <span>
                {[
                  hasDisplayPrice(selectedStay.pricePerNight) &&
                    `${formatKrwPrice(selectedStay.pricePerNight!)} / 박`,
                  hasDisplayRating(selectedStay.rating) && `★ ${selectedStay.rating}`,
                ]
                  .filter(Boolean)
                  .join(' · ') || '—'}
              </span>
            </div>
          )}
        </div>
      </div>

      {detailStay && (
        <StayDetailModal
          stay={mapStayToStayDto(detailStay)}
          roomId={detailStay.roomId}
          soldOutDays={detailStay.soldOutDays}
          onClose={() => setDetailStay(null)}
        />
      )}
    </>
  );
};
