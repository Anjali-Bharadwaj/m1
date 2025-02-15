import dynamic from "next/dynamic";

const Map = dynamic(() => import("../components/map"), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1
        style={{
          textAlign: "center",
          padding: "20px",
          background: "#282c34",
          color: "white",
        }}
      >
        🚗 Live Traffic & Real-Time Directions
      </h1>
      <Map />
    </div>
  );
}
