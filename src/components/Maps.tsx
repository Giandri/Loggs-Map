"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, LayerGroup, Circle, Polyline } from "react-leaflet";
import { MapPin, Navigation, Clock, Wifi, ChevronRight, ChevronLeft, MessageCircle, Locate, Coffee, Percent, Signal, Home, Car, CreditCard, Instagram, ExternalLink, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import Navbar from "./Navbar";
import Footer from "./Footer";
import GuideStep from "./GuideStep";
import MapControls from "./MapControls";
import PageLoader from "./PageLoader";
import FavoritesDrawer from "./FavoritesDrawer";
import DetailDrawer from "./DetailDrawer";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useCoffeeShops } from "@/hooks/useCoffeeShops";
import { useFavorites } from "@/hooks/useFavorites";
import { useCookieConsent } from "@/hooks/useCookieConsent";

interface CoffeeShop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  whatsapp?: string;
  instagram?: string;
  facilities: any[];
  photos: any[];
  logo?: string;
  wfc: boolean;
  openTime?: string;
  closeTime?: string;
  operatingDays?: string;
  priceRange?: string;
  serviceTax?: string;
  connectionSpeed?: string;
  mushola?: boolean;
  parking?: string[];
  paymentMethods?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// User location marker icon
const createUserLocationIcon = () => {
  return L.divIcon({
    className: "user-location-marker",
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-12 h-12 bg-white/30 rounded-full animate-ping"></div>
        <div class="absolute w-8 h-8 bg-white/50 rounded-full animate-pulse"></div>
        <div class="relative w-5 h-5 bg-white rounded-full border-2 border-gray-300 shadow-lg"></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

// Map Controller component to handle map operations
interface MapControllerProps {
  userLocation: [number, number] | null;
  mapCenter: [number, number];
  onMapReady: (map: L.Map) => void;
}

const MapController = ({ userLocation, mapCenter, onMapReady }: MapControllerProps) => {
  const map = useMap();

  React.useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
};

// Route Info Marker that follows visible route on map pan
interface RouteInfoMarkerProps {
  routeCoordinates: [number, number][];
  routeInfo: { distance: string; duration: string };
  onClear: () => void;
}

const RouteInfoMarker = ({ routeCoordinates, routeInfo, onClear }: RouteInfoMarkerProps) => {
  const map = useMap();
  const markerRef = React.useRef<L.Marker | null>(null);
  const animationRef = React.useRef<number | null>(null);
  const currentPos = React.useRef<[number, number]>(routeCoordinates[Math.floor(routeCoordinates.length / 2)]);
  const targetPos = React.useRef<[number, number]>(routeCoordinates[Math.floor(routeCoordinates.length / 2)]);
  const [animatedPosition, setAnimatedPosition] = React.useState<[number, number]>(currentPos.current);

  // EaseOut animation using lerp (smooth, no bounce)
  const animateEaseOut = React.useCallback(() => {
    const ease = 0.04; // Lower = slower & smoother

    const dx = targetPos.current[0] - currentPos.current[0];
    const dy = targetPos.current[1] - currentPos.current[1];

    // Simple lerp - creates natural easeOut effect
    currentPos.current = [currentPos.current[0] + dx * ease, currentPos.current[1] + dy * ease];

    setAnimatedPosition([...currentPos.current]);

    // Continue animation if not close enough
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.000005) {
      animationRef.current = requestAnimationFrame(animateEaseOut);
    } else {
      // Snap to target and reset
      currentPos.current = [...targetPos.current];
      setAnimatedPosition([...targetPos.current]);
      animationRef.current = null;
    }
  }, []);

  // Start animation when target changes
  const animateToPosition = React.useCallback(
    (newTarget: [number, number]) => {
      targetPos.current = newTarget;

      // Cancel previous animation and start new one
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animateEaseOut);
    },
    [animateEaseOut]
  );

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Find center of visible route segment
  const updateVisiblePosition = React.useCallback(() => {
    if (!routeCoordinates || routeCoordinates.length === 0) return;

    const bounds = map.getBounds();
    const visiblePoints = routeCoordinates.filter((coord) => bounds.contains(L.latLng(coord[0], coord[1])));

    let newPosition: [number, number];

    if (visiblePoints.length > 0) {
      const midIndex = Math.floor(visiblePoints.length / 2);
      newPosition = visiblePoints[midIndex];
    } else {
      const center = map.getCenter();
      let minDist = Infinity;
      let closestPoint = routeCoordinates[Math.floor(routeCoordinates.length / 2)];

      routeCoordinates.forEach((coord) => {
        const dist = Math.sqrt(Math.pow(coord[0] - center.lat, 2) + Math.pow(coord[1] - center.lng, 2));
        if (dist < minDist) {
          minDist = dist;
          closestPoint = coord;
        }
      });

      newPosition = closestPoint;
    }

    animateToPosition(newPosition);
  }, [map, routeCoordinates, animateToPosition]);

  // Listen to map move events
  React.useEffect(() => {
    updateVisiblePosition();

    map.on("move", updateVisiblePosition);
    map.on("zoom", updateVisiblePosition);

    return () => {
      map.off("move", updateVisiblePosition);
      map.off("zoom", updateVisiblePosition);
    };
  }, [map, updateVisiblePosition]);

  const icon = React.useMemo(
    () =>
      L.divIcon({
        className: "route-info-marker",
        html: `
      <div style="
        background: white;
        padding: 8px 12px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
        font-family: system-ui, -apple-system, sans-serif;
        cursor: pointer;
      ">
        <div style="
          width: 28px;
          height: 28px;
          background: #dbeafe;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </div>
        <div>
          <div style="font-size: 13px; font-weight: 600; color: #111;">${routeInfo.distance}</div>
          <div style="font-size: 11px; color: #666;">${routeInfo.duration}</div>
        </div>
        <div style="margin-left: 4px; color: #999; font-size: 10px;">✕</div>
      </div>
    `,
        iconSize: [140, 50],
        iconAnchor: [70, 25],
      }),
    [routeInfo]
  );

  return (
    <Marker
      ref={markerRef}
      position={animatedPosition}
      icon={icon}
      eventHandlers={{
        click: onClear,
      }}
    />
  );
};

// Custom marker generator with logo support
const createCustomIcon = (logoUrl: string | undefined, isSelected: boolean) => {
  const imageUrl = logoUrl && logoUrl.trim() !== "" ? logoUrl : "/api/placeholder/40/40?text=C";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="
        relative flex items-center justify-center 
        transition-all duration-300 ease-out pointer-events-auto
        ${isSelected ? "w-14 h-14" : "w-10 h-10"}
      ">
        <div class="
          relative w-full h-full rounded-full shadow-xl 
          flex items-center justify-center overflow-hidden
          border-2 border-white
          ${isSelected ? "bg-white" : "bg-white"}
        ">
          <img
            src="${imageUrl}"
            alt="Coffee Shop"
            class="w-full h-full object-cover rounded-full"
            onerror="this.src='/api/placeholder/40/40?text=C'"
          />
          ${isSelected ? '<div class="absolute -inset-2 bg-orange-400/30 rounded-full animate-ping z-[-1]"></div>' : ""}
        </div>
        <!-- Arrow at bottom -->
        <div class="
          absolute -bottom-1 left-1/2 -translate-x-1/2 
          w-3 h-3 rotate-45 border-r border-b border-white
          ${isSelected ? "bg-white" : "bg-white"}
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 45],
    popupAnchor: [0, -50],
  });
};

