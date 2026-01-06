"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Home,
  PlusCircle,
  MinusCircle,
  MapPin,
  Calendar,
  Eye,
  Thermometer,
  Heart,
  HelpCircle,
  Clock,
  Wifi,
  MessageCircle,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Instagram,
  CreditCard,
  Car,
  ExternalLink,
  Coffee,
  ArrowDown,
  ArrowUp,
  Menu,
  Percent,
  Signal,
  ParkingCircle,
  Edit3,
  X,
  Save,
  Loader2,
  Trash2,
  Upload,
  Camera,
} from "lucide-react";
import PillNav from "@/components/ui/pill-nav";
import { useCoffeeShops } from "@/hooks/useCoffeeShops";
import { useRouter } from "next/navigation";
import { LogOut, EyeOff, AlertCircle } from "lucide-react";

// Types
interface PropertyData {
  houseNumber: number;
  price: number;
  avgAge: string;
}

interface LocationMarker {
  lat: number;
  lng: number;
  color: string;
}

// Extend Window interface for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

// Custom marker generator for dashboard
const createCustomMarkerIcon = (shop: any, isSelected: boolean) => {
  const logoUrl = shop.logo || "/api/placeholder/40/40?text=C"; // Default coffee icon if no logo

  return (window as any).L.divIcon({
    className: "custom-marker",
    html: `
      <div class="
        relative flex items-center justify-center
        transition-all duration-300 ease-out pointer-events-auto
        ${isSelected ? "w-16 h-16" : "w-12 h-12 hover:w-14 hover:h-14"}
      ">
        <div class="
          relative w-full h-full rounded-full shadow-xl
          flex items-center justify-center overflow-hidden
          border-2 border-white
          ${isSelected ? "bg-white" : "bg-white"}
        ">
          <img
            src="${logoUrl}"
            alt="${shop.name}"
            class="w-full h-full object-cover rounded-full"
            onerror="this.src='/api/placeholder/40/40?text=C'"
          />
          ${isSelected ? '<div class="absolute -inset-2 bg-orange-400/30 rounded-full animate-ping z-[-1]"></div>' : ""}
        </div>
        <!-- Arrow at bottom -->
        <div class="
          absolute -bottom-1 left-1/2 -translate-x-1/2
          w-3 h-3 rotate-45 border-r border-b border-white
          bg-white
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 50],
    popupAnchor: [0, -55],
  });
};

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

interface SimpleCoffeeShop {
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
}

const RealEstateDashboard: React.FC = () => {
  const [map, setMap] = useState<any>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]); // Track markers for cleanup
  const { coffeeShops, loading, refreshCoffeeShops } = useCoffeeShops();
  const [selectedCoffeeShop, setSelectedCoffeeShop] = useState<SimpleCoffeeShop | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Login states
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/check", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        setPassword("");
      } else {
        setLoginError(data.error || "Login failed");
      }
    } catch (error) {
      setLoginError("Network error. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Edit Drawer State
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    whatsapp: "",
    instagram: "",
    openTime: "",
    closeTime: "",
    operatingDays: "",
    priceRange: "",
    serviceTax: "",
    connectionSpeed: "",
    wfc: false,
    mushola: false,
    parking: [] as string[],
    paymentMethods: [] as string[],
    facilities: [] as string[],
    lat: 0,
    lng: 0,
  });

  // Edit Logo and Photos State
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editPhotoPreviews, setEditPhotoPreviews] = useState<string[]>([]);
  const [editPhotoFiles, setEditPhotoFiles] = useState<Array<{ file: File; url?: string; isNew: boolean }>>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);

  // Open edit drawer with selected coffee shop data
  const openEditDrawer = () => {
    if (selectedCoffeeShop) {
      setEditFormData({
        name: selectedCoffeeShop.name || "",
        address: selectedCoffeeShop.address || "",
        whatsapp: selectedCoffeeShop.whatsapp || "",
        instagram: selectedCoffeeShop.instagram || "",
        openTime: selectedCoffeeShop.openTime || "",
        closeTime: selectedCoffeeShop.closeTime || "",
        operatingDays: selectedCoffeeShop.operatingDays || "",
        priceRange: selectedCoffeeShop.priceRange || "",
        serviceTax: selectedCoffeeShop.serviceTax || "",
        connectionSpeed: selectedCoffeeShop.connectionSpeed || "",
        wfc: selectedCoffeeShop.wfc || false,
        mushola: selectedCoffeeShop.mushola || false,
        parking: selectedCoffeeShop.parking || [],
        paymentMethods: selectedCoffeeShop.paymentMethods || [],
        facilities: selectedCoffeeShop.facilities || [],
        lat: selectedCoffeeShop.lat || 0,
        lng: selectedCoffeeShop.lng || 0,
      });

      // Initialize logo and photos
      setEditLogoPreview(selectedCoffeeShop.logo || null);
      setEditLogoFile(null);
      setEditPhotoPreviews(selectedCoffeeShop.photos || []);
      setEditPhotoFiles([]);
      setPhotosToDelete([]);

      setIsEditDrawerOpen(true);
    }
  };

  // Handle form input change
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle checkbox array (parking, payment, facilities)
  const handleCheckboxArrayChange = (field: "parking" | "paymentMethods" | "facilities", value: string) => {
    setEditFormData((prev) => {
      const currentArray = prev[field];
      if (currentArray.includes(value)) {
        return { ...prev, [field]: currentArray.filter((item) => item !== value) };
      } else {
        return { ...prev, [field]: [...currentArray, value] };
      }
    });
  };

  // Handle edit logo upload
  const handleEditLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran logo maksimal 2MB");
        return;
      }
      setEditLogoFile(file);
      setEditLogoPreview(URL.createObjectURL(file));
    }
  };

  // Handle edit photo upload
  const handleEditPhotoUpload = async (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validImages = newFiles.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== newFiles.length) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }

    // Check total limit (existing photos + new photos - photos to delete)
    const currentPhotosCount = selectedCoffeeShop?.photos?.length || 0;
    const remainingPhotos = currentPhotosCount - photosToDelete.length;
    const totalCount = remainingPhotos + editPhotoFiles.length + validImages.length;

    if (totalCount > 5) {
      alert("Maksimal 5 gambar diperbolehkan");
      return;
    }

    try {
      // Upload each file to Vercel Blob
      const uploadPromises = validImages.map(async (file, index) => {
        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const uniqueFilename = `edit_photo_${timestamp}_${index}_${cleanName}`;

        console.log("Uploading edit photo:", uniqueFilename);

        const response = await fetch(`/api/upload?filename=${encodeURIComponent(uniqueFilename)}`, {
          method: "POST",
          body: file,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload failed:", errorText);
          throw new Error(`Upload failed for ${file.name}`);
        }

        const result = await response.json();
        console.log("Edit photo upload result:", result);

        return {
          file,
          url: result.url,
          isNew: true,
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      console.log("All edit photo uploads complete:", uploadResults);

      // Update state with uploaded images
      const newEditPhotoFiles = [...editPhotoFiles, ...uploadResults];
      const newEditPhotoPreviews = [...editPhotoPreviews, ...uploadResults.map((r) => r.url)];

      setEditPhotoFiles(newEditPhotoFiles.slice(0, 5));
      setEditPhotoPreviews(newEditPhotoPreviews.slice(0, 5));

      console.log("Edit photo previews updated:", newEditPhotoPreviews);
    } catch (error) {
      console.error("Edit photo upload error:", error);
      alert("Gagal upload gambar. Silakan coba lagi.");
    }
  };

  // Remove edit photo
  const removeEditPhoto = (index: number, isExistingPhoto: boolean = false, photoUrl?: string) => {
    if (isExistingPhoto && photoUrl) {
      // Mark existing photo for deletion
      setPhotosToDelete((prev) => [...prev, photoUrl]);
    }

    const newFiles = editPhotoFiles.filter((_, i) => i !== index);
    const newPreviews = editPhotoPreviews.filter((_, i) => i !== index);

    setEditPhotoFiles(newFiles);
    setEditPhotoPreviews(newPreviews);
  };

  // Handle update submit
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoffeeShop) return;

    setIsUpdating(true);
    try {
      let finalLogoUrl = selectedCoffeeShop.logo;
      let finalPhotoUrls = selectedCoffeeShop.photos || [];
      const filesToDelete: string[] = [];

      // Handle logo upload
      if (editLogoFile) {
        const logoResponse = await fetch(`/api/upload?filename=logo_edit_${selectedCoffeeShop.id}_${Date.now()}`, {
          method: "POST",
          body: editLogoFile,
        });

        if (logoResponse.ok) {
          const logoResult = await logoResponse.json();
          finalLogoUrl = logoResult.url;

          // Mark old logo for deletion if it exists and is from Vercel Blob
          if (selectedCoffeeShop.logo && selectedCoffeeShop.logo.includes("vercel-storage.com")) {
            // Extract pathname from Vercel Blob URL
            const url = new URL(selectedCoffeeShop.logo);
            const pathname = url.pathname;
            filesToDelete.push(pathname);
          }
        } else {
          console.warn("Logo upload failed, keeping existing logo");
        }
      }

      // Handle photos marked for deletion
      finalPhotoUrls = finalPhotoUrls.filter((url) => !photosToDelete.includes(url));

      // Mark deleted photos for file deletion
      photosToDelete.forEach((url) => {
        if (url.includes("vercel-storage.com")) {
          try {
            const blobUrl = new URL(url);
            const pathname = blobUrl.pathname;
            filesToDelete.push(pathname);
          } catch (error) {
            console.warn("Could not parse photo URL for deletion:", url);
          }
        }
      });

      // Add new uploaded photos
      const newPhotoUrls = editPhotoFiles.filter((file) => file.url).map((file) => file.url!);
      finalPhotoUrls = [...finalPhotoUrls, ...newPhotoUrls].slice(0, 5); // Ensure max 5 photos

      // Delete old files from Vercel Blob
      if (filesToDelete.length > 0) {
        console.log("Deleting old files from Vercel Blob:", filesToDelete);
        try {
          const deletePromises = filesToDelete.map((pathname) =>
            fetch(`/api/upload?pathname=${encodeURIComponent(pathname)}`, {
              method: "DELETE",
            })
          );
          const deleteResults = await Promise.allSettled(deletePromises);
          deleteResults.forEach((result, index) => {
            if (result.status === "rejected") {
              console.warn(`Failed to delete file: ${filesToDelete[index]}`, result.reason);
            } else {
              console.log(`Successfully deleted file: ${filesToDelete[index]}`);
            }
          });
        } catch (error) {
          console.error("Error deleting old files:", error);
          // Continue with update even if deletion fails
        }
      }

      const updateData = {
        ...editFormData,
        lat: parseFloat(String(editFormData.lat)),
        lng: parseFloat(String(editFormData.lng)),
        photos: finalPhotoUrls,
        logo: finalLogoUrl,
      };

      const response = await fetch(`/api/coffee-shops/${selectedCoffeeShop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        await refreshCoffeeShops();
        setIsEditDrawerOpen(false);

        // Update selected coffee shop with new data
        setSelectedCoffeeShop((prev) =>
          prev
            ? {
                ...prev,
                ...editFormData,
                photos: finalPhotoUrls,
                logo: finalLogoUrl,
              }
            : null
        );

        // Reset edit states
        setEditLogoPreview(null);
        setEditLogoFile(null);
        setEditPhotoPreviews([]);
        setEditPhotoFiles([]);
        setPhotosToDelete([]);

        alert("Coffee shop berhasil diupdate!");
      } else {
        const error = await response.json();
        alert(`Gagal update: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating:", error);
      alert("Gagal update coffee shop");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Clean up map instance before logout
        if (map) {
          map.remove();
          setMap(null);
        }

        // Reset all dashboard states
        setIsAuthenticated(false);
        setPassword("");
        setLoginError("");
        setSelectedCoffeeShop(null);
        setCurrentImageIndex(0);

        // Reset edit states
        setIsEditDrawerOpen(false);
        setIsUpdating(false);
        setIsDeleting(false);
        setEditFormData({
          name: "",
          address: "",
          whatsapp: "",
          instagram: "",
          openTime: "",
          closeTime: "",
          operatingDays: "",
          priceRange: "",
          serviceTax: "",
          connectionSpeed: "",
          wfc: false,
          mushola: false,
          parking: [] as string[],
          paymentMethods: [] as string[],
          facilities: [] as string[],
          lat: 0,
          lng: 0,
        });

        // Reset file manager states
        setShowFileManager(false);
        setUploadedFiles([]);
        setIsLoadingFiles(false);
        setIsDeletingFile(null);
      } else {
        alert("Failed to logout. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Handle delete coffee shop
  const handleDeleteCoffeeShop = async () => {
    if (!selectedCoffeeShop) return;

    const confirmDelete = window.confirm(`Apakah kamu yakin ingin menghapus "${selectedCoffeeShop.name}"?\n\nData yang dihapus tidak bisa dikembalikan.`);

    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/coffee-shops/${selectedCoffeeShop.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await refreshCoffeeShops();
        setIsEditDrawerOpen(false);
        setSelectedCoffeeShop(null);
        alert("Coffee shop berhasil dihapus!");
      } else {
        const error = await response.json();
        alert(`Gagal hapus: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Gagal hapus coffee shop");
    } finally {
      setIsDeleting(false);
    }
  };

  // Update markers when coffee shops data changes
  useEffect(() => {
    if (map && leafletLoaded) {
      // Clear existing markers
      markersRef.current.forEach((marker) => {
        map.removeLayer(marker);
      });
      markersRef.current = [];

      // Add new markers
      coffeeShops.forEach((shop: any) => {
        const isSelected = selectedCoffeeShop?.id === shop.id;
        const icon = createCustomMarkerIcon(shop, isSelected);
        const marker = (window as any).L.marker([shop.lat, shop.lng], { icon }).addTo(map);

        // Track marker for cleanup
        markersRef.current.push(marker);

        // Add click handler to select coffee shop
        marker.on("click", () => {
          const simpleShop: SimpleCoffeeShop = {
            id: shop.id,
            name: shop.name,
            address: shop.address,
            lat: shop.lat,
            lng: shop.lng,
            whatsapp: shop.whatsapp,
            instagram: shop.instagram,
            facilities: shop.facilities,
            photos: shop.photos,
            logo: shop.logo,
            wfc: shop.wfc,
            openTime: shop.openTime,
            closeTime: shop.closeTime,
            operatingDays: shop.operatingDays,
            priceRange: shop.priceRange,
            serviceTax: shop.serviceTax,
            connectionSpeed: shop.connectionSpeed,
            mushola: shop.mushola,
            parking: shop.parking,
            paymentMethods: shop.paymentMethods,
          };
          setSelectedCoffeeShop(simpleShop);
          setCurrentImageIndex(0); // Reset to first image
        });

        // Add popup with shop name and selection status
        marker.bindPopup(`
          <div class="text-center">
            <h3 class="font-semibold text-gray-900">${shop.name}</h3>
            <p class="text-sm text-gray-500">${shop.address}</p>
            <p class="text-sm ${shop.wfc ? "text-green-600" : "text-gray-600"}">${shop.wfc ? "Bisa WFC" : "Tidak WFC"}</p>
            <button class="mt-2 px-3 py-1 ${isSelected ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-500 hover:bg-blue-600"} text-white text-xs rounded transition-colors">
              ${isSelected ? "Dipilih" : "Pilih Coffee Shop"}
            </button>
          </div>
        `);
      });
    }
  }, [map, coffeeShops, selectedCoffeeShop, leafletLoaded]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData>({
    houseNumber: 15,
    price: 4954380,
    avgAge: "5Y",
  });

  // File Management State
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isDeletingFile, setIsDeletingFile] = useState<string | null>(null);
  const [showFileManager, setShowFileManager] = useState(false);

  // Load uploaded files
  const loadUploadedFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch("/api/upload");
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data.files);
      } else {
        console.error("Failed to load files");
      }
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Delete file
  const deleteFile = async (pathname: string, url: string) => {
    setIsDeletingFile(pathname);
    try {
      const response = await fetch(`/api/upload?pathname=${encodeURIComponent(pathname)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove from local state
        setUploadedFiles((prev) => prev.filter((file) => file.pathname !== pathname));
        alert("File berhasil dihapus!");
      } else {
        const error = await response.json();
        alert(`Gagal hapus file: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Gagal hapus file");
    } finally {
      setIsDeletingFile(null);
    }
  };

  const pillNavItems = [
    { id: "home", icon: <Home size={20} />, label: "Home" },
    { id: "zoom-in", icon: <PlusCircle size={20} />, label: "Add Coffee Shop" },
    { id: "zoom-out", icon: <MinusCircle size={20} />, label: "Hapus Coffee Shop" },
    { id: "location", icon: <MapPin size={20} />, label: "Location" },
    { id: "files", icon: <Eye size={20} />, label: "File Manager" },
  ];

  useEffect(() => {
    // Load Leaflet dynamically to avoid SSR issues
    const loadLeaflet = async () => {
      try {
        // Load CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css";
        document.head.appendChild(link);

        // Load Leaflet JS dynamically
        const L = await import("leaflet");

        // Make L available globally for other parts of the code
        (window as any).L = L.default || L;

        setLeafletLoaded(true);
      } catch (error) {
        console.error("Failed to load Leaflet:", error);
      }
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []); // Only initialize map once

  // Initialize map when Leaflet is loaded (always, for preview)
  useEffect(() => {
    if (leafletLoaded && !map) {
      initMap();
    }
  }, [leafletLoaded]);

  const initMap = (): void => {
    if (!leafletLoaded || !(window as any).L || !mapRef.current) return;

    const L = (window as any).L;
    // Pangkalpinang coordinates
    const mapInstance = L.map("map", { zoomControl: false }).setView([-2.1316, 106.1166], 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(mapInstance);

    // Markers will be added by the useEffect hook

    setMap(mapInstance);
  };

  return (
    <div className="relative h-screen w-full">
      {/* Map Background - SELALU ada untuk preview */}
      <div id="map" ref={mapRef} className="absolute inset-0 w-full h-full z-0"></div>

      {/* Left Sidebar Overlay */}
      <div className="absolute left-0 top-0 h-full w-20 z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl overflow-hidden absolute top-5">
          <img src="/images/loggs logo.png" alt="Logo" className="w-12 h-12 object-contain" />
        </div>
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center space-y-8">
          <PillNav
            items={pillNavItems}
            defaultActive="home"
            className="flex flex-col items-center justify-center"
            onRefreshData={refreshCoffeeShops}
            selectedCoffeeShop={selectedCoffeeShop}
            onCoffeeShopSelect={setSelectedCoffeeShop}
            onItemClick={(itemId) => {
              if (itemId === "files") {
                setShowFileManager(true);
                loadUploadedFiles();
              }
            }}
          />

          {/* Logout Button */}
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 px-1 py-1.5 bg-black text-white border border-black rounded-sm hover:bg-red-600 hover:border-red-700 active:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-[10px]">
              {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-6 h-6" />}
              {!isLoggingOut}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel Overlay - Synced with Database */}
      <div className="absolute right-0 top-0 h-full w-[480px] z-40 bg-white border-l border-gray-100 overflow-y-auto">
        {selectedCoffeeShop && (
          <div className="p-5">
            {/* Header with Edit Button */}
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">{selectedCoffeeShop.name}</h2>
              <button onClick={openEditDrawer} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Edit Coffee Shop">
                <Edit3 className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 text-gray-500 mb-4">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-sm">{selectedCoffeeShop.address}</p>
            </div>

            {/* Image Carousel */}
            <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden mb-4">
              {(() => {
                const images = selectedCoffeeShop.photos && selectedCoffeeShop.photos.length > 0 ? selectedCoffeeShop.photos : ["/api/placeholder/400/300?text=No+Image"];
                return (
                  <>
                    <img
                      src={images[currentImageIndex]}
                      alt={selectedCoffeeShop.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/api/placeholder/400/300?text=No+Image";
                      }}
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full hover:bg-white transition shadow-sm">
                          <ChevronLeft className="w-4 h-4 text-gray-700" />
                        </button>
                        <button
                          onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full hover:bg-white transition shadow-sm">
                          <ChevronRight className="w-4 h-4 text-gray-700" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {images.map((_, i) => (
                            <button key={i} onClick={() => setCurrentImageIndex(i)} className={`w-2 h-2 rounded-full transition ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`} />
                          ))}
                        </div>
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>

            {/* WFC Card - Modern */}
            {selectedCoffeeShop.wfc && (
              <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Wifi className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-emerald-700 font-semibold text-sm">Great for Working!</p>
                    <p className="text-emerald-600/70 text-xs">Good connectivity and atmosphere</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-600 font-medium">Speed</p>
                    <p className="text-sm font-bold text-emerald-700">{selectedCoffeeShop.connectionSpeed || "~30 Mbps"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {/* Hours */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">HOURS</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedCoffeeShop.operatingDays || "Everyday"}: {selectedCoffeeShop.openTime && selectedCoffeeShop.closeTime ? `${selectedCoffeeShop.openTime} - ${selectedCoffeeShop.closeTime}` : "08.00 - 22.00"}
                  </p>
                </div>
              </div>

              {/* Beverages Price */}
              <div className="flex items-start gap-3">
                <Coffee className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">BEVERAGES PRICE</p>
                  <p className="text-sm font-medium text-gray-800">{selectedCoffeeShop.priceRange || "Start From 20K"}</p>
                </div>
              </div>

              {/* Service/Tax */}
              <div className="flex items-start gap-3">
                <Percent className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">SERVICE/TAX</p>
                  <p className="text-sm font-medium text-gray-800">{selectedCoffeeShop.serviceTax || "No Tax"}</p>
                </div>
              </div>

              {/* Connection */}
              <div className="flex items-start gap-3">
                <Signal className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">CONNECTION</p>
                  <p className="text-sm font-medium text-gray-800">{selectedCoffeeShop.connectionSpeed || (selectedCoffeeShop.wfc ? "Available" : "Not Available")}</p>
                </div>
              </div>

              {/* Musala */}
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">MUSHOLA</p>
                  <p className="text-sm font-medium text-gray-800">{selectedCoffeeShop.mushola ? "Available" : "Not Available"}</p>
                </div>
              </div>

              {/* Parking */}
              <div className="flex items-start gap-3">
                <ParkingCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">PARKING</p>
                  <div className="flex items-center gap-3">
                    {selectedCoffeeShop.parking && selectedCoffeeShop.parking.length > 0 ? (
                      selectedCoffeeShop.parking.map((type) => (
                        <span key={type} className="flex items-center gap-1 text-sm text-gray-700">
                          {type === "motorcycle" && "🏍️ Motor"}
                          {type === "car" && "🚗 Mobil"}
                          {type === "bicycle" && "🚲 Sepeda"}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Not Available</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">PAYMENT</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    {selectedCoffeeShop.paymentMethods && selectedCoffeeShop.paymentMethods.length > 0 ? (
                      selectedCoffeeShop.paymentMethods
                        .filter((method) => method === "cash" || method === "cashless")
                        .map((method) => (
                          <span key={method} className="flex items-center gap-1.5 text-sm text-gray-700">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            {method === "cash" ? "Cash" : "Cashless"}
                          </span>
                        ))
                    ) : (
                      <span className="text-sm text-gray-500">Cash Only</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Facilities */}
              {selectedCoffeeShop.facilities && selectedCoffeeShop.facilities.length > 0 && (
                <div className="flex items-start gap-3 col-span-2">
                  <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">FACILITIES</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {selectedCoffeeShop.facilities.map((facility: string, index: number) => (
                        <span key={index} className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                          {facility.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Instagram */}
              <div className="flex items-start gap-3">
                <Instagram className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">INSTAGRAM</p>
                  <a
                    href={selectedCoffeeShop.instagram || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition inline-flex items-center gap-1">
                    @{selectedCoffeeShop.name.toLowerCase().replace(/\s+/g, "")} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Map */}
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">MAP</p>
                  <a
                    href={`https://www.google.com/maps?q=${selectedCoffeeShop.lat},${selectedCoffeeShop.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition inline-flex items-center gap-1">
                    Open Maps <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              {selectedCoffeeShop.whatsapp && (
                <a
                  href={`https://wa.me/${selectedCoffeeShop.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition">
                  <MessageCircle className="w-5 h-5" />
                  Contact via WhatsApp
                </a>
              )}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCoffeeShop.lat},${selectedCoffeeShop.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
                <Navigation className="w-5 h-5" />
                Get Directions
              </a>
            </div>
          </div>
        )}

        {!selectedCoffeeShop && coffeeShops.length > 0 && (
          <div className="p-6 text-center text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Pilih Coffee Shop</h3>
            <p className="text-sm">Klik pada marker di peta untuk melihat detail coffee shop</p>
          </div>
        )}

        {coffeeShops.length === 0 && !loading && (
          <div className="p-6 text-center text-gray-500">
            <p>Loading coffee shop data...</p>
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      {isEditDrawerOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setIsEditDrawerOpen(false)} />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[450px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Edit Coffee Shop</h3>
              <button onClick={() => setIsEditDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Coffee Shop</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                  required
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
                  <input
                    type="number"
                    name="lat"
                    value={editFormData.lat}
                    onChange={handleEditInputChange}
                    step="any"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
                  <input
                    type="number"
                    name="lng"
                    value={editFormData.lng}
                    onChange={handleEditInputChange}
                    step="any"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Operating Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hari Operasional</label>
                <select
                  name="operatingDays"
                  value={editFormData.operatingDays}
                  onChange={handleEditInputChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
                  <option value="">Pilih hari operasional</option>
                  <option value="Everyday">Everyday (Setiap Hari)</option>
                  <option value="Senin - Sabtu">Senin - Sabtu</option>
                  <option value="Senin - Jumat">Senin - Jumat</option>
                  <option value="Sabtu - Minggu">Sabtu - Minggu (Weekend Only)</option>
                </select>
              </div>

              {/* Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Buka</label>
                  <input
                    type="time"
                    name="openTime"
                    value={editFormData.openTime}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Tutup</label>
                  <input
                    type="time"
                    name="closeTime"
                    value={editFormData.closeTime}
                    onChange={handleEditInputChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Price & Tax */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Range Harga</label>
                  <input
                    type="text"
                    name="priceRange"
                    value={editFormData.priceRange}
                    onChange={handleEditInputChange}
                    placeholder="Start From 20K"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Service/Tax</label>
                  <input
                    type="text"
                    name="serviceTax"
                    value={editFormData.serviceTax}
                    onChange={handleEditInputChange}
                    placeholder="15.5% atau No Tax"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Connection Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kecepatan Internet</label>
                <input
                  type="text"
                  name="connectionSpeed"
                  value={editFormData.connectionSpeed}
                  onChange={handleEditInputChange}
                  placeholder="30 Mbps atau Good/Fast"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              {/* WhatsApp & Instagram */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={editFormData.whatsapp}
                    onChange={handleEditInputChange}
                    placeholder="628123456789"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                  <input
                    type="text"
                    name="instagram"
                    value={editFormData.instagram}
                    onChange={handleEditInputChange}
                    placeholder="@coffeeshop"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Edit Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo Coffee Shop</label>
                <div className="flex items-center space-x-4">
                  <input type="file" accept="image/*" onChange={handleEditLogoUpload} className="hidden" id="edit-logo-upload" />
                  <label htmlFor="edit-logo-upload" className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                    {editLogoPreview ? (
                      <img src={editLogoPreview} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">Logo</span>
                      </div>
                    )}
                  </label>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Upload logo baru (maksimal 2MB)</p>
                    {editLogoFile && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {editLogoFile.name} ({(editLogoFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                    {!editLogoFile && editLogoPreview && <p className="text-xs text-blue-600 mt-1">Logo saat ini akan dipertahankan</p>}
                  </div>
                </div>
              </div>

              {/* Edit Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Coffee Shop</label>

                {/* Current Photos + New Photos */}
                {editPhotoPreviews.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Foto saat ini:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {editPhotoPreviews.map((preview, index) => {
                        const isExistingPhoto = selectedCoffeeShop?.photos?.includes(preview);
                        const isMarkedForDeletion = photosToDelete.includes(preview);

                        return (
                          <div key={index} className={`relative group ${isMarkedForDeletion ? "opacity-50" : ""}`}>
                            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                              <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                              {isMarkedForDeletion && (
                                <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                  <span className="text-red-600 text-xs font-medium">Akan Dihapus</span>
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() => removeEditPhoto(index, isExistingPhoto, preview)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                <X size={14} />
                              </button>
                            </div>
                            {isExistingPhoto && !isMarkedForDeletion && <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">Lama</div>}
                            {!isExistingPhoto && <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">Baru</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload Area */}
                <div className="relative">
                  <input type="file" multiple accept="image/*" onChange={(e) => handleEditPhotoUpload(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all hover:border-gray-400 bg-gray-50">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Klik untuk upload foto baru</p>
                    <p className="text-xs text-gray-500 mt-1">Maksimal 5 foto • JPG, PNG, WebP</p>
                  </div>
                </div>

                {/* Photo Counter */}
                {editPhotoPreviews.length > 0 && (
                  <div className="mt-3 text-xs text-center">
                    <div className="text-gray-500">
                      {editPhotoPreviews.length} dari 5 foto
                      {photosToDelete.length > 0 && ` (${photosToDelete.length} akan dihapus)`}
                    </div>
                    {editPhotoFiles.some((file) => file.isNew) && <div className="text-green-600 mt-1">⚠️ Foto baru akan ditambahkan</div>}
                  </div>
                )}
              </div>

              {/* Parking Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parkir</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "motorcycle", label: "🏍️ Motor" },
                    { value: "car", label: "🚗 Mobil" },
                    { value: "bicycle", label: "🚲 Sepeda" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.parking.includes(option.value)}
                        onChange={() => handleCheckboxArrayChange("parking", option.value)}
                        className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "cash", label: "💵 Cash" },
                    { value: "cashless", label: "💳 Cashless" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.paymentMethods.includes(option.value)}
                        onChange={() => handleCheckboxArrayChange("paymentMethods", option.value)}
                        className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { value: "wifi", label: "📶 WiFi" },
                    { value: "ac", label: "❄️ AC" },
                    { value: "smoking-area", label: "🚬 Smoking Area" },
                    { value: "outdoor", label: "🌳 Outdoor" },
                    { value: "indoor", label: "🏠 Indoor" },
                    { value: "meeting-room", label: "🏢 Meeting Room" },
                    { value: "toilet", label: "🚻 Toilet" },
                    { value: "charging", label: "🔌 Charging" },
                    { value: "pet-friendly", label: "🐕 Pet Friendly" },
                    { value: "live-music", label: "🎵 Live Music" },
                    { value: "board-games", label: "🎲 Board Games" },
                    { value: "projector", label: "📽️ Projector" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.facilities.includes(option.value)}
                        onChange={() => handleCheckboxArrayChange("facilities", option.value)}
                        className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {/* WFC Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Work From Cafe</p>
                    <p className="text-xs text-gray-500">Cocok untuk bekerja remote</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="wfc" checked={editFormData.wfc} onChange={handleEditInputChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Mushola Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Mushola</p>
                    <p className="text-xs text-gray-500">Tersedia tempat sholat</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="mushola" checked={editFormData.mushola} onChange={handleEditInputChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUpdating || isDeleting}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Simpan Perubahan
                    </>
                  )}
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={handleDeleteCoffeeShop}
                  disabled={isUpdating || isDeleting}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed border border-red-200">
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Hapus Coffee Shop
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* File Manager Drawer */}
      {showFileManager && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setShowFileManager(false)} />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">File Manager</h3>
              <button onClick={() => setShowFileManager(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">Kelola file yang sudah diupload ke Vercel Blob</p>
                <button onClick={loadUploadedFiles} disabled={isLoadingFiles} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2">
                  {isLoadingFiles ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Refresh
                </button>
              </div>

              {isLoadingFiles ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  <span className="ml-3 text-gray-600">Loading files...</span>
                </div>
              ) : uploadedFiles.length === 0 ? (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada file yang diupload</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            {file.url.includes(".jpg") || file.url.includes(".jpeg") || file.url.includes(".png") || file.url.includes(".webp") ? (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/api/placeholder/40/40?text=IMG";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xs text-gray-500">📄</span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline">
                              View
                            </a>
                            <button onClick={() => deleteFile(file.pathname, file.url)} disabled={isDeletingFile === file.pathname} className="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50 flex items-center gap-1">
                              {isDeletingFile === file.pathname ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Dashboard Overlay - muncul setelah login */}
      {isAuthenticated && (
        <>
          {/* Left Sidebar Overlay */}
          <div className="absolute left-0 top-0 h-full w-20 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl overflow-hidden absolute top-5">
              <img src="/images/loggs logo.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center space-y-8">
              <PillNav
                items={pillNavItems}
                defaultActive="home"
                className="flex flex-col items-center justify-center"
                onRefreshData={refreshCoffeeShops}
                selectedCoffeeShop={selectedCoffeeShop}
                onCoffeeShopSelect={setSelectedCoffeeShop}
                onItemClick={(itemId) => {
                  if (itemId === "files") {
                    setShowFileManager(true);
                    loadUploadedFiles();
                  }
                }}
              />

              {/* Logout Button */}
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center gap-1.5 px-1 py-1.5 bg-black text-white border border-black rounded-sm hover:bg-red-600 hover:border-red-700 active:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-[10px]">
                  {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-6 h-6" />}
                  {!isLoggingOut}
                </button>
              </div>
            </div>
          </div>

          {/* Top Bar Overlay */}
          <div className="absolute top-0 left-20 right-[500px] z-10 bg-white/40 backdrop-blur-xl p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 flex items-center bg-gray-100 rounded-lg px-4 py-2">
                <Search size={20} className="text-gray-400 mr-2" />
                <input type="text" placeholder="Cari coffee shop..." className="bg-transparent flex-1 outline-none text-gray-900 placeholder-gray-600" />
              </div>
              <select className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 outline-none text-gray-900">
                <option>Semua Fasilitas</option>
                <option>WiFi</option>
                <option>Outdoor</option>
                <option>Pet Friendly</option>
                <option>Parking</option>
              </select>
              <select className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 outline-none text-gray-900">
                <option>Work From Cafe</option>
                <option>Ya</option>
                <option>Tidak</option>
              </select>
              <select className="bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 outline-none text-gray-900">
                <option>Rating</option>
                <option>4.5+</option>
                <option>4.0+</option>
                <option>3.5+</option>
              </select>
            </div>
          </div>

          {/* Right Panel Overlay - Synced with Database */}
          <div className="absolute right-0 top-0 h-full w-[480px] z-10 bg-white border-l border-gray-100 overflow-y-auto">
            {selectedCoffeeShop && (
              <div className="p-5">
                {/* Header with Edit Button */}
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedCoffeeShop.name}</h2>
                  <button onClick={openEditDrawer} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Edit Coffee Shop">
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-sm">{selectedCoffeeShop.address}</p>
                </div>

                {/* Image Carousel */}
                <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden mb-4">
                  {(() => {
                    const images = selectedCoffeeShop.photos && selectedCoffeeShop.photos.length > 0 ? selectedCoffeeShop.photos : ["/api/placeholder/400/300?text=No+Image"];
                    return (
                      <>
                        <img
                          src={images[currentImageIndex]}
                          alt={selectedCoffeeShop.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/api/placeholder/400/300?text=No+Image";
                          }}
                        />
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full hover:bg-white transition shadow-sm">
                              <ChevronLeft className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-1.5 rounded-full hover:bg-white transition shadow-sm">
                              <ChevronRight className="w-4 h-4 text-gray-700" />
                            </button>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                              {images.map((_, i) => (
                                <button key={i} onClick={() => setCurrentImageIndex(i)} className={`w-2 h-2 rounded-full transition ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`} />
                              ))}
                            </div>
                            <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs">
                              {currentImageIndex + 1} / {images.length}
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* WFC Card - Modern */}
                {selectedCoffeeShop.wfc && (
                  <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Wifi className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-emerald-700 font-semibold text-sm">Great for Working!</p>
                        <p className="text-emerald-600/70 text-xs">Good connectivity and atmosphere</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-emerald-600 font-medium">Speed</p>
                        <p className="text-sm font-bold text-emerald-700">{selectedCoffeeShop.connectionSpeed || "~30 Mbps"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                  {/* Hours */}
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">HOURS</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedCoffeeShop.operatingDays || "Everyday"}: {selectedCoffeeShop.openTime && selectedCoffeeShop.closeTime ? `${selectedCoffeeShop.openTime} - ${selectedCoffeeShop.closeTime}` : "08.00 - 22.00"}
                      </p>
                    </div>
                  </div>

                  {/* Beverages Price */}
                  <div className="flex items-start gap-3">
                    <Coffee className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">BEVERAGES PRICE</p>
                      <p className="text-sm font-medium text-gray-800">{selectedCoffeeShop.priceRange || "Start From 20K"}</p>
                    </div>
                  </div>

                  {/* Service/Tax */}
                  <div className="flex items-start gap-3">
                    <Percent className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">SERVICE/TAX</p>
                      <p className="text-sm font-medium text-gray-800">{selectedCoffeeShop.serviceTax || "No Tax"}</p>
                    </div>
                  </div>

                  {/* Connection */}
                  <div className="flex items-start gap-3">
                    <Signal className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">CONNECTION</p>
                      <p className="text-sm font-medium text-gray-800">{selectedCoffeeShop.connectionSpeed || (selectedCoffeeShop.wfc ? "Available" : "Not Available")}</p>
                    </div>
                  </div>

                  {/* Musala */}
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">MUSHOLA</p>
                      <p className="text-sm font-medium text-gray-800">{selectedCoffeeShop.mushola ? "Available" : "Not Available"}</p>
                    </div>
                  </div>

                  {/* Parking */}
                  <div className="flex items-start gap-3">
                    <ParkingCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">PARKING</p>
                      <div className="flex items-center gap-3">
                        {selectedCoffeeShop.parking && selectedCoffeeShop.parking.length > 0 ? (
                          selectedCoffeeShop.parking.map((type) => (
                            <span key={type} className="flex items-center gap-1 text-sm text-gray-700">
                              {type === "motorcycle" && "🏍️ Motor"}
                              {type === "car" && "🚗 Mobil"}
                              {type === "bicycle" && "🚲 Sepeda"}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Not Available</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">PAYMENT</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {selectedCoffeeShop.paymentMethods && selectedCoffeeShop.paymentMethods.length > 0 ? (
                          selectedCoffeeShop.paymentMethods
                            .filter((method) => method === "cash" || method === "cashless")
                            .map((method) => (
                              <span key={method} className="flex items-center gap-1.5 text-sm text-gray-700">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                {method === "cash" ? "Cash" : "Cashless"}
                              </span>
                            ))
                        ) : (
                          <span className="text-sm text-gray-500">Cash Only</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Facilities */}
                  {selectedCoffeeShop.facilities && selectedCoffeeShop.facilities.length > 0 && (
                    <div className="flex items-start gap-3 col-span-2">
                      <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">FACILITIES</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedCoffeeShop.facilities.map((facility: string, index: number) => (
                            <span key={index} className="text-sm text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                              {facility.replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Instagram */}
                  <div className="flex items-start gap-3">
                    <Instagram className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">INSTAGRAM</p>
                      <a
                        href={selectedCoffeeShop.instagram || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition inline-flex items-center gap-1">
                        @{selectedCoffeeShop.name.toLowerCase().replace(/\s+/g, "")} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="flex items-start gap-3">
                    <Navigation className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">MAP</p>
                      <a
                        href={`https://www.google.com/maps?q=${selectedCoffeeShop.lat},${selectedCoffeeShop.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition inline-flex items-center gap-1">
                        Open Maps <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  {selectedCoffeeShop.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedCoffeeShop.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-emerald-600 transition">
                      <MessageCircle className="w-5 h-5" />
                      Contact via WhatsApp
                    </a>
                  )}
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCoffeeShop.lat},${selectedCoffeeShop.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition">
                    <Navigation className="w-5 h-5" />
                    Get Directions
                  </a>
                </div>
              </div>
            )}

            {!selectedCoffeeShop && coffeeShops.length > 0 && (
              <div className="p-6 text-center text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Pilih Coffee Shop</h3>
                <p className="text-sm">Klik pada marker di peta untuk melihat detail coffee shop</p>
              </div>
            )}

            {coffeeShops.length === 0 && !loading && (
              <div className="p-6 text-center text-gray-500">
                <p>Loading coffee shop data...</p>
              </div>
            )}
          </div>

          {/* Edit Drawer */}
          {isEditDrawerOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setIsEditDrawerOpen(false)} />

              {/* Drawer */}
              <div className="fixed right-0 top-0 h-full w-[450px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Coffee Shop</h3>
                  <button onClick={() => setIsEditDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleUpdateSubmit} className="p-6 space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Coffee Shop</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat</label>
                    <textarea
                      name="address"
                      value={editFormData.address}
                      onChange={handleEditInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                      required
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Latitude</label>
                      <input
                        type="number"
                        name="lat"
                        value={editFormData.lat}
                        onChange={handleEditInputChange}
                        step="any"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Longitude</label>
                      <input
                        type="number"
                        name="lng"
                        value={editFormData.lng}
                        onChange={handleEditInputChange}
                        step="any"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Operating Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Hari Operasional</label>
                    <select
                      name="operatingDays"
                      value={editFormData.operatingDays}
                      onChange={handleEditInputChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
                      <option value="">Pilih hari operasional</option>
                      <option value="Everyday">Everyday (Setiap Hari)</option>
                      <option value="Senin - Sabtu">Senin - Sabtu</option>
                      <option value="Senin - Jumat">Senin - Jumat</option>
                      <option value="Sabtu - Minggu">Sabtu - Minggu (Weekend Only)</option>
                    </select>
                  </div>

                  {/* Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Buka</label>
                      <input
                        type="time"
                        name="openTime"
                        value={editFormData.openTime}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Jam Tutup</label>
                      <input
                        type="time"
                        name="closeTime"
                        value={editFormData.closeTime}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Price & Tax */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Range Harga</label>
                      <input
                        type="text"
                        name="priceRange"
                        value={editFormData.priceRange}
                        onChange={handleEditInputChange}
                        placeholder="Start From 20K"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Service/Tax</label>
                      <input
                        type="text"
                        name="serviceTax"
                        value={editFormData.serviceTax}
                        onChange={handleEditInputChange}
                        placeholder="15.5% atau No Tax"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Connection Speed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kecepatan Internet</label>
                    <input
                      type="text"
                      name="connectionSpeed"
                      value={editFormData.connectionSpeed}
                      onChange={handleEditInputChange}
                      placeholder="30 Mbps atau Good/Fast"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    />
                  </div>

                  {/* WhatsApp & Instagram */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                      <input
                        type="text"
                        name="whatsapp"
                        value={editFormData.whatsapp}
                        onChange={handleEditInputChange}
                        placeholder="628123456789"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                      <input
                        type="text"
                        name="instagram"
                        value={editFormData.instagram}
                        onChange={handleEditInputChange}
                        placeholder="@coffeeshop"
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      />
                    </div>
                  </div>

                  {/* Edit Logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo Coffee Shop</label>
                    <div className="flex items-center space-x-4">
                      <input type="file" accept="image/*" onChange={handleEditLogoUpload} className="hidden" id="edit-logo-upload" />
                      <label htmlFor="edit-logo-upload" className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
                        {editLogoPreview ? (
                          <img src={editLogoPreview} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-500">Logo</span>
                          </div>
                        )}
                      </label>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Upload logo baru (maksimal 2MB)</p>
                        {editLogoFile && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {editLogoFile.name} ({(editLogoFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                        {!editLogoFile && editLogoPreview && <p className="text-xs text-blue-600 mt-1">Logo saat ini akan dipertahankan</p>}
                      </div>
                    </div>
                  </div>

                  {/* Edit Photos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Coffee Shop</label>

                    {/* Current Photos + New Photos */}
                    {editPhotoPreviews.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-2">Foto saat ini:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {editPhotoPreviews.map((preview, index) => {
                            const isExistingPhoto = selectedCoffeeShop?.photos?.includes(preview);
                            const isMarkedForDeletion = photosToDelete.includes(preview);

                            return (
                              <div key={index} className={`relative group ${isMarkedForDeletion ? "opacity-50" : ""}`}>
                                <div className="aspect-square bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                  {isMarkedForDeletion && (
                                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                      <span className="text-red-600 text-xs font-medium">Akan Dihapus</span>
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeEditPhoto(index, isExistingPhoto, preview)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                    <X size={14} />
                                  </button>
                                </div>
                                {isExistingPhoto && !isMarkedForDeletion && <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">Lama</div>}
                                {!isExistingPhoto && <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">Baru</div>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Upload Area */}
                    <div className="relative">
                      <input type="file" multiple accept="image/*" onChange={(e) => handleEditPhotoUpload(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center transition-all hover:border-gray-400 bg-gray-50">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Klik untuk upload foto baru</p>
                        <p className="text-xs text-gray-500 mt-1">Maksimal 5 foto • JPG, PNG, WebP</p>
                      </div>
                    </div>

                    {/* Photo Counter */}
                    {editPhotoPreviews.length > 0 && (
                      <div className="mt-3 text-xs text-center">
                        <div className="text-gray-500">
                          {editPhotoPreviews.length} dari 5 foto
                          {photosToDelete.length > 0 && ` (${photosToDelete.length} akan dihapus)`}
                        </div>
                        {editPhotoFiles.some((file) => file.isNew) && <div className="text-green-600 mt-1">⚠️ Foto baru akan ditambahkan</div>}
                      </div>
                    )}
                  </div>

                  {/* Parking Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parkir</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: "motorcycle", label: "🏍️ Motor" },
                        { value: "car", label: "🚗 Mobil" },
                        { value: "bicycle", label: "🚲 Sepeda" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editFormData.parking.includes(option.value)}
                            onChange={() => handleCheckboxArrayChange("parking", option.value)}
                            className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: "cash", label: "💵 Cash" },
                        { value: "cashless", label: "💳 Cashless" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editFormData.paymentMethods.includes(option.value)}
                            onChange={() => handleCheckboxArrayChange("paymentMethods", option.value)}
                            className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas</label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { value: "wifi", label: "📶 WiFi" },
                        { value: "ac", label: "❄️ AC" },
                        { value: "smoking-area", label: "🚬 Smoking Area" },
                        { value: "outdoor", label: "🌳 Outdoor" },
                        { value: "indoor", label: "🏠 Indoor" },
                        { value: "meeting-room", label: "🏢 Meeting Room" },
                        { value: "toilet", label: "🚻 Toilet" },
                        { value: "charging", label: "🔌 Charging" },
                        { value: "pet-friendly", label: "🐕 Pet Friendly" },
                        { value: "live-music", label: "🎵 Live Music" },
                        { value: "board-games", label: "🎲 Board Games" },
                        { value: "projector", label: "📽️ Projector" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editFormData.facilities.includes(option.value)}
                            onChange={() => handleCheckboxArrayChange("facilities", option.value)}
                            className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3">
                    {/* WFC Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Work From Cafe</p>
                        <p className="text-xs text-gray-500">Cocok untuk bekerja remote</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="wfc" checked={editFormData.wfc} onChange={handleEditInputChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>

                    {/* Mushola Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Mushola</p>
                        <p className="text-xs text-gray-500">Tersedia tempat sholat</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="mushola" checked={editFormData.mushola} onChange={handleEditInputChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isUpdating || isDeleting}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Simpan Perubahan
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={handleDeleteCoffeeShop}
                      disabled={isUpdating || isDeleting}
                      className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed border border-red-200">
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-5 h-5" />
                          Hapus Coffee Shop
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {/* File Manager Drawer */}
          {showFileManager && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 bg-black/50 z-50 transition-opacity" onClick={() => setShowFileManager(false)} />

              {/* Drawer */}
              <div className="fixed right-0 top-0 h-full w-[500px] bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in-right">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">File Manager</h3>
                  <button onClick={() => setShowFileManager(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">Kelola file yang sudah diupload ke Vercel Blob</p>
                    <button onClick={loadUploadedFiles} disabled={isLoadingFiles} className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition disabled:opacity-50 flex items-center gap-2">
                      {isLoadingFiles ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                      Refresh
                    </button>
                  </div>

                  {isLoadingFiles ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      <span className="ml-3 text-gray-600">Loading files...</span>
                    </div>
                  ) : uploadedFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Belum ada file yang diupload</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                {file.url.includes(".jpg") || file.url.includes(".jpeg") || file.url.includes(".png") || file.url.includes(".webp") ? (
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/api/placeholder/40/40?text=IMG";
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">📄</span>
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 underline">
                                  View
                                </a>
                                <button
                                  onClick={() => deleteFile(file.pathname, file.url)}
                                  disabled={isDeletingFile === file.pathname}
                                  className="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50 flex items-center gap-1">
                                  {isDeletingFile === file.pathname ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Login Form Overlay - muncul sebelum login */}
      {!isAuthenticated && (
        <div className="absolute bg-white/10 backdrop-blur-xl inset-0 z-1000 flex items-center justify-center">
          <div className="w-full max-w-md mx-4">
            {/* Login Form */}
            <div className="bg-black/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-8">
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* Error Message */}
                {loginError && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl text-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{loginError}</span>
                  </div>
                )}

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2 drop-shadow-sm">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-white focus:border-white outline-none transition-all"
                      placeholder="Enter your password"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-black mt-2 text-sm text-center">*hayo maau ngapaain?</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-black text-white py-3 px-4 rounded-xl font-semibold hover:bg-black/70 focus:ring-2 focus:ring-/20 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg">
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      sabar ngab...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animation Styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RealEstateDashboard;
