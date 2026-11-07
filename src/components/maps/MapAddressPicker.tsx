import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MapPin,
  Search,
  Crosshair,
  Loader2,
  Navigation,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

// Custom SVG pin marker for Leaflet to avoid missing asset issues in Vite
const pinIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="#ef4444" stroke="#ffffff" stroke-width="1.5">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
</svg>
`;

const customPinIcon = L.divIcon({
  html: `<div style="transform: translate(-18px, -36px); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">${pinIconSvg}</div>`,
  className: 'custom-leaflet-pin',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapAddressPickerProps {
  value?: string;
  coordinates?: MapCoordinates;
  onChange?: (address: string, coordinates?: MapCoordinates) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  height?: string;
}

// Default center: Tehran (35.6892, 51.3890)
const DEFAULT_COORDS: MapCoordinates = {
  lat: 35.6892,
  lng: 51.389,
};

export function MapAddressPicker({
  value = '',
  coordinates,
  onChange,
  label = 'آدرس تحویل و موقعیت روی نقشه',
  placeholder = 'آدرس کامل پستی (خیابان، کوچه، پلاک، واحد)...',
  className = '',
  height = '320px',
}: MapAddressPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentCoords, setCurrentCoords] = useState<MapCoordinates>(
    coordinates || DEFAULT_COORDS
  );
  const [addressText, setAddressText] = useState<string>(() => value || '');
  const [prevValue, setPrevValue] = useState<string | undefined>(value);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sync external value into state idiomatically in React 18/19
  if (value !== prevValue) {
    setPrevValue(value);
    setAddressText(value || '');
  }

  // Sync external coordinates into map
  const [prevCoords, setPrevCoords] = useState<MapCoordinates | undefined>(coordinates);
  if (
    coordinates &&
    (!prevCoords ||
      coordinates.lat !== prevCoords.lat ||
      coordinates.lng !== prevCoords.lng)
  ) {
    setPrevCoords(coordinates);
    setCurrentCoords(coordinates);
  }

  useEffect(() => {
    if (coordinates && markerRef.current && mapRef.current) {
      markerRef.current.setLatLng([coordinates.lat, coordinates.lng]);
      mapRef.current.setView([coordinates.lat, coordinates.lng], mapRef.current.getZoom());
    }
  }, [coordinates]);

  // Reverse geocode using OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fa,en`,
        {
          headers: {
            'User-Agent': 'BazarAzadStore/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('Network error');
      const data = await response.json();

      let formatted = '';
      if (data && data.display_name) {
        // Build a readable Persian/localized address
        const addr = data.address || {};
        const parts = [
          addr.province || addr.state,
          addr.city || addr.town || addr.county,
          addr.suburb || addr.neighbourhood || addr.quarter,
          addr.road || addr.street,
          addr.house_number ? `پلاک ${addr.house_number}` : '',
        ].filter(Boolean);

        formatted = parts.length > 0 ? parts.join('، ') : data.display_name;
      }

      if (formatted) {
        setAddressText(formatted);
        onChange?.(formatted, { lat, lng });
      } else {
        onChange?.(addressText, { lat, lng });
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      // Even if reverse geocoding fails or is offline, retain coordinates
      onChange?.(addressText, { lat, lng });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialLat = coordinates?.lat || DEFAULT_COORDS.lat;
    const initialLng = coordinates?.lng || DEFAULT_COORDS.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    // OpenStreetMap Standard Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Initial marker (draggable)
    const marker = L.marker([initialLat, initialLng], {
      icon: customPinIcon,
      draggable: true,
    }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const newCoords = { lat: pos.lat, lng: pos.lng };
      setCurrentCoords(newCoords);
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      const newCoords = { lat, lng };
      setCurrentCoords(newCoords);
      reverseGeocode(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Invalidate size to handle dialog animation/rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Search places with OpenStreetMap Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}&accept-language=fa,en&limit=1`,
        {
          headers: {
            'User-Agent': 'BazarAzadStore/1.0',
          },
        }
      );

      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const newCoords = { lat, lng };

        setCurrentCoords(newCoords);
        if (markerRef.current && mapRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.setView([lat, lng], 16);
        }

        // Call reverse geocoding to format address nicely
        reverseGeocode(lat, lng);
        toast.success('موقعیت در نقشه پیدا شد');
      } else {
        toast.error('مکانی با این نام یافت نشد');
      }
    } catch {
      toast.error('خطا در جستجوی مکان');
    } finally {
      setIsSearching(false);
    }
  };

  // Get current device location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const newCoords = { lat, lng };

        setCurrentCoords(newCoords);
        if (markerRef.current && mapRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.setView([lat, lng], 16);
        }
        reverseGeocode(lat, lng);
        toast.success('موقعیت شما تعیین شد');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        toast.error('دسترسی به موقعیت مکانی داده نشد یا در دسترس نیست');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddressTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setAddressText(text);
    onChange?.(text, currentCoords);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 font-medium text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          {label}
        </Label>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="h-3.5 w-3.5" />
          مکان را روی نقشه جابجا کنید تا آدرس خودکار درج شود
        </span>
      </div>

      {/* Map search & controls toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="جستجوی شهر، خیابان یا محله در نقشه..."
            className="pr-9 text-xs sm:text-sm"
          />
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleSearch()}
          disabled={isSearching || !searchQuery.trim()}
          className="shrink-0 gap-1.5"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-3.5 w-3.5" />}
          جستجو
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetLocation}
          disabled={isLocating}
          title="موقعیت فعلی من"
          className="shrink-0 gap-1.5"
        >
          {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4 text-primary" />}
          <span className="hidden sm:inline">موقعیت من</span>
        </Button>
      </div>

      {/* Leaflet OpenStreetMap Container */}
      <div className="relative overflow-hidden rounded-lg border border-border shadow-inner">
        <div
          ref={mapContainerRef}
          style={{ height, width: '100%', zIndex: 10 }}
          className="cursor-crosshair bg-muted/20"
        />

        {isReverseGeocoding && (
          <div className="absolute top-2 right-2 z-20 flex items-center gap-2 rounded-md bg-background/90 px-3 py-1.5 text-xs font-medium shadow backdrop-blur-sm">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            در حال دریافت نام آدرس...
          </div>
        )}

        <div className="absolute bottom-2 left-2 z-20 rounded bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground shadow backdrop-blur-sm" dir="ltr">
          {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)} (OpenStreetMap)
        </div>
      </div>

      {/* Address description input (editable by user, auto-filled from map) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">شرح دقیق آدرس پستی (قابل ویرایش):</Label>
          {isReverseGeocoding && <span className="text-[11px] text-primary">بروزرسانی از نقشه...</span>}
        </div>
        <Textarea
          value={addressText}
          onChange={handleAddressTextChange}
          placeholder={placeholder}
          rows={3}
          className="resize-y text-sm leading-relaxed"
        />
      </div>
    </div>
  );
}
