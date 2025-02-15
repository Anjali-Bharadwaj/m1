import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = { width: "100%", height: "500px" };
const center = { lat: 28.6139, lng: 77.2090 }; // Example: New Delhi

export default function MapComponent() {
  const [directions, setDirections] = useState(null);

  const directionsCallback = (result, status) => {
    if (status === "OK") {
      setDirections(result);
    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyDYeWwOCXjTZRsu2DStAPNHT7L6N85GD_M">
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={10}>
        <DirectionsService
          options={{
            destination: "Mumbai, India",
            origin: "Delhi, India",
            travelMode: "DRIVING",
          }}
          callback={directionsCallback}
        />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </LoadScript>
  );
}
