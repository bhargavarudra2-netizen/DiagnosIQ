import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Phone, Star, AlertCircle, Navigation,
  ExternalLink, Building2, Zap, RefreshCw, LocateFixed, ShieldAlert
} from 'lucide-react';
import { getHospitalsForReport, buildDirectionsUrl } from '../services/hospitalService';

/* ══════════════════════════════════════════════════════════
   HOSPITAL RECOMMENDATION PANEL
   ══════════════════════════════════════════════════════════ */

// ── Star Rating renderer ────────────────────────────────────
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
              : 'text-slate-300'
          }`}
        />
      ))}
      <span className="text-[10px] font-bold text-slate-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

// ── Individual Hospital Card ─────────────────────────────────
function HospitalCard({ hospital, userLocation, index, riskLevel }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 100 + 50);
    return () => clearTimeout(t);
  }, [index]);

  const directionsUrl = buildDirectionsUrl(hospital, userLocation);
  const isEmergency = hospital.emergency;
  const isCritical = riskLevel === 'critical' || riskLevel === 'high';

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      } ${
        isEmergency && isCritical
          ? 'bg-red-50 border-red-200 hover:border-red-300'
          : 'bg-white border-slate-200 hover:border-blue-200 hover:bg-blue-50/30'
      }`}
      style={{
        boxShadow: isEmergency && isCritical
          ? '0 0 0 1px rgba(239,68,68,0.1), 0 4px 16px rgba(239,68,68,0.06)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        transitionProperty: 'opacity, transform',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Hospital icon */}
          <div
            className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
              isEmergency && isCritical
                ? 'bg-red-100 border border-red-200'
                : 'bg-blue-50 border border-blue-100'
            }`}
          >
            {isEmergency && isCritical ? (
              <ShieldAlert className="h-4 w-4 text-red-500" />
            ) : (
              <Building2 className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4
              className="text-xs font-bold text-slate-800 leading-snug truncate"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {hospital.name}
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">{hospital.type}</p>
          </div>
        </div>

        {/* Emergency badge */}
        {isEmergency && (
          <div className="flex items-center gap-1 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[9px] font-black text-red-600 uppercase tracking-wider">
              24/7 ER
            </span>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          <Navigation className="h-2.5 w-2.5 text-blue-500" />
          <span className="text-[10px] font-bold text-blue-600">
            {hospital.distance.toFixed(1)} km
          </span>
        </div>
        <StarRating rating={hospital.rating} />
      </div>

      {/* Address */}
      <div className="flex items-start gap-1.5 mb-3">
        <MapPin className="h-2.5 w-2.5 text-slate-400 mt-0.5 shrink-0" />
        <span className="text-[10px] text-slate-400 leading-snug">{hospital.address}</span>
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
            isEmergency && isCritical
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <ExternalLink className="h-2.5 w-2.5" />
          Get Directions
        </a>
        {hospital.phone && hospital.phone !== 'N/A' && (
          <a
            href={`tel:${hospital.phone}`}
            className="flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all"
            title={`Call ${hospital.phone}`}
          >
            <Phone className="h-2.5 w-2.5" />
          </a>
        )}
      </div>
    </div>
  );
}

// ── Leaflet Map Component ────────────────────────────────────
function HospitalMap({ hospitals, userLocation }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || hospitals.length === 0) return;

    // Lazy-load Leaflet
    import('leaflet').then((L) => {
      // Fix Leaflet default icon path issue in Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapInstance.current) {
        // Clean up old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
      } else {
        // Init map
        const centerLat = userLocation?.lat ?? hospitals[0].coordinates.lat;
        const centerLng = userLocation?.lng ?? hospitals[0].coordinates.lng;

        mapInstance.current = L.map(mapRef.current, {
          center: [centerLat, centerLng],
          zoom: 13,
          zoomControl: true,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
        }).addTo(mapInstance.current);
      }

      // User location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="width:14px;height:14px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 0 0 3px rgba(37,99,235,0.3),0 2px 8px rgba(0,0,0,0.3);"></div>`,
          className: '',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(mapInstance.current)
          .bindPopup('<b style="font-size:11px">📍 Your Location</b>');
        markersRef.current.push(userMarker);
      }

      // Hospital markers
      hospitals.forEach((h) => {
        const hospitalIcon = L.divIcon({
          html: `<div style="width:20px;height:20px;border-radius:50%;background:${h.emergency ? '#EF4444' : '#3B82F6'};border:2px solid white;box-shadow:0 0 0 2px ${h.emergency ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.3)'},0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:9px;">🏥</div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([h.coordinates.lat, h.coordinates.lng], { icon: hospitalIcon })
          .addTo(mapInstance.current)
          .bindPopup(
            `<div style="font-size:11px;font-family:system-ui">
              <b>${h.name}</b><br>
              ${h.distance.toFixed(1)} km away<br>
              ${h.emergency ? '<span style="color:#EF4444;font-weight:bold">🚨 Emergency Available</span>' : h.type}
            </div>`
          );
        markersRef.current.push(marker);
      });

      // Fit all markers in view
      const allCoords = [
        ...(userLocation ? [[userLocation.lat, userLocation.lng]] : []),
        ...hospitals.map((h) => [h.coordinates.lat, h.coordinates.lng]),
      ];
      if (allCoords.length > 1) {
        mapInstance.current.fitBounds(allCoords, { padding: [24, 24] });
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [hospitals, userLocation]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: 280 }}
    />
  );
}

// ── Loading Skeleton ─────────────────────────────────────────
function HospitalSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-2xl p-4 border border-slate-100 bg-white animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex gap-3 mb-3">
            <div className="h-8 w-8 rounded-xl bg-slate-100" />
            <div className="flex-1">
              <div className="h-3 bg-slate-100 rounded-full w-3/4 mb-2" />
              <div className="h-2 bg-slate-100 rounded-full w-1/2" />
            </div>
          </div>
          <div className="h-2 bg-slate-100 rounded-full w-full mb-2" />
          <div className="h-6 bg-slate-100 rounded-xl w-full mt-3" />
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
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, [shouldShow, load]);

  if (!shouldShow) return null;

  const isCritical = riskLevel === 'critical';
  const isHigh = riskLevel === 'high';

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionProperty: 'opacity, transform' }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          background: isCritical
            ? 'linear-gradient(90deg, #1a0000 0%, #2d0000 100%)'
            : isHigh
            ? 'linear-gradient(90deg, #1a0a00 0%, #2d1500 100%)'
            : 'linear-gradient(90deg, #001a2d 0%, #0a1e33 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Pulsing icon */}
          <div className="relative">
            {(isCritical || isHigh) && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: isCritical ? 'rgba(239,68,68,0.4)' : 'rgba(249,115,22,0.4)' }}
              />
            )}
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center relative z-10 text-white text-base"
              style={{
                background: isCritical ? '#EF4444' : isHigh ? '#F97316' : '#2563EB',
              }}
            >
              {isCritical ? '🚨' : isHigh ? '⚠️' : '🏥'}
            </div>
          </div>
          <div>
            <span className="text-white font-black text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {isCritical
                ? 'Emergency Medical Centers Nearby'
                : isHigh
                ? 'Specialist Hospitals Nearby'
                : 'Nearby Medical Facilities'}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {isLive ? (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                    Live · GPS Located
                  </span>
                </>
              ) : (
                <>
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest">
                    Demo · Curated List
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMap((s) => !s)}
            className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all border border-white/10 flex items-center gap-1"
          >
            <MapPin className="h-2.5 w-2.5" />
            {showMap ? 'Hide Map' : 'Show Map'}
          </button>
          <button
            onClick={load}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all border border-white/10"
            title="Refresh hospitals"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ── Critical Alert Banner ────────────────────── */}
      {isCritical && (
        <div className="px-5 py-2.5 flex items-center gap-2 border-b border-red-200"
          style={{ background: 'linear-gradient(90deg, #FEF2F2, #FFF5F5)' }}>
          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-[11px] font-semibold text-red-700">
            Critical values detected. Immediate emergency medical evaluation is strongly recommended. Please seek care now.
          </p>
        </div>
      )}

      {/* ── Body ──────────────────────────────────────── */}
      <div className="p-5 bg-white" style={{ borderTop: 'none' }}>
        {loading ? (
          <HospitalSkeleton />
        ) : error ? (
          <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <button onClick={load} className="text-blue-500 hover:underline text-sm font-medium">
              Retry
            </button>
          </div>
        ) : (
          <div className={`${showMap ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : ''}`}>
            {/* Hospital Cards */}
            <div className="flex flex-col gap-3">
              {/* Location status */}
              <div className="flex items-center gap-2 mb-1">
                <LocateFixed className="h-3 w-3 text-slate-400" />
                <span className="text-[10px] text-slate-400 font-medium">
                  {isLive
                    ? `Showing real hospitals near your location`
                    : `Showing curated hospitals · Enable location for live results`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                {hospitals.slice(0, showMap ? 4 : 6).map((hospital, i) => (
                  <HospitalCard
                    key={hospital.id}
                    hospital={hospital}
                    userLocation={userLocation}
                    index={i}
                    riskLevel={riskLevel}
                  />
                ))}
              </div>
            </div>

            {/* Map */}
            {showMap && (
              <div
                className="rounded-2xl overflow-hidden border border-slate-200"
                style={{ minHeight: 300 }}
              >
                <HospitalMap hospitals={hospitals} userLocation={userLocation} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="h-2.5 w-2.5 text-slate-400" />
          <span className="text-[10px] text-slate-400 font-medium">
            Powered by OpenStreetMap · Vitalis AI Location Services
          </span>
        </div>
        <span className="text-[10px] text-slate-400">
          {hospitals.length} facilities found
        </span>
      </div>
    </div>
  );
}
