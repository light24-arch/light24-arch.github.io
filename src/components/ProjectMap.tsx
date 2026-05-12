import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ── Types ── */
interface MapProject {
  slug: string;
  title: string;
  location: string;
  year: number;
  hero: string;
  coordinates: [number, number];
}

/** Group of projects sharing the same (or extremely close) coordinates */
interface MapCluster {
  coordKey: string;
  coordinates: [number, number];
  projects: MapProject[];
}

interface ProjectMapProps {
  projects: MapProject[];
}

/* ── Proximity clustering (threshold 0.2° ≈ 20km, covers a city) ── */
function proximityCluster(projects: MapProject[], threshold = 0.2): MapCluster[] {
  const assigned = new Set<number>();
  const clusters: MapCluster[] = [];

  for (let i = 0; i < projects.length; i++) {
    if (assigned.has(i)) continue;
    const group: MapProject[] = [projects[i]];
    assigned.add(i);

    // Greedy: find all projects within threshold of any group member
    let expanded = true;
    while (expanded) {
      expanded = false;
      for (let j = 0; j < projects.length; j++) {
        if (assigned.has(j)) continue;
        for (const member of group) {
          if (
            Math.abs(member.coordinates[0] - projects[j].coordinates[0]) < threshold &&
            Math.abs(member.coordinates[1] - projects[j].coordinates[1]) < threshold
          ) {
            group.push(projects[j]);
            assigned.add(j);
            expanded = true;
            break;
          }
        }
      }
    }

    // Average centre
    const avgLat = group.reduce((s, p) => s + p.coordinates[0], 0) / group.length;
    const avgLng = group.reduce((s, p) => s + p.coordinates[1], 0) / group.length;

    clusters.push({
      coordKey: `c-${clusters.length}`,
      coordinates: [Number(avgLat.toFixed(4)), Number(avgLng.toFixed(4))],
      projects: group,
    });
  }

  // Sort clusters by size descending so multi-project clusters stand out
  clusters.sort((a, b) => b.projects.length - a.projects.length);
  return clusters;
}

/* ── Auto-fit bounds ── */
function FitBounds({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  const key = useMemo(() => coordinates.map((c) => `${c[0]},${c[1]}`).join(';'), [coordinates]);

  useEffect(() => {
    if (!map) return;
    try {
      if (coordinates.length === 0) {
        map.setView([35.86, 104.19], 4);
        return;
      }
      if (coordinates.length === 1) {
        map.setView(coordinates[0], 13);
        return;
      }
      const bounds = L.latLngBounds(coordinates.map((c) => L.latLng(c[0], c[1])));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
      } else {
        map.setView([35.86, 104.19], 4);
      }
    } catch {
      map.setView([35.86, 104.19], 4);
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

/* ── Zoom controls ── */
function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-8 right-8 z-[1000] flex flex-col">
      <button
        onClick={() => map.zoomIn()}
        className="w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-md border border-border hover:bg-white transition-colors text-base font-medium text-text-primary"
        aria-label="放大"
        style={{ borderBottom: 'none' }}
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-9 h-9 flex items-center justify-center bg-white/80 backdrop-blur-md border border-border hover:bg-white transition-colors text-base font-medium text-text-primary"
        aria-label="缩小"
      >
        &minus;
      </button>
    </div>
  );
}

/* ── Marker icons ── */

/** Single-project marker: dark gray dot */
const circleIcon = L.divIcon({
  html: `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;">
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="7.5" fill="#333333" stroke="#FFFFFF" stroke-width="1.5"/>
    </svg>
  </div>`,
  className: 'custom-circle-marker',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -26],
});

/** Multi-project cluster marker: larger dot + faint outer ring */
const clusterIcon = L.divIcon({
  html: `<div style="width:48px;height:48px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;">
    <svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
      <circle cx="14" cy="14" r="10" fill="#333333" stroke="#FFFFFF" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="12.5" fill="none" stroke="#333333" stroke-width="0.6" opacity="0.35"/>
    </svg>
  </div>`,
  className: 'custom-circle-marker cluster-marker',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -27],
});

/* ── Glass card shell (shared by single & stacked) ── */
const glassClasses =
  'bg-white/70 backdrop-blur-md border border-white/40 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-2xl overflow-hidden';

