"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

interface GuideStepProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Step {
  id: string;
  element?: string;
  emoji: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center";
  brightenBg?: boolean; // Just lighten background, no spotlight
}

const steps: Step[] = [
  {
    id: "welcome",
    emoji: "👋",
    title: "Selamat Datang!",
    description: "Kami akan memandu kamu menggunakan Coffee Map Pangkalpinang.",
    position: "center",
  },
  {
    id: "logo",
    element: "#navbar-logo",
    emoji: "☕",
    title: "Coffee Map",
    description: "Temukan coffee shop terbaik di Pangkalpinang.",
    position: "bottom",
  },
  {
    id: "search",
    element: "#search-input",
    emoji: "🔍",
    title: "Cari Coffee Shop",
    description: "Ketik nama atau alamat untuk mencari.",
    position: "bottom",
  },
  {
    id: "map",
    element: "#map-container",
    emoji: "🗺️",
    title: "Peta Interaktif",
    description: "Klik marker untuk melihat detail coffee shop.",
    position: "center",
    brightenBg: true,
  },
  {
    id: "controls",
    element: "#map-controls",
    emoji: "⚙️",
    title: "Kontrol Peta",
    description: "Ganti layer, lihat lokasi kamu, dan fitur lainnya.",
    position: "left",
  },
  {
    id: "help",
    element: "#info-button",
    emoji: "❓",
    title: "Bantuan",
    description: "Klik untuk melihat panduan ini lagi.",
    position: "left",
  },
  {
    id: "done",
    emoji: "🎉",
    title: "Selesai!",
    description: "Selamat menikmati kopi! ☕",
    position: "center",
  },
];

const GuideStep: React.FC<GuideStepProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState(1);

  const calculateCardPosition = useCallback((rect: DOMRect | null, position: string) => {
    const cardWidth = 280;
    const cardHeight = 280;
    const padding = 16;
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
          y = rect.top - cardHeight - padding;
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

      // Keep card within viewport bounds
      x = Math.max(padding, Math.min(x, windowWidth - cardWidth - padding));
      y = Math.max(padding, Math.min(y, windowHeight - cardHeight - padding));
    }

    return { x, y };
  }, []);

  const updatePositions = useCallback(() => {
    const step = steps[currentStep];
    let rect: DOMRect | null = null;

    if (step.element) {
      const el = document.querySelector(step.element);
      if (el) {
        rect = el.getBoundingClientRect();
      }
    }

    setSpotlightRect(rect);
    setCardPosition(calculateCardPosition(rect, step.position || "center"));
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
  }, [isOpen, updatePositions]);

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
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Overlay - lighter when brightenBg, not clickable */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 ${isBrightenBg ? "bg-black/20" : "bg-black/60"}`} />

          {/* Spotlight - only show when not brightenBg */}
          {spotlightRect && !isBrightenBg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                left: spotlightRect.left - 6,
                top: spotlightRect.top - 6,
                width: spotlightRect.width + 12,
                height: spotlightRect.height + 12,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute rounded-xl pointer-events-none"
              style={{
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                border: "2px solid rgba(255, 255, 255, 0.4)",
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
            whileHover={{ scale: 1.02 }}
            className="absolute top-0 left-0 w-[280px] bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-xl pointer-events-auto">
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
