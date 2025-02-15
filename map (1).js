"use client";
import { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

console.log("Mapbox Access Token:", process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);

export default function MapComponent() {
  const [map, setMap] = useState(null);
  const [radius, setRadius] = useState(500); // Default radius in meters
  const [marker, setMarker] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [76.6394, 12.2958], // Mysore
        zoom: 12,
      });

      setMap(mapInstance);

      // Add search bar with suggestions
      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
      });
      mapInstance.addControl(geocoder);

      // Handle user pin drop
      mapInstance.on("click", (e) => {
        const { lng, lat } = e.lngLat;

        // Remove previous marker
        if (marker) marker.remove();

        // Add new marker
        const newMarker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(mapInstance);
        setMarker(newMarker);

        // Draw radius
        drawCircle(mapInstance, lng, lat, radius);
      });

      // Track user location
      navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([longitude, latitude]);

          // Add user location marker
          new mapboxgl.Marker({ color: "red" })
            .setLngLat([longitude, latitude])
            .addTo(mapInstance);
        },
        (err) => console.error("Error getting location:", err),
        { enableHighAccuracy: true }
      );
    };

    if (!map) initializeMap();
  }, [map]); // Added map as dependency to avoid re-initialization

  // Function to draw a circle around a point
  const drawCircle = (mapInstance, lng, lat, radius) => {
    if (mapInstance.getSource("radius")) {
      mapInstance.removeLayer("radius-layer");
      mapInstance.removeSource("radius");
    }

    const circleGeoJSON = createCircleGeoJSON(lng, lat, radius);

    mapInstance.addSource("radius", {
      type: "geojson",
      data: circleGeoJSON,
    });

    mapInstance.addLayer({
      id: "radius-layer",
      type: "fill",
      source: "radius",
      paint: {
        "fill-color": "rgba(0, 0, 255, 0.3)",
        "fill-opacity": 0.5,
      },
    });
  };

  // Function to create a circular GeoJSON feature
  const createCircleGeoJSON = (lng, lat, radius) => {
    const points = 64; // Number of points to create smooth circle
    const coords = [];
    for (let i = 0; i < points; i++) { // Removed extra 'let'
      const angle = (i / points) * (2 * Math.PI);
      const dx = radius * Math.cos(angle);
      const dy = radius * Math.sin(angle);
      const newLng = lng + (dx / 111320); // Convert meters to degrees
      const newLat = lat + (dy / 110574);
      coords.push([newLng, newLat]);
    }
    coords.push(coords[0]); // Close the polygon

    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    };
  };

  return (
    <div>
      <div id="map" style={{ width: "100%", height: "500px" }}></div>
      <input
        type="number"
        value={radius}
        onChange={(e) => {
          setRadius(Number(e.target.value));
          if (marker) {
            drawCircle(map, marker.getLngLat().lng, marker.getLngLat().lat, Number(e.target.value));
          }
        }}
        placeholder="Enter radius in meters"
        style={{ marginTop: "10px", padding: "5px" }}
      />
    </div>
  );
}