const Maps = () => {
  const [selectedShop, setSelectedShop] = useState<CoffeeShop | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"satellite" | "street">("satellite");
  const [showGuide, setShowGuide] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [userLocationName, setUserLocationName] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [nearbyShops, setNearbyShops] = useState<Array<CoffeeShop & { distance: number }>>([]);
  const [showNearbyPanel, setShowNearbyPanel] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [nearbyPanelScale, setNearbyPanelScale] = useState(1);
  const [isPinchingNearbyPanel, setIsPinchingNearbyPanel] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const pinchStartDistanceRef = useRef<number | null>(null);
  const markerClusterGroupRef = useRef<any>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);

  const handleStepChange = useCallback((stepId: string) => {
    const internalControlSteps = ["layer-switcher", "filter", "recenter", "location", "bookmark", "help"];
    if (internalControlSteps.includes(stepId)) {
      setControlsOpen(true);
    } else {
      setControlsOpen(false);
    }
  }, []);

  // Pangkalpinang coordinates
  const mapCenter: [number, number] = [-2.1316, 106.1166];

  // Use custom hook for real-time data (moved up to be available for callbacks)
  const { coffeeShops, loading, refreshCoffeeShops } = useCoffeeShops();

  // Use favorites hook
  const { favorites, toggleFavorite, isFavorited, loading: favoritesLoading } = useFavorites();

  // Cookie consent hook
  const { canUseEssentialCookies, consentStatus } = useCookieConsent();

  // Handle map ready
  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;

    // Initialize marker cluster group
    if (!markerClusterGroupRef.current) {
      markerClusterGroupRef.current = (L as any).markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 50,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();

          return L.divIcon({
            html: `
              <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                background: white;
                border: 2px solid white;
                border-radius: 50%;
                color: black;
                font-weight: bold;
                font-size: 11px;
                font-family: 'Courier New', monospace;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                transition: transform 0.2s ease;
                cursor: pointer;
              "
              onmouseover="this.style.transform='scale(1.1)'"
              onmouseout="this.style.transform='scale(1)'"
              >
                <span>${count}</span>
              </div>
            `,
            className: "custom-cluster",
            iconSize: L.point(32, 32, true),
          });
        },
      });

      map.addLayer(markerClusterGroupRef.current);
    }
  }, []);

  // Reverse geocoding - get location name from coordinates
  const getLocationName = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: {
          "Accept-Language": "id",
          "User-Agent": "CoffeeMapApp/1.0",
        },
      });
      const data = await response.json();

      if (data && data.display_name) {
        return data.display_name.replace(/, Indonesia$/i, "");
      }

      return "Lokasi ditemukan";
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return "Lokasi ditemukan";
    }
  }, []);

  const handleGetUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation tidak didukung browser ini");
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setUserLocationName(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [latitude, longitude];
        setUserLocation(newLocation);
        setIsLocating(false);

        if (mapRef.current) {
          mapRef.current.setView(newLocation, 16, { animate: true });
        }

        const locationName = await getLocationName(latitude, longitude);
        setUserLocationName(locationName);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Izin lokasi ditolak");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Lokasi tidak tersedia");
            break;
          case error.TIMEOUT:
            setLocationError("Waktu permintaan habis");
            break;
          default:
            setLocationError("Gagal mendapatkan lokasi");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [getLocationName]);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }, []);

  // Find nearby coffee shops
  const findNearbyShops = useCallback(
    (location: [number, number], shops: CoffeeShop[], limit: number = 5) => {
      const shopsWithDistance = shops.map((shop) => ({
        ...shop,
        distance: calculateDistance(location[0], location[1], shop.lat, shop.lng),
      }));

      // Sort by distance and take top N
      return shopsWithDistance.sort((a, b) => a.distance - b.distance).slice(0, limit);
    },
    [calculateDistance]
  );

  // Recenter to user location and show nearby recommendations
  const handleRecenter = useCallback(() => {
    if (userLocation && mapRef.current) {
      // Center to user location
      mapRef.current.setView(userLocation, 15, { animate: true });

      // Find and show nearby coffee shops
      const nearby = findNearbyShops(userLocation, coffeeShops, 5);
      setNearbyShops(nearby);
      setShowNearbyPanel(true);
    } else if (mapRef.current) {
      // Fallback to default center if no user location
      mapRef.current.setView(mapCenter, 14, { animate: true });
      setShowNearbyPanel(false);
    }
  }, [userLocation, mapCenter, coffeeShops, findNearbyShops]);

  // Get route from OSRM (Open Source Routing Machine)
  const getRoute = useCallback(
    async (destination: { lat: number; lng: number }) => {
      if (!userLocation) {
        setLocationError("Aktifkan lokasi Anda terlebih dahulu");
        return;
      }

      setIsLoadingRoute(true);
      setRouteCoordinates(null);
      setRouteInfo(null);

      try {
        // OSRM API - format: /route/v1/{profile}/{coordinates}
        const url = `https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
          const route = data.routes[0];

          // Convert GeoJSON coordinates [lng, lat] to Leaflet format [lat, lng]
          const coordinates: [number, number][] = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

          // Calculate distance and duration
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMin = Math.round(route.duration / 60);

          setRouteCoordinates(coordinates);
          setRouteInfo({
            distance: `${distanceKm} km`,
            duration: `${durationMin} menit`,
          });

          // Fit map to show entire route
          if (mapRef.current && coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates);
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        } else {
          setLocationError("Gagal mendapatkan rute");
        }
      } catch (error) {
        console.error("Route error:", error);
        setLocationError("Gagal mendapatkan rute");
      } finally {
        setIsLoadingRoute(false);
      }
    },
    [userLocation]
  );

  // Clear route
  const clearRoute = useCallback(() => {
    setRouteCoordinates(null);
    setRouteInfo(null);
  }, []);

  // User location icon
  const userLocationIcon = useMemo(() => createUserLocationIcon(), []);

  // Show intro loader on page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Show guide on every page load/refresh (after intro) - only if cookie consent not given
  React.useEffect(() => {
    // Only show guide if user hasn't made a cookie consent choice yet
    if (consentStatus === null) {
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 2500); // Delay guide to show after intro
      return () => clearTimeout(timer);
    }
  }, [consentStatus]);

  // Polling for real-time updates (every 30 seconds)
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshCoffeeShops();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshCoffeeShops]);

  // Use real data from API (fallback to shared storage)

  const filteredShops = coffeeShops.filter((shop) => shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || shop.address.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleShopSelect = (shop: CoffeeShop) => {
    setSelectedShop(shop);
    setIsDrawerOpen(true);
  };

  // Manage marker cluster group
  React.useEffect(() => {
    if (markerClusterGroupRef.current && filteredShops.length > 0) {
      // Clear existing markers
      markerClusterGroupRef.current.clearLayers();

      // Add new markers
      filteredShops.forEach((shop) => {
        const marker = L.marker([shop.lat, shop.lng], {
          icon: createCustomIcon(shop.logo, false),
        });

        marker.bindPopup(`
          <div class="text-center">
            <h3 class="font-semibold text-gray-900">${shop.name}</h3>
            <p class="text-sm text-gray-500">${shop.address}</p>
          </div>
        `);

        marker.on("click", () => handleShopSelect(shop));
        marker.on("mouseover", () => marker.openPopup());
        marker.on("mouseout", () => marker.closePopup());

        markerClusterGroupRef.current?.addLayer(marker);
      });
    }
  }, [filteredShops, handleShopSelect]);

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return null;
    const [t1, t2] = [touches[0], touches[1]];
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
  };

  const handleNearbyTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = getTouchDistance(e.touches);
      if (dist) {
        pinchStartDistanceRef.current = dist;
        setIsPinchingNearbyPanel(true);
      }
    }
  };

  const handleNearbyTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistanceRef.current) {
      const dist = getTouchDistance(e.touches);
      if (!dist) return;
      const rawScale = dist / pinchStartDistanceRef.current;
      const clampedScale = Math.min(Math.max(rawScale, 0.9), 1.2);
      setNearbyPanelScale(clampedScale);
    }
  };

  const handleNearbyTouchEnd = () => {
    pinchStartDistanceRef.current = null;
    setIsPinchingNearbyPanel(false);
    setNearbyPanelScale(1);
  };

  return (
    <>
      {/* Intro Page Loader */}
      <PageLoader isLoading={showIntro} />

      <div className="min-h-dvh h-dvh w-full flex flex-col bg-gray-50 overflow-hidden">
        {/* Map Container */}
        <div ref={mapContainerRef} className="flex-1 relative overflow-hidden">
          {/* Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          <Footer />

          {/* Leaflet Map */}
          <MapContainer id="map-container" center={mapCenter} zoom={14} className="h-full w-full z-0" zoomControl={false} attributionControl={false} maxZoom={23}>
            <MapController userLocation={userLocation} mapCenter={mapCenter} onMapReady={handleMapReady} />

            {activeLayer === "satellite" ? (
              <LayerGroup>
                <TileLayer attribution="Tiles &copy; Esri" className="z-0 filter grayscale contrast-125 brightness-75" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <TileLayer
                  className="z-0 text-black filter invert grayscale brightness-200 contrast-200"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                  maxNativeZoom={23}
                  maxZoom={23}
                />
              </LayerGroup>
            ) : (
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            )}

            {/* User Location Marker */}
            {userLocation && (
              <>
                <Circle center={userLocation} radius={50} pathOptions={{ color: "#ffffff", fillColor: "#ffffff", fillOpacity: 0.2, weight: 2 }} />
                <Marker position={userLocation} icon={userLocationIcon}>
                  <Popup>
                    <div className="min-w-[200px] max-w-[280px]">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">Lokasi Anda</h3>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-normal">{userLocationName || "Memuat alamat..."}</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Route Polyline */}
            {routeCoordinates && routeCoordinates.length > 0 && (
              <>
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: "#3b82f6",
                    weight: 5,
                    opacity: 0.8,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                {/* Route Info Marker - follows visible route on map pan */}
                {routeInfo && <RouteInfoMarker routeCoordinates={routeCoordinates} routeInfo={routeInfo} onClear={clearRoute} />}
              </>
            )}
          </MapContainer>

          {/* Left Attribution (Vertical) */}
          <div className="absolute left-0 top-1/2 z-1000 -translate-y-1/2 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLayer}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white/80 backdrop-blur-sm py-1.5 px-0.5 rounded-r shadow-sm border border-l-0 border-gray-200 text-[8px] text-gray-500 font-medium select-none pointer-events-auto hover:bg-white transition-colors"
                style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
                {activeLayer === "satellite" ? "Tiles © Esri — Source: Esri" : "© OpenStreetMap contributors"}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Map Controls */}
          <MapControls
            activeLayer={activeLayer}
            onLayerChange={() => setActiveLayer((prev) => (prev === "satellite" ? "street" : "satellite"))}
            onGuideOpen={() => setShowGuide(true)}
            onRecenter={handleRecenter}
            onLocationClick={handleGetUserLocation}
            onBookmarkClick={() => setIsFavoritesDrawerOpen(true)}
            onFilterClick={() => {
              // Coming Soon toast
              const toast = document.createElement("div");
              toast.className = "fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in";
              toast.innerHTML = `
                <div class="flex items-center gap-2">
                  <span>🔧 Filter feature coming soon!</span>
                </div>
              `;
              document.body.appendChild(toast);
              setTimeout(() => {
                toast.remove();
              }, 3000);
            }}
            isLocating={isLocating}
            isOpen={controlsOpen}
            onOpenChange={setControlsOpen}
          />

          {/* Location Error Toast */}
          <AnimatePresence>
            {locationError && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-1000"
                onClick={() => setLocationError(null)}>
                {locationError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nearby Coffee Shops Panel - Draggable */}
          <AnimatePresence>
            {showNearbyPanel && nearbyShops.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: nearbyPanelScale, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                drag={!isPinchingNearbyPanel}
                dragConstraints={mapContainerRef}
                dragMomentum={true}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                whileDrag={{ scale: 1.03, boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}
                style={{ scale: nearbyPanelScale }}
                onTouchStart={handleNearbyTouchStart}
                onTouchMove={handleNearbyTouchMove}
                onTouchEnd={handleNearbyTouchEnd}
                onTouchCancel={handleNearbyTouchEnd}
                className="absolute left-4 top-24 z-1000 w-72 sm:w-80 bg-white/40 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y touch-pinch-zoom">
                {/* Header - Black */}
                <div className="p-3 bg-black text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span className="font-semibold text-sm">Coffee Shop Terdekat</span>
                    </div>
                    <button onClick={() => setShowNearbyPanel(false)} className="text-white/70 hover:text-white text-lg leading-none transition-colors">
                      ×
                    </button>
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">Drag untuk pindahkan</p>
                </div>

                {/* List */}
                <div className="max-h-64 sm:max-h-72 overflow-y-auto bg-white/60">
                  {nearbyShops.map((shop, index) => (
                    <motion.button
                      key={shop.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                      onClick={() => {
                        handleShopSelect(shop);
                        setShowNearbyPanel(false);
                        if (mapRef.current) {
                          mapRef.current.setView([shop.lat, shop.lng], 17, { animate: true });
                        }
                      }}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.05)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-3 py-2.5 text-left border-b border-black/10 last:border-b-0 transition-colors flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-white/80 shrink-0 shadow-sm">
                        {shop.logo ? <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">☕</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{shop.name}</h4>
                        <p className="text-xs text-gray-600 truncate">{shop.address}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-black">{shop.distance < 1 ? `${Math.round(shop.distance * 1000)} m` : `${shop.distance.toFixed(1)} km`}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Footer />

          {/* Search Results Dropdown */}
          {searchQuery && filteredShops.length > 0 && (
            <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-1001">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {filteredShops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => {
                      handleShopSelect(shop);
                      setSearchQuery("");
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors">
                    <h4 className="font-medium text-gray-900">{shop.name}</h4>
                    <p className="text-sm text-gray-500">{shop.address}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Guide Step Component */}
        <GuideStep isOpen={showGuide} onClose={() => setShowGuide(false)} onStepChange={handleStepChange} />

        {/* Coffee Shop Detail Drawer */}
        <DetailDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          selectedShop={selectedShop}
          onGetRoute={getRoute}
          isLoadingRoute={isLoadingRoute}
          onToggleFavorite={toggleFavorite}
          isFavorited={isFavorited}
          canUseEssentialCookies={canUseEssentialCookies}
          favoritesLoading={favoritesLoading}
        />

        {/* Favorites Drawer */}
        <FavoritesDrawer
          isOpen={isFavoritesDrawerOpen}
          onOpenChange={setIsFavoritesDrawerOpen}
          favorites={coffeeShops.filter((shop) => favorites.includes(shop.id))}
          onShopSelect={(shop) => {
            setSelectedShop(shop);
            setIsDrawerOpen(true);
            setIsFavoritesDrawerOpen(false);
          }}
          onRemoveFavorite={toggleFavorite}
        />
      </div>
    </>
  );
};

export default Maps;
