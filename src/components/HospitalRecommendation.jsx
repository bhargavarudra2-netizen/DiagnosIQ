import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Phone, Star, AlertCircle, Navigation,
  ExternalLink, Building2, Zap, RefreshCw, LocateFixed, ShieldAlert
} from 'lucide-react';
import { getHospitalsForReport, buildDirectionsUrl } from '../services/hospitalService';

/* ══════════════════════════════════════════════════════════
   HOSPITAL RECOMMENDATION PANEL — Dark Theme
   ══════════════════════════════════════════════════════════ */

// ── Star Rating ──────────────────────────────────────────────
function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-2.5 w-2.5 ${
            i <= full
              ? 'text-amber-400 fill-amber-400'
              : i === full + 1 && half
              ? 'text-amber-300 fill-amber-300'
              : 'text-slate-700'
          }`}
        />
      ))}
      <span className="text-[10px] font-bold text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Hospital card ───────────────────────────────────────────
function HospitalCard({ hospital, userLocation, index, riskLevel }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80 + 50);
    return () => clearTimeout(t);
  }, [index]);

  const directionsUrl = buildDirectionsUrl(hospital, userLocation);
  const isEmergency = hospital.emergency;
  const isCritical = riskLevel === 'critical' || riskLevel === 'high';

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${
        isEmergency && isCritical
          ? 'bg-diag-redSoft/5 border-diag-red/20'
          : 'bg-white/[0.01] border-white/5 hover:border-diag-cyan/20 hover:bg-diag-cyan/[0.01]'
      }`}
      style={{
        boxShadow: isEmergency && isCritical
          ? '0 0 16px rgba(239,68,68,0.02)'
          : '0 4px 12px rgba(0,0,0,0.2)',
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <div
            className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 border ${
              isEmergency && isCritical
                ? 'bg-diag-redSoft border-diag-red/25 text-diag-red'
                : 'bg-diag-cyan/5 border-diag-cyan/15 text-diag-cyan'
            }`}
          >
            {isEmergency && isCritical ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className="text-xs font-bold text-slate-200 leading-snug truncate"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              {hospital.name}
            </h4>
            <p className="text-[9px] text-slate-500 font-semibold">{hospital.type}</p>
          </div>
        </div>

        {isEmergency && (
          <div className="flex items-center gap-1 shrink-0 bg-diag-redSoft/10 px-2 py-0.5 rounded border border-diag-red/25">
            <span className="h-1 w-1 rounded-full bg-diag-red animate-pulse" />
            <span className="text-[8px] font-bold text-diag-red uppercase tracking-wider">
              24/7 ER
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 mb-2.5">
        <div className="flex items-center gap-1 bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
          <Navigation className="h-2.5 w-2.5 text-diag-cyan" />
          <span className="text-[9px] font-bold text-diag-cyan font-mono">
            {hospital.distance.toFixed(1)} km
          </span>
        </div>
        <StarRating rating={hospital.rating} />
      </div>

      {/* Address */}
      <div className="flex items-start gap-1.5 mb-3">
        <MapPin className="h-2.5 w-2.5 text-slate-500 mt-0.5 shrink-0" />
        <span className="text-[9.5px] text-slate-400 leading-snug truncate w-full">{hospital.address}</span>
      </div>

      {/* Button link */}
      <div className="flex gap-1.5">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
            isEmergency && isCritical
              ? 'bg-diag-red hover:bg-red-600 text-white shadow-md'
              : 'bg-diag-cyan hover:bg-diag-cyanHover text-diag-navy font-bold'
          }`}
        >
          <ExternalLink className="h-2.5 w-2.5" />
          Get Directions
        </a>
        {hospital.phone && hospital.phone !== 'N/A' && (
          <a
            href={`tel:${hospital.phone}`}
            className="flex items-center justify-center px-2 py-1.5 rounded-xl bg-white/5 border border-white/5 hover:border-diag-emerald/30 hover:bg-diag-emeraldSoft/5 text-slate-400 hover:text-diag-emerald transition-all"
            title={`Call ${hospital.phone}`}
          >
            <Phone className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Leaflet Dark Map ─────────────────────────────────────────
function HospitalMap({ hospitals, userLocation }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || hospitals.length === 0) return;
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted) return;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapInstance.current) {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
      } else {
        const centerLat = userLocation?.lat ?? hospitals[0].coordinates.lat;
        const centerLng = userLocation?.lng ?? hospitals[0].coordinates.lng;

        mapInstance.current = L.map(mapRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
        });

        // 1. High-fidelity ESRI World Imagery base satellite imagery layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri'
        }).addTo(mapInstance.current);

        // 2. High-fidelity ESRI World Transportation streets hybrid overlay
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          opacity: 0.6
        }).addTo(mapInstance.current);
      }

      // User location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="width:12px;height:12px;border-radius:50%;background:#38BDF8;border:2px solid #070B14;box-shadow:0 0 0 3px rgba(56,189,248,0.25);"></div>`,
          className: '',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(mapInstance.current)
          .bindPopup('<b style="font-size:10px;color:#070B14">📍 Your Location</b>');
        markersRef.current.push(userMarker);
      }

      // Hospital markers
      hospitals.forEach((h) => {
        const hospitalIcon = L.divIcon({
          html: `<div style="width:18px;height:18px;border-radius:50%;background:${h.emergency ? '#EF4444' : '#38BDF8'};border:1.5px solid #070B14;box-shadow:0 0 0 2px ${h.emergency ? 'rgba(239,68,68,0.2)' : 'rgba(56,189,248,0.2)'};display:flex;align-items:center;justify-content:center;font-size:8px;">🏥</div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = L.marker([h.coordinates.lat, h.coordinates.lng], { icon: hospitalIcon })
          .addTo(mapInstance.current)
          .bindPopup(
            `<div style="font-size:10px;font-family:system-ui;color:#070B14">
              <b>${h.name}</b><br>
              ${h.distance.toFixed(1)} km away<br>
              ${h.emergency ? '<span style="color:#EF4444;font-weight:bold">🚨 24/7 Emergency</span>' : h.type}
            </div>`
          );
        markersRef.current.push(marker);
      });

      const allCoords = [
        ...(userLocation ? [[userLocation.lat, userLocation.lng]] : []),
        ...hospitals.map((h) => [h.coordinates.lat, h.coordinates.lng]),
      ];
      if (allCoords.length > 1) {
        mapInstance.current.fitBounds(allCoords, { padding: [16, 16] });
      }
    });

    return () => {
      isMounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [hospitals, userLocation]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: 280 }}
    />
  );
}

// ── Hospital Skeleton ────────────────────────────────────────
function HospitalSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-2xl p-4 border border-white/5 bg-white/[0.01]">
          <div className="flex gap-3 mb-3">
            <div className="h-8 w-8 rounded-xl bg-white/5" />
            <div className="flex-1">
              <div className="h-3 bg-white/5 rounded-full w-3/4 mb-1.5" />
              <div className="h-2.5 bg-white/5 rounded-full w-1/2" />
            </div>
          </div>
          <div className="h-2 bg-white/5 rounded-full w-full mb-2" />
          <div className="h-6 bg-white/5 rounded-xl w-full mt-2.5" />
        </div>
      ))}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function HospitalRecommendation({ riskLevel = 'low', forceShow = false }) {
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [visible, setVisible] = useState(false);

  const shouldShow = forceShow || ['critical', 'high', 'medium'].includes(riskLevel);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getHospitalsForReport(riskLevel);
      setHospitals(result.hospitals);
      setUserLocation(result.userLocation);
      setIsLive(result.isLive);
    } catch (err) {
      setError('Unable to load hospital data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [riskLevel]);

  useEffect(() => {
    if (!shouldShow) return;
    load();
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, [shouldShow, load]);

  if (!shouldShow) return null;

  const isCritical = riskLevel === 'critical';
  const isHigh = riskLevel === 'high';

  return (
    <div
      className={`rounded-2xl overflow-hidden border border-white/5 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      {/* Header bar */}
      <div
        className="px-5 py-3.5 flex items-center justify-between border-b border-white/5"
        style={{
          background: isCritical
            ? 'linear-gradient(90deg, #270E10 0%, #150809 100%)'
            : isHigh
            ? 'linear-gradient(90deg, #2A1709 0%, #170C04 100%)'
            : 'linear-gradient(90deg, #091A2A 0%, #050E17 100%)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            {(isCritical || isHigh) && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: isCritical ? 'rgba(239,68,68,0.25)' : 'rgba(249,115,22,0.2)' }}
              />
            )}
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center relative z-10 text-white text-sm"
              style={{ background: isCritical ? '#EF4444' : isHigh ? '#F97316' : '#38BDF8' }}
            >
              {isCritical ? '🚨' : isHigh ? '⚠️' : '🏥'}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-100" style={{ fontFamily: 'Geist, sans-serif' }}>
              {isCritical
                ? 'Emergency Trauma Facilities Nearby'
                : isHigh
                ? 'Clinical Specialist Centers Nearby'
                : 'Medical Recommendation Centers'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isLive ? (
                <>
                  <div className="h-1 w-1 rounded-full bg-diag-emerald" />
                  <span className="text-diag-emerald text-[9px] font-bold uppercase tracking-widest">
                    GPS Active · Verified Live
                  </span>
                </>
              ) : (
                <>
                  <div className="h-1 w-1 rounded-full bg-diag-amber" />
                  <span className="text-diag-amber text-[9px] font-bold uppercase tracking-widest">
                    GPS Inactive · Pre-seeded List
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Map controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowMap(s => !s)}
            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] font-semibold text-slate-300 hover:text-white transition-all border border-white/5 flex items-center gap-1"
          >
            <MapPin className="h-2.5 w-2.5" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          <button
            onClick={load}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5"
            title="Refresh list"
          >
            <RefreshCw className="h-2.5 w-2.5" />
          </button>
        </div>
      </div>

      {/* Critical Alert Warning */}
      {isCritical && (
        <div className="px-5 py-2.5 flex items-center gap-2 bg-diag-redSoft/5 border-b border-white/5">
          <AlertCircle className="h-3.5 w-3.5 text-diag-red shrink-0" />
          <p className="text-[10px] font-bold text-diag-red uppercase tracking-wider">
            Critical deviation values detected. Immediate emergency medical consultation is recommended.
          </p>
        </div>
      )}

      {/* Panel Body */}
      <div className="p-5 bg-white/[0.01]">
        {loading ? (
          <HospitalSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-2 py-6 text-slate-400">
            <AlertCircle className="h-5 w-5 text-diag-red" />
            <span className="text-xs">{error}</span>
            <button onClick={load} className="text-diag-cyan hover:underline text-xs font-bold uppercase tracking-wider">
              Retry
            </button>
          </div>
        ) : (
          <div className={`${showMap ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : ''}`}>
            
            {/* List columns */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <LocateFixed className="h-3 w-3 text-slate-500" />
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  {isLive ? 'Sorted chronologically by nearest distance' : 'Mocking geo-coordinates near your city'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {hospitals.slice(0, showMap ? 4 : 6).map((h, i) => (
                  <HospitalCard
                    key={h.id}
                    hospital={h}
                    userLocation={userLocation}
                    index={i}
                    riskLevel={riskLevel}
                  />
                ))}
              </div>
            </div>

            {/* Map column */}
            {showMap && (
              <div className="rounded-xl overflow-hidden border border-white/5 min-h-[300px] shadow-2xl relative">
                <HospitalMap hospitals={hospitals} userLocation={userLocation} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 border-t border-white/5 bg-slate-950/20 flex items-center justify-between flex-wrap gap-2 text-[9px] text-slate-500 font-medium">
        <span className="flex items-center gap-1.5">
          <Zap className="h-3 w-3" />
          Map Engine: OpenStreetMap · Triage Coordinates: DiagnosIQ GPS Services
        </span>
        <span>{hospitals.length} facilities verified</span>
      </div>
    </div>
  );
}
