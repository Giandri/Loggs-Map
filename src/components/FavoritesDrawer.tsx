"use client";

import { motion } from "framer-motion";
import { MapPin, Bookmark, Coffee, Wifi, ChevronRight, Trash2 } from "lucide-react";
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

interface FavoritesDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  favorites: CoffeeShop[];
  onShopSelect: (shop: CoffeeShop) => void;
  onRemoveFavorite: (shopId: string) => void;
}

const FavoritesDrawer = ({ isOpen, onOpenChange, favorites, onShopSelect, onRemoveFavorite }: FavoritesDrawerProps) => {
  const handleShopClick = (shop: CoffeeShop) => {
    onShopSelect(shop);
  };

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
            <DrawerTitle className="text-xl text-white flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-white fill-current" />
              Tempat Lo Banget
            </DrawerTitle>
            <DrawerDescription className="text-white text-sm">{favorites.length} Favorit</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0 space-y-4">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Bookmark className="w-16 h-16 text-white mx-auto mb-4" />
                <p className="text-white/80 text-lg font-medium mb-2">Belum ada tempat favorit</p>
                <p className="text-white/60 text-sm">Klik ikon hati di detail tempat untuk menambahkannya ke favorit</p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((shop) => (
                  <motion.div key={shop.id} whileTap={{ scale: 0.98 }} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all" onClick={() => handleShopClick(shop)}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/80 shrink-0">
                        {shop.logo ? (
                          <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                            <Coffee className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-white text-sm truncate">{shop.name}</h4>
                        <p className="text-xs text-white/70 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {shop.address}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {shop.wfc && (
                            <div className="flex items-center gap-1 text-xs text-green-400">
                              <Wifi className="w-3 h-3" />
                              <span>WFC</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <Coffee className="w-3 h-3" />
                            <span>{shop.priceRange || "Rp 20K-50K"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFavorite(shop.id);
                          }}
                          className="w-8 h-8 rounded-full bg-white/30 hover:bg-red-500/30 flex items-center justify-center transition-colors">
                          <Trash2 className="w-4 h-4 text-white fill-current" />
                        </motion.button>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <button className="w-full text-white/70 py-3 text-sm hover:text-white transition-colors border border-white/20 rounded-xl">Tutup</button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FavoritesDrawer;