/* ── Single project popup card ── */
function SingleCard({ project }: { project: MapProject }) {
  return (
    <a href={`/projects/${project.slug}`} className={`block w-72 sm:w-80 group/card ${glassClasses}`}>
      <img
        src={project.hero}
        alt={project.title}
        className="w-full aspect-[16/10] object-cover transition-all duration-500 group-hover/card:brightness-105"
        loading="lazy"
      />
      <div className="p-4 sm:p-5">
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-text-tertiary mb-1.5">
          {project.year} · {project.location}
        </p>
        <h3 className="text-base sm:text-lg font-medium text-text-primary mb-4 leading-snug tracking-[-0.01em]">
          {project.title}
        </h3>
        <span className="text-xs font-medium tracking-[0.15em] uppercase text-text-primary border-b border-text-primary pb-0.5 group-hover/card:opacity-50 transition-opacity">
          View Project &rarr;
        </span>
      </div>
    </a>
  );
}

/* ── PopupCarousel — multi-project carousel with faux-3D stack ── */
function PopupCarousel({ projects }: { projects: MapProject[] }) {
  const [index, setIndex] = useState(0);
  const total = projects.length;

  const goTo = (dir: 1 | -1) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((prev) => (prev + dir + total) % total);
  };

  const current = projects[index];
  const peek = projects[(index + 1) % total];

  return (
    <div className="w-[280px] sm:w-[340px] bg-white/70 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden border border-white/40">
      {/* Stack area */}
      <div className="relative" style={{ height: '200px', minHeight: '180px' }}>
        {/* Peek card (next) */}
        {total > 1 && (
          <div
            key={`peek-${(index + 1) % total}`}
            className="absolute top-0 left-0 w-full h-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-10"
            style={{
              transform: 'translateX(10px) translateY(8px) scale(0.93)',
              opacity: 0.3,
            }}
          >
            <img
              src={peek.hero}
              alt=""
              className="w-full h-full object-cover rounded-t-2xl"
              loading="lazy"
            />
          </div>
        )}

        {/* Active card */}
        <a
          key={`active-${index}`}
          href={`/projects/${current.slug}`}
          className="absolute top-0 left-0 w-full h-full transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-20"
        >
          <img
            src={current.hero}
            alt={current.title}
            className="w-full h-full object-cover rounded-t-2xl"
            loading="lazy"
          />
        </a>
      </div>

      {/* Info + nav bar */}
      <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-4">
        <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-text-tertiary mb-1">
          {current.year} · {current.location}
        </p>
        <a href={`/projects/${current.slug}`} className="group/title">
          <h3 className="text-base sm:text-lg font-medium text-text-primary leading-snug tracking-[-0.01em] mb-4 group-hover/title:text-text-secondary transition-colors">
            {current.title}
          </h3>
        </a>

        {/* Nav row: large arrows + counter + "View" */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goTo(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/6 hover:bg-black/12 active:scale-95 transition-all text-text-primary"
              aria-label="上一个"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 3L5 8l5 5" />
              </svg>
            </button>
            <span className="text-xs text-text-tertiary tracking-[0.1em] tabular-nums font-medium">
              {index + 1} / {total}
            </span>
            <button
              onClick={goTo(1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/6 hover:bg-black/12 active:scale-95 transition-all text-text-primary"
              aria-label="下一个"
            >
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          </div>
          <a
            href={`/projects/${current.slug}`}
            className="text-xs font-medium tracking-[0.15em] uppercase text-text-primary border-b border-text-primary pb-0.5 hover:opacity-50 transition-opacity"
          >
            View &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
export default function ProjectMap({ projects }: ProjectMapProps) {
  if (projects.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-text-tertiary text-sm">
        No projects with location data.
      </div>
    );
  }

  const clusters = useMemo(() => proximityCluster(projects), [projects]);
  const uniqueCoords = clusters.map((c) => c.coordinates);

  return (
    <div
      className="w-full h-full relative rounded-2xl overflow-hidden shadow-card"
      data-lenis-prevent
    >
      <MapContainer
        center={[32, 110]}
        zoom={5}
        minZoom={2}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        zoomControl={false}
        attributionControl={false}
        style={{ height: '100%', width: '100%', background: '#F5F5F5' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          noWrap={true}
        />

        <FitBounds coordinates={uniqueCoords} />

        {clusters.map((cluster) => {
          const isMulti = cluster.projects.length > 1;
          return (
            <Marker
              key={cluster.coordKey}
              position={cluster.coordinates}
              icon={isMulti ? clusterIcon : circleIcon}
            >
              <Popup className="project-map-popup" closeButton={false} offset={[0, -20]}>
                {isMulti ? (
                  <PopupCarousel projects={cluster.projects} />
                ) : (
                  <SingleCard project={cluster.projects[0]} />
                )}
              </Popup>
            </Marker>
          );
        })}

        <ZoomControls />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] text-[10px] text-text-tertiary/60">
        &copy; <a href="https://carto.com/" className="underline">CARTO</a>
      </div>
    </div>
  );
}
