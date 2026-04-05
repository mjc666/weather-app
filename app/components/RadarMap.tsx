'use client';

import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';

// Dynamically import Leaflet components
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false });

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (map && typeof map.flyTo === 'function') {
      map.flyTo(center, 8);
    }
  }, [center, map]);
  return null;
};

export default function RadarMap({ lat, lon, city }: { lat: number; lon: number; city: string }) {
  const [L, setLeaflet] = useState<any>(null);

  useEffect(() => {
    import('leaflet').then((leaflet) => {
      const DefaultIcon = leaflet.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });
      leaflet.Marker.prototype.options.icon = DefaultIcon;
      setLeaflet(leaflet);
    });
  }, []);

  if (!L) return <div className="h-64 w-full bg-gray-200 animate-pulse rounded-lg" />;

  return (
    <div className="h-64 w-full relative rounded-lg overflow-hidden flex flex-col">
      <div className="h-64 w-full flex-grow">
        <MapContainer center={[lat, lon]} zoom={8} className="h-64 w-full" scrollWheelZoom={false}>
          <TileLayer 
              url={`/api/tiles/map?z={z}&x={x}&y={y}`} 
          />
          <TileLayer 
              url={`/api/radar?layer=precipitation_new&z={z}&x={x}&y={y}`} 
          />          
          <Marker position={[lat, lon]}>
            <Popup>{city}</Popup>
          </Marker>
          <MapUpdater center={[lat, lon]} />
        </MapContainer>
      </div>
      <div className="bg-white p-1 text-xs text-center text-gray-500">
        Powered by OpenWeatherMap
      </div>
    </div>
  );
}
