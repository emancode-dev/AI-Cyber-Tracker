import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";
import worldMap from "world-atlas/countries-110m.json";

const points = [
  { name: "Islamabad", coordinates: [73.0479, 33.6844] },
  { name: "London", coordinates: [-0.1276, 51.5072] },
  { name: "New York", coordinates: [-74.006, 40.7128] },
  { name: "Singapore", coordinates: [103.8198, 1.3521] },
  { name: "Sydney", coordinates: [151.2093, -33.8688] },
];

function GlobalSignalMap() {
  const origin = createCoordinates(...points[0].coordinates);
  return (
    <div className="em-map-shell" aria-label="Illustrative global security signal map">
      <ComposableMap projection="geoEqualEarth" width={900} height={420} className="em-world-map">
        <Geographies geography={worldMap}>
          {({ geographies }) => geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="rgba(91, 134, 116, .18)"
              stroke="rgba(102, 255, 190, .14)"
              strokeWidth={0.55}
              style={{
                default: { outline: "none" },
                hover: { fill: "rgba(75, 255, 179, .22)", outline: "none" },
                pressed: { outline: "none" },
              }}
            />
          ))}
        </Geographies>
        {points.slice(1).map((point) => (
          <Line
            key={`line-${point.name}`}
            from={origin}
            to={createCoordinates(...point.coordinates)}
            stroke="rgba(73, 255, 182, .3)"
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}
        {points.map((point, index) => (
          <Marker key={point.name} coordinates={createCoordinates(...point.coordinates)}>
            <circle className="em-map-pulse" r={index === 0 ? 11 : 8} fill="rgba(70, 255, 178, .12)" />
            <circle r={index === 0 ? 4.5 : 3.5} fill="#55f5b3" stroke="#e9fff7" strokeWidth={1.4} />
          </Marker>
        ))}
      </ComposableMap>
      <div className="em-map-legend">
        <span><i />Assessment activity</span>
        <span>Illustrative preview</span>
      </div>
    </div>
  );
}

export default GlobalSignalMap;
