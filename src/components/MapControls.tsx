"use client";

import { useState } from "react";
import { Grid, Layers, Funnel, Target, MapPin, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface MapControlsProps {
  activeLayer: "satellite" | "street";
  onLayerChange: () => void;
  onGuideOpen: () => void;
  onRecenter?: () => void;
  onLocationClick?: () => void;
  onBookmarkClick?: () => void;
  onFilterClick?: () => void;
  isLocating?: boolean;
}

interface ControlButtonProps {
  id?: string;
  icon: React.ReactNode;
  onClick?: () => void;
  title?: string;
  isActive?: boolean;
  delay?: number;
}

const ControlButton = ({ id, icon, onClick, title, isActive = false, delay = 0 }: ControlButtonProps) => (
  <motion.button
    id={id}
    onClick={onClick}
    title={title}
    initial={{ opacity: 0, scale: 0.8, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{
      delay: delay * 0.05,
      duration: 0.2,
      ease: "easeOut",
    }}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className={`p-3 rounded-full shadow-sm border transition-colors ${isActive ? "bg-black border-black" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
    <motion.div className={`w-4 h-4 flex items-center justify-center ${isActive ? "text-white" : "text-gray-700"}`} whileHover={{ rotate: isActive ? 0 : 15 }} transition={{ duration: 0.2 }}>
      {icon}
    </motion.div>
  </motion.button>
);

const MapControls = ({ activeLayer, onLayerChange, onGuideOpen, onRecenter, onLocationClick, onBookmarkClick, onFilterClick, isLocating = false }: MapControlsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div id="map-controls" className="absolute right-6 bottom-8 z-1000" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.button className="bg-white p-3 rounded-full shadow-md hover:bg-gray-50 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Grid className="w-6 h-6 text-gray-700" />
          </motion.button>
        </PopoverTrigger>

        <AnimatePresence>
          {isOpen && (
            <PopoverContent side="left" align="end" className="w-auto p-2 z-1000 bg-white/90 backdrop-blur-sm border-white/50" asChild forceMount>
              <motion.div initial={{ opacity: 0, x: 20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 20, scale: 0.9 }} transition={{ duration: 0.2, ease: "easeOut" }}>
                <motion.div className="flex flex-row gap-2">
                  {/* Layer Switcher */}
                  <ControlButton id="layer-switcher" icon={<Layers className="w-4 h-4" />} onClick={onLayerChange} title="Ganti Layer Peta" isActive={activeLayer === "street"} delay={0} />

                  {/* Guide / Help */}
                  <ControlButton id="info-button" icon={<span className="text-sm font-medium">?</span>} onClick={onGuideOpen} title="Panduan Penggunaan" delay={1} />

                  {/* Filter */}
                  <ControlButton icon={<Funnel className="w-4 h-4" />} onClick={onFilterClick} title="Filter" delay={2} />

                  {/* Recenter */}
                  <ControlButton icon={<Target className="w-4 h-4" />} onClick={onRecenter} title="Area Sekitar" delay={3} />

                  {/* My Location */}
                  <ControlButton
                    icon={
                      isLocating ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                          <MapPin className="w-4 h-4" />
                        </motion.div>
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )
                    }
                    onClick={onLocationClick}
                    title={isLocating ? "Mencari lokasi..." : "Lokasi Saya"}
                    delay={4}
                    isActive={isLocating}
                  />

                  {/* Bookmarks */}
                  <ControlButton icon={<Bookmark className="w-4 h-4 fill-current" />} onClick={onBookmarkClick} title="Favorit" delay={5} />
                </motion.div>
              </motion.div>
            </PopoverContent>
          )}
        </AnimatePresence>
      </Popover>
    </motion.div>
  );
};

export default MapControls;
