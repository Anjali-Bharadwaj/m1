import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1 style={{ textAlign: "center", padding: "20px" }}>🚗 Live Traffic & Directions</h1>
      <Map />
    </div>
  );
}
