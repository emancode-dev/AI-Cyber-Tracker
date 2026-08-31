import { useEffect, useState } from "react";
import Globe from "../originkit/Globe";

const MARKERS = [
  { lat: 33.6844, lng: 73.0479 },
  { lat: 51.5072, lng: -0.1276 },
  { lat: 40.7128, lng: -74.006 },
  { lat: 1.3521, lng: 103.8198 },
  { lat: -33.8688, lng: 151.2093 },
  { lat: 25.2048, lng: 55.2708 }
];

function EmeraldGlobe({ className = "", label = "Global signal activity" }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    return () => media.removeEventListener?.("change", update);
  }, []);

  return <div className={`em-globe-wrap em-originkit-globe ${className}`.trim()} role="img" aria-label={label}><Globe speed={reducedMotion ? 0 : 1.8} smoothing={8} dots={{ color: "#f1fff9", size: 4.8, density: 8, allDots: false }} fill="dots" fillColor="#f1fff9" scale={8.5} stopOnHover={false} markerConfig={{ markers: MARKERS, color: "#55f5b3", size: 42 }} direction="left" initialLatitude={23} initialLongitude={-23} oceanColor="#020806" outlineColor="#dffff1" showOutline showGrid graticuleColor="#6f9f8b" outlineWidth={0.85} dragSpeed={4} detail={7}/><div className="em-globe-status" aria-hidden="true"><span/><b>Live passive signals</b></div></div>;
}

export default EmeraldGlobe;
