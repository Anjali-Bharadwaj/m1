import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

export default function MapComponent() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(77.1025); // Default: Delhi
  const [lat, setLat] = useState(28.7041);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    // Add Directions Control
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving",
      alternatives: true,
      congestion: true,
      interactive: true,
    });

    map.current.addControl(directions, "top-left");

    // Update State on Move
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    return () => map.current.remove();
  }, []);

  return (
    <div>
      <div style={{ padding: "10px", background: "#fff", marginBottom: "5px" }}>
        <strong>Longitude:</strong> {lng} | <strong>Latitude:</strong> {lat} | <strong>Zoom:</strong> {zoom}
      </div>
      <div ref={mapContainer} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}
