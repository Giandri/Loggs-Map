"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface GuideStepProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepId: string) => void;
}

interface Step {
  id: string;
  element?: string;
  emoji: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  brightenBg?: boolean; // Just lighten background, no spotlight
  isCircle?: boolean; // Circular spotlight
}

const steps: Step[] = [
  {
    id: "welcome",
    emoji: "",
    title: "Halo bray!",
    description: "Disini gw kasih tau lo cara gunain LoggsMaps.",
    position: "center",
  },
  {
    id: "logo",
    element: "#navbar-logo",
    emoji: "",
    title: "LoggsMaps = Loggs Visual",
    description: "Kenalin kita Loggs Visual bray, ini adalah kreasi yang dibuat untuk lo yang suka ngopi ngopi aja. Kalo lo gasuka skip aja.",
    position: "bottom",
  },
  {
    id: "search",
    element: "#search-input",
    emoji: "",
    title: "Search Bar",
    description: "Nahlo, disini ada pencarian coffeeshop bray, kalo lo ada coffeeshop andalan boleh dicari disini, auto ada (kecuali nyari cewek).",
    position: "bottom",
  },
  {
    id: "map",
    element: "#map-container",
    emoji: "",
    title: "Peta",
    description: "Ne bray, disini ada peta sama ada marker coffeeshop, digeser geser aja siapatau dapet coffeeshop yang lo suka.",
    position: "center",
    brightenBg: true,
  },
  {
    id: "controls-trigger",
    element: "#map-controls-trigger",
    emoji: "",
    title: "Kontrol Maps",
    description: "Klik tombol ini kalo lo mau ganteng",
    position: "left",
    isCircle: true,
  },
  {
    id: "layer-switcher",
    element: "#layer-switcher",
    emoji: "",
    title: "Ganti Peta",
    description: "Lo bingung posisi lo sekarang dimana? gampang tinggal ganti mode petanya aja.",
    position: "top",
    isCircle: true,
  },
  {
    id: "filter",
    element: "#filter-button",
    emoji: "",
    title: "Pilih Fasilitas",
    description: "Nyari yang ada WiFi kenceng? ato mau WFC? ato Mushola? diFilterin aja biar gampang.",
    position: "top",
    isCircle: true,
  },
  {
    id: "recenter",
    element: "#recenter-button",
    emoji: "",
    title: "Area Sekitar",
    description: "Kalo lo bingung mau kemana, ini ada fitur lokasi coffeeshop terdekat dimana tar muncul di peta.",
    position: "top",
    isCircle: true,
  },
  {
    id: "location",
    element: "#location-button",
    emoji: "",
    title: "Lokasi Lu",
    description: "Klik ini biar lo tau posisi lo dimana, biar ga tar bisa akses rute ke lokasi coffeeshop yang pengen lo samperin.",
    position: "top",
    isCircle: true,
  },
  {
    id: "bookmark",
    element: "#bookmark-button",
    emoji: "",
    title: "Koleksi Favorit",
    description: "Kalo lo lagi suka sama tempat ngopi favorit lo, simpen, terus lu bisa liat disini.",
    position: "top",
    isCircle: true,
  },
  {
    id: "help",
    element: "#info-button",
    emoji: "",
    title: "Butuh Bantuan?",
    description: "Kalo bingung lagi, klik ini buat liat panduan ini lagi bray.",
    position: "top",
    isCircle: true,
  },
  {
    id: "done",
    emoji: "",
    title: "Selesai!",
    description: "Udah paham kan bray? yaudah Sama-sama.",
    position: "center",
  },
];

