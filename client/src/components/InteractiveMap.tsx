import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in Leaflet with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocation {
  id: number;
  title: string;
  type: 'listing' | 'farmspace';
  lat: number;
  lng: number;
  price: number;
  seller: string;
  description: string;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  center: [number, number];
  zoom?: number;
  onLocationClick?: (location: MapLocation) => void;
}

export default function InteractiveMap({ 
  locations, 
  center, 
  zoom = 10, 
  onLocationClick 
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstance.current = L.map(mapRef.current).setView(center, zoom);

    // Add OpenStreetMap tiles (free)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstance.current);

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstance.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    locations.forEach(location => {
      // Create custom icon based on type
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${location.type === 'listing' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          ">
            ${location.type === 'listing' ? '$' : 'L'}
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([location.lat, location.lng], { icon })
        .addTo(mapInstance.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${location.title}</h3>
            <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${location.description}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #10b981;">$${location.price}${location.type === 'farmspace' ? '/month' : ''}</span>
              <span style="color: #666; font-size: 12px;">by ${location.seller}</span>
            </div>
            <button 
              onclick="window.dispatchEvent(new CustomEvent('map-location-click', { detail: ${location.id} }))"
              style="
                background: #10b981;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                margin-top: 8px;
                cursor: pointer;
                width: 100%;
                font-size: 12px;
              "
            >
              View Details
            </button>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Fit map to show all markers if there are any
    if (locations.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [locations]);

  useEffect(() => {
    const handleLocationClick = (event: CustomEvent) => {
      const locationId = event.detail;
      const location = locations.find(loc => loc.id === locationId);
      if (location && onLocationClick) {
        onLocationClick(location);
      }
    };

    window.addEventListener('map-location-click', handleLocationClick as EventListener);
    
    return () => {
      window.removeEventListener('map-location-click', handleLocationClick as EventListener);
    };
  }, [locations, onLocationClick]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-96 rounded-lg border-2 border-gray-200"
      style={{ minHeight: '400px' }}
    />
  );
}