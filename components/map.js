import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';

export default function Map() {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [radius, setRadius] = useState(100);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;
    
    const initializedMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [76.6394, 12.2958], // Mysore
      zoom: 13
    });

    initializedMap.on('click', (e) => {
      if (marker) marker.remove();
      const newMarker = new mapboxgl.Marker()
        .setLngLat(e.lngLat)
        .addTo(initializedMap);
      setMarker(newMarker);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUserLocation([position.coords.longitude, position.coords.latitude]);
        initializedMap.setCenter([position.coords.longitude, position.coords.latitude]);
      });
    }

    setMap(initializedMap);
    return () => initializedMap.remove();
  }, []);

  const handleRadiusChange = (e) => {
    setRadius(e.target.value);
  };

  const handleSearch = (type, value) => {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${value}.json?access_token=${mapboxgl.accessToken}`)
      .then(res => res.json())
      .then(data => {
        if (data.features.length > 0) {
          const place = data.features[0].center;
          if (type === 'start') setStart(place.join(','));
          if (type === 'end') setEnd(place.join(','));
        }
      });
  };

  const getDirections = () => {
    if (!start || !end) return;
    
    const directionsRequest = `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
    
    fetch(directionsRequest)
      .then(res => res.json())
      .then(data => {
        const route = data.routes[0].geometry.coordinates;
        const routeLayer = {
          id: 'route',
          type: 'line',
          source: {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: route }
            }
          },
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#3887be', 'line-width': 5 }
        };
        
        if (map.getLayer('route')) map.removeLayer('route');
        if (map.getSource('route')) map.removeSource('route');
        
        map.addLayer(routeLayer);
      });
  };

  return (
    <div>
      <div ref={mapContainerRef} style={{ height: '500px', width: '100%' }} />
      <input type="number" value={radius} onChange={handleRadiusChange} placeholder="Enter radius in meters" />
      <input type="text" placeholder="Start location" onBlur={(e) => handleSearch('start', e.target.value)} />
      <input type="text" placeholder="End location" onBlur={(e) => handleSearch('end', e.target.value)} />
      <button onClick={getDirections}>Get Directions</button>
    </div>
  );
}