const GuideStep: React.FC<GuideStepProps> = ({ isOpen, onClose, onStepChange }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    if (onStepChange) {
      onStepChange(steps[currentStep].id);
    }

    // Auto toggle map controls
    const internalControlSteps = ["layer-switcher", "filter", "recenter", "location", "bookmark", "help"];
    const stepId = steps[currentStep].id;

    const isInternalControl = internalControlSteps.includes(stepId);
    window.dispatchEvent(new CustomEvent('set-map-controls-open', { detail: isInternalControl }));

    return () => {
      // If closing guide, ensure controls also close
      if (currentStep === steps.length - 1) {
        window.dispatchEvent(new CustomEvent('set-map-controls-open', { detail: false }));
      }
    };
  }, [currentStep, isOpen, onStepChange]);

  // Ensure controls close when guide is closed
  useEffect(() => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent('set-map-controls-open', { detail: false }));
    }
  }, [isOpen]);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState(1);

  const calculateCardPosition = useCallback((rect: DOMRect | null, position: string) => {
    // Use more accurate card dimensions - account for mobile screens
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 280;
    const cardHeight = 260; // More accurate height based on actual content
    const padding = isMobile ? 16 : 24;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Default center position
    let x = windowWidth / 2 - cardWidth / 2;
    let y = windowHeight / 2 - cardHeight / 2;

    if (rect && position !== "center") {
      switch (position) {
        case "bottom":
          x = rect.left + rect.width / 2 - cardWidth / 2;
          y = rect.bottom + padding;
          break;
        case "top":
          x = rect.left + rect.width / 2 - cardWidth / 2;
          // Add extra room if it's a circular spotlight
          const circleOffset = steps[currentStep].isCircle ? (isMobile ? 12 : 16) : 0;
          y = rect.top - cardHeight - padding - circleOffset;
          break;
        case "left":
          x = rect.left - cardWidth - padding;
          y = rect.top + rect.height / 2 - cardHeight / 2;
          break;
        case "right":
          x = rect.right + padding;
          y = rect.top + rect.height / 2 - cardHeight / 2;
          break;
      }

      // Keep card within viewport bounds with better mobile handling
      const minX = padding;
      const maxX = windowWidth - cardWidth - padding;
      const minY = padding;
      const maxY = windowHeight - cardHeight - padding;

      // For mobile, be more lenient with top/bottom positioning
      if (isMobile) {
        x = Math.max(minX, Math.min(x, maxX));

        // If card would go off-screen vertically, try alternative positions
        if (y < minY) {
          // Try positioning below if there's space
          const alternativeY = rect ? rect.bottom + padding : y;
          y = alternativeY <= maxY ? alternativeY : minY;
        } else if (y > maxY) {
          // Try positioning above if there's space
          const alternativeY = rect ? rect.top - cardHeight - padding : y;
          y = alternativeY >= minY ? alternativeY : maxY;
        } else {
          y = Math.max(minY, Math.min(y, maxY));
        }
      } else {
        x = Math.max(minX, Math.min(x, maxX));
        y = Math.max(minY, Math.min(y, maxY));
      }
    }

    return { x, y };
  }, []);

  const updatePositions = useCallback(() => {
    const step = steps[currentStep];

    const findElement = (retryCount = 0) => {
      const el = step.element ? (document.querySelector(step.element) as HTMLElement) : null;
      let isActuallyVisible = false;

      if (el) {
        const style = window.getComputedStyle(el);
        isActuallyVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';

        if (isActuallyVisible) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setSpotlightRect(rect);
            setCardPosition(calculateCardPosition(rect, step.position || "center"));

            // For the first few retries, keep updating to catch final animation positions
            if (retryCount < 8) {
              setTimeout(() => findElement(retryCount + 1), 50);
            }
            return;
          }
        }
      }

      if (retryCount < 25 && step.element) {
        setTimeout(() => findElement(retryCount + 1), 100);
      } else if (!isActuallyVisible) {
        setSpotlightRect(null);
        setCardPosition(calculateCardPosition(null, "center"));
      }
    };

    findElement();
  }, [currentStep, calculateCardPosition]);

  useEffect(() => {
    if (isOpen) {
      updatePositions();

      window.addEventListener("resize", updatePositions);
      window.addEventListener("scroll", updatePositions);

      return () => {
        window.removeEventListener("resize", updatePositions);
        window.removeEventListener("scroll", updatePositions);
      };
    }
  }, [isOpen, updatePositions, currentStep]);

  // Handle z-index boosting to make elements visible through overlay
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    if (!step.element || step.brightenBg) return;

    const element = document.querySelector(step.element) as HTMLElement;
    if (element) {
      const originalZIndex = element.style.zIndex;
      const originalPosition = element.style.position;

      // Boost
      element.style.zIndex = "10000";
      // Ensure it's at least relative if not already positioned, so z-index works
      if (!originalPosition || originalPosition === "static") {
        element.style.position = "relative";
      }

      return () => {
        element.style.zIndex = originalZIndex;
        element.style.position = originalPosition;
      };
    }
  }, [isOpen, currentStep, spotlightRect]); // spotlightRect ensures boost happens when element is found/measured

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 20 : -20, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -20 : 20, opacity: 0 }),
  };

  const isBrightenBg = step.brightenBg;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-9999 pointer-events-auto">
          {/* Overlay - and block interaction */}
          <AnimatePresence>
            {(isBrightenBg || !spotlightRect) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 ${isBrightenBg ? "bg-black/20" : "bg-black/60"} pointer-events-auto`}
              />
            )}
          </AnimatePresence>

          {/* Spotlight - only show when not brightenBg */}
          {spotlightRect && !isBrightenBg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={step.isCircle ? {
                opacity: 1,
                left: spotlightRect.left + spotlightRect.width / 2 - (Math.max(spotlightRect.width, spotlightRect.height) + (window.innerWidth < 768 ? 16 : 24)) / 2,
                top: spotlightRect.top + spotlightRect.height / 2 - (Math.max(spotlightRect.width, spotlightRect.height) + (window.innerWidth < 768 ? 16 : 24)) / 2,
                width: Math.max(spotlightRect.width, spotlightRect.height) + (window.innerWidth < 768 ? 16 : 24),
                height: Math.max(spotlightRect.width, spotlightRect.height) + (window.innerWidth < 768 ? 16 : 24),
                borderRadius: "50%",
              } : {
                opacity: 1,
                left: spotlightRect.left - (window.innerWidth < 768 ? 4 : 6),
                top: spotlightRect.top - (window.innerWidth < 768 ? 4 : 6),
                width: spotlightRect.width + (window.innerWidth < 768 ? 8 : 12),
                height: spotlightRect.height + (window.innerWidth < 768 ? 8 : 12),
                borderRadius: window.innerWidth < 768 ? "8px" : "12px",
              }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute pointer-events-auto"
              style={{
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.7)",
                border: "2px solid rgba(255, 255, 255, 0.8)",
              }}
            />
          )}

          {/* Card - Moves with target */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: cardPosition.x,
              y: cardPosition.y,
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            whileHover={{ scale: window.innerWidth >= 768 ? 1.02 : 1 }}
            className={`absolute top-0 left-0 bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-4 md:p-5 shadow-xl pointer-events-auto ${window.innerWidth < 768 ? 'w-[calc(100vw-32px)] max-w-[320px]' : 'w-[280px]'
              }`}
          >
            {/* Close */}
            <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }} whileTap={{ scale: 0.9 }} onClick={handleComplete} className="absolute top-3 right-3 p-1.5 rounded-full transition-colors">
              <X className="w-4 h-4 text-white" />
            </motion.button>

            {/* Content with slide animation */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={currentStep} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                {/* Emoji */}
                <motion.div className="text-4xl text-center mb-3" initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                  {step.emoji}
                </motion.div>

                {/* Title */}
                <h3 className="text-base font-semibold text-white text-center mb-1">{step.title}</h3>

                {/* Description */}
                <p className="text-sm text-white/80 text-center mb-4">{step.description}</p>
              </motion.div>
            </AnimatePresence>

            {/* Progress - Interactive dots */}
            <div className="flex justify-center gap-1.5 mb-4">
              {steps.map((_, i) => (
                <motion.button
                  key={i}
                  onClick={() => {
                    setDirection(i > currentStep ? 1 : -1);
                    setCurrentStep(i);
                  }}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${i === currentStep ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {!isFirstStep && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePrev}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-black text-white text-sm font-medium flex items-center justify-center gap-1 hover:bg-black/80 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                  Kembali
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition-colors ${isLastStep ? "bg-white text-black hover:bg-white/90" : "bg-black text-white hover:bg-black/80"}`}>
                {isLastStep ? "Mulai" : "Lanjut"}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </motion.button>
            </div>

            {/* Skip text */}
            {!isLastStep && (
              <motion.button whileHover={{ color: "#ffffff" }} onClick={handleComplete} className="w-full mt-3 text-xs text-white/50 transition-colors">
                Lewati panduan
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GuideStep;
