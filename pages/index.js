import dynamic from 'next/dynamic';

const Map = dynamic(() => import('../components/map'), { ssr: false });



export default function Home() {
  return (
    <div>
      <h1>Traffic Optimization</h1>
      <Map />
    </div>
  );
}
