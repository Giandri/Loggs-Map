"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Wifi, ChevronRight, ChevronLeft, MessageCircle, ExternalLink, Coffee, Percent, Signal, Home, Car, CreditCard, Instagram, Bookmark, Laptop } from "lucide-react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

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
  videoUrl?: string;
  videoPlatform?: string;
}

interface DetailDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedShop: CoffeeShop | null;
  onGetRoute: (destination: { lat: number; lng: number }) => void;
  isLoadingRoute: boolean;
  onToggleFavorite: (shopId: string) => Promise<boolean>;
  isFavorited: (shopId: string) => boolean;
  canUseEssentialCookies: boolean;
  favoritesLoading: boolean;
}

const DetailDrawer = ({ isOpen, onOpenChange, selectedShop, onGetRoute, isLoadingRoute, onToggleFavorite, isFavorited, canUseEssentialCookies, favoritesLoading }: DetailDrawerProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Function to open Instagram with deep linking
  const openInstagram = (instagramUrl: string) => {
    try {
      let username = "";

      // Extract username from various Instagram URL formats
      if (instagramUrl.includes("instagram.com/")) {
        // Handle full URL: https://www.instagram.com/username/ or https://instagram.com/username/
        const match = instagramUrl.match(/instagram\.com\/([^\/\?]+)/);
        if (match) {
          username = match[1];
        }
      } else if (instagramUrl.startsWith("@")) {
        // Handle @username format
        username = instagramUrl.substring(1);
      } else if (!instagramUrl.includes("/") && !instagramUrl.includes(".")) {
        // Handle plain username
        username = instagramUrl;
      }

      if (username) {
        // Try to open Instagram app first (mobile deep link)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);

        if (isIOS || isAndroid) {
          // Mobile: Try app first, fallback to web
          const appUrl = `instagram://user?username=${username}`;
          const webUrl = `https://www.instagram.com/${username}/`;

          // For iOS
          if (isIOS) {
            window.location.href = appUrl;
            // If app doesn't open within 1 second, fallback to web
            setTimeout(() => {
              window.open(webUrl, "_blank");
            }, 1000);
          }
          // For Android
          else if (isAndroid) {
            // Use intent URL for Android
            const intentUrl = `intent://instagram.com/_u/${username}/#Intent;package=com.instagram.android;scheme=https;end`;
            window.location.href = intentUrl;
            // Fallback to web
            setTimeout(() => {
              window.open(webUrl, "_blank");
            }, 1000);
          }
        } else {
          // Desktop: Open web version
          window.open(`https://www.instagram.com/${username}/`, "_blank");
        }
      } else {
        // If we can't parse the username, just open the original URL
        window.open(instagramUrl, "_blank");
      }
    } catch (error) {
      console.error("Error opening Instagram:", error);
      // Fallback: just open the original URL
      window.open(instagramUrl, "_blank");
    }
  };

  const nextImage = () => {
    try {
      if (selectedShop?.photos && selectedShop.photos.length > 0) {
        setCurrentImageIndex((prev) => (prev === selectedShop.photos.length - 1 ? 0 : prev + 1));
      }
    } catch (err) {
      console.error("Error navigating to next image:", err);
      setError("Error loading images");
    }
  };

  const prevImage = () => {
    try {
      if (selectedShop?.photos && selectedShop.photos.length > 0) {
        setCurrentImageIndex((prev) => (prev === 0 ? selectedShop.photos.length - 1 : prev - 1));
      }
    } catch (err) {
      console.error("Error navigating to previous image:", err);
      setError("Error loading images");
    }
  };

  // Don't render if no shop is selected
  if (!selectedShop) {
    return null;
  }

  // Show error state if there's an error
  if (error) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md z-1002 max-h-[85vh] overflow-y-auto md:max-h-[80vh] md:overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle className="text-xl text-white">Error</DrawerTitle>
              <DrawerDescription className="text-white text-sm">{error}</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <button onClick={() => setError(null)} className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors">
                Close
              </button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div
          className="mx-auto w-full max-w-md z-1002 max-h-[85vh] overflow-y-auto md:max-h-[80vh] md:overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "transparent transparent",
          }}>
          <DrawerHeader>
            <DrawerTitle className="text-xl text-white">{selectedShop?.name}</DrawerTitle>
            <DrawerDescription className="flex items-center text-white text-[10px] gap-3">
              <MapPin className="w-6 h-6" />
              {selectedShop?.address}
            </DrawerDescription>
          </DrawerHeader>

          {/* Image Carousel */}
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
            {/* Use photos if available, otherwise use dummy images */}
            {(() => {
              const images =
                selectedShop?.photos && selectedShop.photos.length > 0 ? selectedShop.photos : ["/api/placeholder/400/300?text=Cafe+Interior", "/api/placeholder/400/300?text=Coffee+Menu", "/api/placeholder/400/300?text=Outdoor+Seating"];

              return (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${selectedShop?.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/400/300?text=Image+Not+Found";
                    }}
                  />

                  {/* Navigation Buttons */}
                  {images.length > 1 && (
                    <>
                      <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Image Indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {images.map((_, index) => (
                        <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`} />
                      ))}
                    </div>
                  )}

                  {/* Image Counter */}
                  {images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}

                  {/* Show indicator if using dummy images */}
                  {(!selectedShop?.photos || selectedShop.photos.length === 0) && <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">Preview Images</div>}
                </>
              );
            })()}
          </div>

          <div className="p-4 pb-0 space-y-4">
            {/* WFC Card */}
            {selectedShop?.wfc &&
              (() => {
                const speedValue = selectedShop.connectionSpeed ? parseFloat(selectedShop.connectionSpeed.replace(/[^\d.]/g, "")) : 0;
                const isSlowConnection = speedValue < 75;

                return (
                  <div className={`bg-white/60 border rounded-xl p-3 ${isSlowConnection ? "border-red-400" : "border-green-400"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-md ${isSlowConnection ? "bg-red-600 shadow-red-500/30" : "bg-green-600 shadow-emerald-500/30"}`}>
                        <Laptop className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${isSlowConnection ? "text-red-600" : "text-green-600"}`}>{isSlowConnection ? "Sinyal Lemot" : "Cocok Buat WFC n Mabar"}</p>
                        <p className={`text-xs ${isSlowConnection ? "text-red-600/60" : "text-green-600/60"}`}>{isSlowConnection ? "Sinyal kurang" : "Sinyal bagus"}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs ${isSlowConnection ? "text-red-600" : "text-green-600"}`}>Speed</p>
                        <p className={`text-sm font-bold ${isSlowConnection ? "text-red-600" : "text-green-600"}`}>{selectedShop?.connectionSpeed || "Burik"}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Hours */}
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-white/60 mt-0.5" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Hours</p>
                  <p className="text-xs font-medium text-white">
                    {selectedShop?.operatingDays || "Everyday"}: {selectedShop?.openTime || "08:00"} - {selectedShop?.closeTime || "22:00"}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-start gap-2">
                <Coffee className="w-4 h-4 text-white/60 mt-0.5" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Price</p>
                  <p className="text-xs font-medium text-white">{selectedShop?.priceRange || "Start From 20K"}</p>
                </div>
              </div>

              {/* Service/Tax */}
              <div className="flex items-start gap-2">
                <Percent className="w-4 h-4 text-white/60 mt-0.5" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Tax</p>
                  <p className="text-xs font-medium text-white">{selectedShop?.serviceTax || "No Tax"}</p>
                </div>
              </div>

              {/* Connection */}
              <div className="flex items-start gap-2">
                <Signal className="w-4 h-4 text-white/60 mt-0.5" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">WiFi</p>
                  <p className="text-xs font-medium text-white">{selectedShop?.connectionSpeed || (selectedShop?.wfc ? "Available" : "N/A")}</p>
                </div>
              </div>

              {/* Mushola */}
              <div className="flex items-start gap-2">
                <Home className="w-4 h-4 text-white/60 mt-0.5" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Mushola</p>
                  <p className="text-xs font-medium text-white">{selectedShop?.mushola ? "Available" : "N/A"}</p>
                </div>
              </div>

              {/* Parking */}
              <div className="flex items-start gap-2">
                <Car className="w-4 h-4 text-white/60 mt-0.5" />
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wide">Parking</p>
                  <div className="flex gap-1.5">
                    {selectedShop?.parking && selectedShop.parking.length > 0 ? (
                      selectedShop.parking.map((type) => (
                        <span key={type} className="text-xs text-white">
                          {type === "motorcycle" && "🏍️"}
                          {type === "car" && "🚗"}
                          {type === "bicycle" && "🚲"}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/50">N/A</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-white/60 mt-0.5" />
              <div>
                <p className="text-[10px] text-white/60 uppercase tracking-wide mb-1">Payment</p>
                <div className="flex gap-2">
                  {selectedShop?.paymentMethods && selectedShop.paymentMethods.length > 0 ? (
                    selectedShop.paymentMethods
                      .filter((m) => m === "cash" || m === "cashless")
                      .map((method) => (
                        <span key={method} className="flex items-center gap-1 text-xs text-white">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                          {method === "cash" ? "Cash" : "Cashless"}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-white/50">Cash Only</span>
                  )}
                </div>
              </div>
            </div>

            {/* Facilities */}
            {selectedShop?.facilities && selectedShop.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedShop.facilities.map((facility: string, index: number) => (
                  <span key={index} className="text-[10px] text-white bg-white/20 px-2 py-0.5 rounded-full capitalize">
                    {facility.replace(/-/g, " ")}
                  </span>
                ))}
              </div>
            )}

            {/* Social Links */}
            <div className="flex gap-2">
              {selectedShop?.instagram && (
                <button onClick={() => openInstagram(selectedShop.instagram!)} className="flex items-center gap-1 text-xs text-white bg-pink-500/80 px-3 py-1.5 rounded-full hover:bg-pink-500 transition">
                  <Instagram className="w-3.5 h-3.5" />
                  Instagram
                </button>
              )}
              <a
                href={`https://www.google.com/maps?q=${selectedShop?.lat},${selectedShop?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-white bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition">
                <ExternalLink className="w-3.5 h-3.5" />
                Google Maps
              </a>
            </div>
          </div>

          <DrawerFooter>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://wa.me/${selectedShop?.whatsapp?.replace(/[^0-9]/g, "")}?text=Halo, saya ingin pesan`}
                className="bg-green-600 text-white py-3 px-3 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1.5 text-sm">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <motion.button
                whileTap={{ scale: canUseEssentialCookies ? 0.95 : 1 }}
                onClick={async () => {
                  if (selectedShop && canUseEssentialCookies) {
                    await onToggleFavorite(selectedShop.id);
                  }
                }}
                disabled={favoritesLoading || !canUseEssentialCookies}
                className={`py-3 px-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5 text-sm disabled:opacity-50 ${
                  !canUseEssentialCookies ? "bg-gray-500 text-gray-300 cursor-not-allowed" : selectedShop && isFavorited(selectedShop.id) ? "bg-yellow-500 text-black hover:bg-yellow-600" : "bg-white/20 text-white hover:bg-white/30"
                }`}>
                <Bookmark className={`w-4 h-4 ${selectedShop && isFavorited(selectedShop.id) && canUseEssentialCookies ? "fill-current" : ""}`} />
                {!canUseEssentialCookies ? "Perlu Consent" : favoritesLoading ? "..." : "Favorit"}
              </motion.button>
              <button
                onClick={() => {
                  if (selectedShop) {
                    onGetRoute({ lat: selectedShop.lat, lng: selectedShop.lng });
                    onOpenChange(false);
                  }
                }}
                disabled={isLoadingRoute}
                className="bg-black text-white py-3 px-3 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5 text-sm disabled:opacity-50">
                {isLoadingRoute ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Navigation className="w-4 h-4" />}
                {isLoadingRoute ? "Memuat..." : "Rute"}
              </button>
            </div>
            <DrawerClose asChild>
              <button className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors">Tutup</button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DetailDrawer;
