"use client";

import React, { useState, useEffect } from "react";
import { Home, PlusCircle, MinusCircle, MapPin, Camera, X, MapPinIcon, Upload } from "lucide-react";
import type { PutBlobResult } from "@vercel/blob";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useCoffeeShops } from "@/hooks/useCoffeeShops";

interface PillNavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

interface SimpleCoffeeShop {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  whatsapp?: string;
  facilities: any[];
  photos: any[];
  wfc: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PillNavProps {
  items: PillNavItem[];
  defaultActive?: string;
  onItemClick?: (id: string) => void;
  onRefreshData?: () => void;
  selectedCoffeeShop?: SimpleCoffeeShop | null;
  onCoffeeShopSelect?: (shop: SimpleCoffeeShop | null) => void;
  className?: string;
}

const PillNav: React.FC<PillNavProps> = ({ items, defaultActive = "", onItemClick, onRefreshData, selectedCoffeeShop, onCoffeeShopSelect, className = "" }) => {
  const { coffeeShops, refreshCoffeeShops } = useCoffeeShops();
  const [activeItem, setActiveItem] = useState(defaultActive);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedShopToDelete, setSelectedShopToDelete] = useState<string>("");
  const [deleteSearchQuery, setDeleteSearchQuery] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; fallback?: boolean }>>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Auto-select coffee shop from map selection
  React.useEffect(() => {
    if (selectedCoffeeShop && selectedCoffeeShop.id) {
      setSelectedShopToDelete(selectedCoffeeShop.id);
      console.log("Auto-selected coffee shop for delete:", selectedCoffeeShop.id);
    }
  }, [selectedCoffeeShop]);

  // Handle file upload to Vercel Blob
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit for logo
        alert("Ukuran logo maksimal 2MB");
        return;
      }
      setFormData((prev) => ({ ...prev, logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validImages = newFiles.filter((file) => file.type.startsWith("image/"));

    if (validImages.length !== newFiles.length) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }

    // Check total limit
    const totalCount = uploadedImages.length + validImages.length;
    if (totalCount > 5) {
      alert("Maksimal 5 gambar diperbolehkan");
      return;
    }

    try {
      // Upload each file to Vercel Blob with unique filename
      const uploadPromises = validImages.map(async (file, index) => {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const uniqueFilename = `photo_${timestamp}_${index}_${cleanName}`;

        console.log("Uploading photo:", uniqueFilename);

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
        console.log("Upload result:", result);

        // Handle both Vercel Blob response and fallback response
        const blobUrl = result.url;
        const isFallback = result.fallback || false;

        if (!blobUrl) {
          throw new Error(`No URL returned for ${file.name}`);
        }

        return {
          file,
          blobUrl,
          isFallback,
        };
      });

      const uploadResults = await Promise.all(uploadPromises);
      console.log("All uploads complete:", uploadResults);

      // Update state with uploaded images
      const newUploadedImages = [...uploadedImages, ...uploadResults.map((r) => ({ file: r.file, fallback: r.isFallback }))];
      const newImagePreviews = [...imagePreviews, ...uploadResults.map((r) => r.blobUrl)];

      setUploadedImages(newUploadedImages.slice(0, 5));
      setImagePreviews(newImagePreviews.slice(0, 5));

      console.log("Image previews updated:", newImagePreviews);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Gagal upload gambar. Silakan coba lagi.");
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setUploadedImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Cleanup object URLs on unmount (only for local previews)
  React.useEffect(() => {
    return () => {
      // Note: Blob URLs from Vercel don't need cleanup
    };
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    lat: "",
    lng: "",
    facilities: [] as string[],
    wfc: false,
    images: [] as File[],
    logo: null as File | null,
    openTime: "08:00",
    closeTime: "22:00",
  });

  const handleItemClick = (id: string) => {
    if (id === "zoom-in") {
      setShowAddDialog(true);
      return;
    }
    if (id === "zoom-out") {
      setShowDeleteDialog(true);
      return;
    }
    setActiveItem(id);
    onItemClick?.(id);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedShopToDelete || selectedShopToDelete.trim() === "") {
      alert("Silakan pilih coffee shop yang ingin dihapus.");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/coffee-shops/${selectedShopToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Reset state dan tutup dialog dulu
        setSelectedShopToDelete("");
        setDeleteSearchQuery("");
        setShowDeleteDialog(false);
        onCoffeeShopSelect?.(null);

        // Refresh data langsung
        await refreshCoffeeShops?.();
        onRefreshData?.();

        // Refresh halaman untuk update map markers
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));

        if (response.status === 404) {
          alert("Coffee shop tidak ditemukan. Mungkin sudah dihapus.");
          // Tetap refresh karena data mungkin sudah berubah
          await refreshCoffeeShops?.();
          onRefreshData?.();
        } else if (response.status === 400) {
          alert(`Permintaan tidak valid: ${errorData.details || errorData.error}`);
        } else {
          alert(`Gagal menghapus: ${errorData.error || "Unknown error"}`);
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility) ? prev.facilities.filter((f) => f !== facility) : [...prev.facilities, facility],
    }));
  };

  const handleWfcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, wfc: e.target.checked }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    handleFileUpload(e.dataTransfer.files);
  };

  // Geocoding function using Nominatim (OpenStreetMap)
  const geocodeAddress = async (address: string) => {
    if (!address.trim()) {
      setAddressSuggestions([]);
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Pangkalpinang, Indonesia")}&limit=5&countrycodes=id`);

      if (response.ok) {
        const data = await response.json();
        setAddressSuggestions(data);
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      setAddressSuggestions([]);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Debounced address search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.address.length > 3) {
        geocodeAddress(formData.address);
      } else {
        setAddressSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.address]);

  const selectAddress = (suggestion: any) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
      lat: suggestion.lat,
      lng: suggestion.lon,
    }));
    setAddressSuggestions([]);
  };

  const handleSubmit = async () => {
    try {
      // Upload logo if exists
      let logoUrl = null;
      if (formData.logo) {
        const logoFormData = new FormData();
        logoFormData.append("file", formData.logo);

        const logoResponse = await fetch(`/api/upload?filename=logo_${formData.name.replace(/\s+/g, "_")}_${Date.now()}`, {
          method: "POST",
          body: formData.logo,
        });

        if (logoResponse.ok) {
          const logoResult = await logoResponse.json();
          logoUrl = logoResult.url;
        } else {
          console.warn("Logo upload failed, continuing without logo");
        }
      }

      // Prepare data for API
      console.log("Image previews to save:", imagePreviews);

      const coffeeShopData = {
        name: formData.name,
        address: formData.address,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        whatsapp: formData.phone,
        facilities: formData.facilities,
        photos: imagePreviews.length > 0 ? imagePreviews : ["/api/placeholder/400/300?text=Cafe+Interior", "/api/placeholder/400/300?text=Coffee+Menu", "/api/placeholder/400/300?text=Outdoor+Seating"],
        logo: logoUrl,
        wfc: formData.wfc,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
      };

      console.log("Coffee shop data to save:", coffeeShopData);

      const response = await fetch("/api/coffee-shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(coffeeShopData),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          name: "",
          address: "",
          phone: "",
          lat: "",
          lng: "",
          facilities: [],
          wfc: false,
          images: [],
          logo: null,
          openTime: "08:00",
          closeTime: "22:00",
        });
        // Clear uploaded images and logo
        setUploadedImages([]);
        setImagePreviews([]);
        setLogoPreview(null);
        setShowAddDialog(false);

        // Refresh data dan reload halaman agar marker langsung muncul dengan logo
        await refreshCoffeeShops?.();
        onRefreshData?.();
        window.location.reload();
      } else {
        console.error("Failed to add coffee shop");
        alert("Gagal menambahkan coffee shop. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error adding coffee shop:", error);
      alert("Terjadi kesalahan saat menambahkan coffee shop.");
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {items.map((item) =>
        item.id === "zoom-in" ? (
          <Drawer key={item.id} open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DrawerTrigger asChild>
              <button
                className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-in-out transform-gpu
                  ${
                    activeItem === item.id
                      ? "bg-black text-white shadow-xl scale-110 ring-2 ring-white/50"
                      : "bg-white/30 text-gray-700 hover:bg-linear-to-br hover:from-black/60 hover:to-gray-300/60 hover:text-white hover:scale-110 hover:shadow-lg hover:ring-1 hover:ring-white/50"
                  }
                  backdrop-blur-md border border-white/30
      group
                `}
                title={item.label}>
                <div className="relative z-10 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">{item.icon}</div>

                {/* Active glow effect */}
                {activeItem === item.id && <div className="absolute inset-0 rounded-full bg-linear-to-r from-black/20 to-white/20 animate-pulse" />}

                {/* Hover ripple effect */}
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-400/30 via-gray-600/20 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-125 group-hover:rotate-180" />

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-300/0 via-white/20 to-gray-300/0 opacity-0 group-hover:opacity-80 transition-opacity duration-300 blur-sm" />

                {/* Active ring */}
                {activeItem === item.id && <div className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" style={{ animationDuration: "2s" }} />}
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div
                className="mx-auto w-full max-w-md z-1002 max-h-[85vh] overflow-y-auto md:max-h-[80vh] md:overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "transparent transparent",
                }}>
                <DrawerHeader>
                  <DrawerTitle className="text-xl text-black">Tambah Coffee Shop Baru</DrawerTitle>
                  <DrawerDescription className="text-gray-300">Masukkan informasi coffee shop yang ingin ditambahkan</DrawerDescription>
                </DrawerHeader>

                <div className="p-4 pb-0 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-black">Nama Coffee Shop</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-600 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="Masukkan nama coffee shop"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-black">Logo Coffee Shop</label>
                    <div className="mt-1 flex items-center space-x-4">
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                      <label htmlFor="logo-upload" className="flex items-center justify-center w-20 h-20 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors bg-gray-50">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-xs text-gray-500">Logo</span>
                          </div>
                        )}
                      </label>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Upload logo coffee shop (maksimal 2MB)</p>
                        {formData.logo && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ {formData.logo.name} ({(formData.logo.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="text-sm font-medium text-black">Alamat</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-600 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="Masukkan alamat lengkap"
                    />
                    {isGeocoding && (
                      <div className="absolute right-2 top-3 text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                      </div>
                    )}

                    {/* Address Suggestions */}
                    {addressSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {addressSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectAddress(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors border-b border-gray-700 last:border-b-0">
                            <div className="flex items-start space-x-2">
                              <MapPinIcon size={16} className="text-gray-500 mt-0.5 shrink-0" />
                              <span className="text-sm">{suggestion.display_name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-black">Latitude</label>
                      <input
                        type="text"
                        value={formData.lat}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lat: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-white border border-gray-600 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                        placeholder="-2.xxxx"
                        readOnly={!!formData.lat && addressSuggestions.length === 0}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black">Longitude</label>
                      <input
                        type="text"
                        value={formData.lng}
                        onChange={(e) => setFormData((prev) => ({ ...prev, lng: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-white border border-gray-600 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                        placeholder="106.xxxx"
                        readOnly={!!formData.lng && addressSuggestions.length === 0}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-black">Nomor Telepon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full mt-1 px-3 py-2 bg-white border border-gray-600 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      placeholder="Contoh: +62 812-3456-7890"
                    />
                  </div>

                  {/* Jam Operasional */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-black">Jam Buka</label>
                      <input
                        type="time"
                        name="openTime"
                        value={formData.openTime}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 bg-white border border-gray-600 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-black">Jam Tutup</label>
                      <input
                        type="time"
                        name="closeTime"
                        value={formData.closeTime}
                        onChange={handleInputChange}
                        className="w-full mt-1 px-3 py-2 bg-white border border-gray-600 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mt-1 space-y-2">
                      {/* Image Upload */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-black">Foto Coffee Shop</label>

                        {/* Upload Area */}
                        <div className="relative">
                          <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${isDragOver ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-600 hover:border-gray-500"}`}
                            onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragOver(true);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              setIsDragOver(false);
                            }}
                            onDrop={handleDrop}>
                            <Camera className={`w-8 h-8 mx-auto mb-2 ${isDragOver ? "text-blue-500" : "text-gray-400"}`} />
                            <p className={`text-sm ${isDragOver ? "text-blue-600" : "text-gray-400"}`}>{isDragOver ? "Lepaskan gambar di sini" : "Klik untuk upload gambar"}</p>
                            <p className="text-xs text-gray-500 mt-1">Maksimal 5 gambar • JPG, PNG, WebP</p>
                          </div>
                        </div>

                        {/* Image Preview Grid */}
                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-2 gap-2">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square bg-white rounded-md overflow-hidden border border-gray-600">
                                  <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                    <X size={14} />
                                  </button>
                                </div>
                                {uploadedImages[index] && (
                                  <>
                                    <div className="text-xs text-gray-400 mt-1 truncate">{uploadedImages[index].file.name}</div>
                                    <div className="text-xs text-gray-500">{(uploadedImages[index].file.size / 1024 / 1024).toFixed(2)} MB</div>
                                    {uploadedImages[index].fallback && <div className="text-xs text-orange-500">Placeholder</div>}
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Image Counter */}
                        {imagePreviews.length > 0 && (
                          <div className="text-xs text-center">
                            <div className="text-gray-400">{imagePreviews.length} dari 5 gambar dipilih</div>
                            {uploadedImages.some((img) => img.fallback) && <div className="text-orange-500 mt-1">⚠️ Menggunakan placeholder (Vercel Blob belum aktif)</div>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-black mb-3 block">Fasilitas</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "wifi", label: "WiFi", icon: "📶" },
                        { id: "outdoor", label: "Outdoor", icon: "🌳" },
                        { id: "pet-friendly", label: "Pet Friendly", icon: "🐕" },
                        { id: "parking", label: "Parking", icon: "🅿️" },
                        { id: "cashless", label: "Cashless", icon: "💳" },
                        { id: "vegan", label: "Vegan", icon: "🥗" },
                      ].map((facility) => (
                        <button
                          key={facility.id}
                          type="button"
                          onClick={() => handleCheckboxChange(facility.id)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            formData.facilities.includes(facility.id) ? "bg-blue-500 text-white shadow-lg scale-105 ring-2 ring-blue-300" : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white hover:scale-105"
                          }`}>
                          <span className="text-base">{facility.icon}</span>
                          <span>{facility.label}</span>
                          {formData.facilities.includes(facility.id) && <span className="text-xs opacity-80">✓</span>}
                        </button>
                      ))}
                    </div>
                    {formData.facilities.length > 0 && <div className="mt-3 text-xs text-gray-400">{formData.facilities.length} fasilitas dipilih</div>}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" checked={formData.wfc} onChange={handleWfcChange} className="rounded border-gray-600 bg-gray-800 text-white focus:ring-white focus:ring-2" />
                    <label className="text-sm font-medium text-black">Work From Cafe (WFC)</label>
                  </div>
                </div>

                <DrawerFooter>
                  <div className="grid grid-cols-2 gap-3">
                    <DrawerClose asChild>
                      <button className="bg-gray-700 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">Batal</button>
                    </DrawerClose>
                    <button onClick={handleSubmit} className="bg-white text-black py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                      Tambah Coffee Shop
                    </button>
                  </div>
                  <DrawerClose asChild>
                    <button className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors">Tutup</button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        ) : item.id === "zoom-out" ? (
          <Drawer
            key={item.id}
            open={showDeleteDialog}
            onOpenChange={(open) => {
              setShowDeleteDialog(open);
              if (!open) {
                // Reset state when dialog closes
                setSelectedShopToDelete("");
                setDeleteSearchQuery("");
                setIsDeleting(false);
              }
            }}>
            <DrawerTrigger asChild>
              <button
                className={`
                  relative w-12 h-12 rounded-full flex items-center justify-center
                  transition-all duration-300 ease-in-out transform-gpu
                  ${
                    activeItem === item.id
                      ? "bg-black text-white shadow-xl scale-110 ring-2 ring-white/50"
                      : "bg-white/30 text-gray-700 hover:bg-linear-to-br hover:from-black/60 hover:to-gray-300/60 hover:text-white hover:scale-110 hover:shadow-lg hover:ring-1 hover:ring-white/50"
                  }
                  backdrop-blur-md border border-white/30
      group
                `}
                title={item.label}>
                <div className="relative z-10 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">{item.icon}</div>

                {/* Active glow effect */}
                {activeItem === item.id && <div className="absolute inset-0 rounded-full bg-linear-to-r from-black/20 to-white/20 animate-pulse" />}

                {/* Hover ripple effect */}
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-400/30 via-gray-600/20 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-125 group-hover:rotate-180" />

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-300/0 via-white/20 to-gray-300/0 opacity-0 group-hover:opacity-80 transition-opacity duration-300 blur-sm" />

                {/* Active ring */}
                {activeItem === item.id && <div className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" style={{ animationDuration: "2s" }} />}
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div
                className="mx-auto w-full max-w-md z-1002 max-h-[85vh] overflow-y-auto md:max-h-[80vh] md:overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "transparent transparent",
                }}>
                <DrawerHeader>
                  <DrawerTitle className="text-xl text-black">Hapus Coffee Shop</DrawerTitle>
                  <DrawerDescription className="text-black">Pilih coffee shop yang ingin dihapus dari daftar</DrawerDescription>
                </DrawerHeader>

                <div className="p-4 pb-0 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-black mb-3 block">Pilih Coffee Shop ({coffeeShops.length} tersedia)</label>

                    {/* Search Input */}
                    <div className="mb-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Cari coffee shop..."
                          value={deleteSearchQuery}
                          onChange={(e) => setDeleteSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 bg-black/60 border border-gray-600 rounded-md text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                        {deleteSearchQuery && (
                          <button onClick={() => setDeleteSearchQuery("")} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {(() => {
                        const filtered = coffeeShops.filter((shop) => shop.name.toLowerCase().includes(deleteSearchQuery.toLowerCase()) || shop.address.toLowerCase().includes(deleteSearchQuery.toLowerCase()));

                        if (coffeeShops.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-400">
                              <div className="text-2xl mb-2">📋</div>
                              <div className="text-sm">Belum ada coffee shop tersedia</div>
                              <div className="text-xs mt-1">Tambahkan coffee shop terlebih dahulu</div>
                            </div>
                          );
                        }

                        if (filtered.length === 0) {
                          return (
                            <div className="text-center py-8 text-gray-400">
                              <div className="text-2xl mb-2">🔍</div>
                              <div className="text-sm">Tidak ada coffee shop ditemukan</div>
                              <div className="text-xs mt-1">Coba kata kunci lain</div>
                            </div>
                          );
                        }

                        return filtered.map((shop) => {
                          return (
                            <label key={shop.id} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 cursor-pointer transition-colors">
                              <input
                                type="radio"
                                name="coffee-shop-delete"
                                value={shop.id}
                                checked={selectedShopToDelete === shop.id}
                                onChange={(e) => setSelectedShopToDelete(e.target.value)}
                                className="text-blue-500 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <div className="font-medium text-white text-sm">{shop.name}</div>
                                <div className="text-gray-400 text-xs">{shop.address}</div>
                                <div className="text-gray-500 text-xs">ID: {shop.id}</div>
                              </div>
                            </label>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {selectedShopToDelete && selectedShopToDelete.trim() !== "" && (
                    <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-3">
                      <div className="text-sm text-red-300">
                        <span className="font-medium text-red-200">⚠️ Peringatan:</span> Tindakan ini tidak dapat dibatalkan.
                      </div>
                      <div className="text-xs text-red-400 mt-1">Coffee shop yang dipilih akan dihapus permanen dari database.</div>
                    </div>
                  )}
                </div>

                <DrawerFooter>
                  <div className="grid grid-cols-2 gap-3">
                    <DrawerClose asChild>
                      <button className="bg-gray-700 text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">Batal</button>
                    </DrawerClose>
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting || !selectedShopToDelete}
                      className={`py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                        isDeleting || !selectedShopToDelete ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"
                      }`}>
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Menghapus...
                        </>
                      ) : (
                        <>🗑️ Hapus Coffee Shop</>
                      )}
                    </button>
                  </div>
                  <DrawerClose asChild>
                    <button className="w-full text-gray-500 py-2 text-sm hover:text-gray-700 transition-colors">Tutup</button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <button
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`
              relative w-12 h-12 rounded-full flex items-center justify-center
              transition-all duration-300 ease-in-out transform-gpu
              ${
                activeItem === item.id
                  ? "bg-black text-white shadow-xl scale-110 ring-2 ring-white/50"
                  : "bg-white/30 text-gray-700 hover:bg-linear-to-br hover:from-black/60 hover:to-gray-300/60 hover:text-white hover:scale-110 hover:shadow-lg hover:ring-1 hover:ring-white/50"
              }
              backdrop-blur-md border border-white/30
  group
            `}
            title={item.label}>
            <div className="relative z-10 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12">{item.icon}</div>

            {/* Active glow effect */}
            {activeItem === item.id && <div className="absolute inset-0 rounded-full bg-linear-to-r from-black/20 to-white/20 animate-pulse" />}

            {/* Hover ripple effect */}
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-400/30 via-gray-600/20 to-black/30 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-125 group-hover:rotate-180" />

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-full bg-linear-to-r from-gray-300/0 via-white/20 to-gray-300/0 opacity-0 group-hover:opacity-80 transition-opacity duration-300 blur-sm" />

            {/* Active ring */}
            {activeItem === item.id && <div className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" style={{ animationDuration: "2s" }} />}
          </button>
        )
      )}
    </div>
  );
};

export default PillNav;
