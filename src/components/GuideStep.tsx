"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Cookie, Shield, Check } from "lucide-react";
import { useCookieConsent } from "@/hooks/useCookieConsent";

interface GuideStepProps {
  isOpen: boolean;
  onClose: () => void;
  onStepChange?: (stepId: string) => void;
}

interface CookieConsentStepProps {
  onAccept: () => void;
  onReject: () => void;
  onEssentialOnly: () => void;
}

const CookieConsentStep = ({ onAccept, onReject, onEssentialOnly }: CookieConsentStepProps) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="space-y-4">
      {/* Cookie Options - Clean Grid Layout */}
      <div className="grid grid-cols-1 gap-2">
        <motion.button whileTap={{ scale: 0.96 }} onClick={onAccept} className="group flex items-center justify-center p-3 bg-white/85 border border-black rounded-lg hover:bg-black hover:border-white transition-all">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="font-medium text-black hover:text-white text-sm">Terima Semua Cookies</p>
            </div>
          </div>
        </motion.button>

        <motion.button whileTap={{ scale: 0.96 }} onClick={onReject} className="group flex items-center justify-center p-3 bg-black border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-black transition-all">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="font-medium text-white hover:text-black text-sm">Tolak Semua Cookies</p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Minimal Details Section */}
      <div className="text-center -top-3">
        <button onClick={() => setShowDetails(!showDetails)} className="text-xs text-black hover:text-white font-medium transition-colors underline underline-offset-2">
          {showDetails ? "Tutup penjelasan" : "Apa itu cookies?"}
        </button>
      </div>

      {/* Collapsible Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-green-400 rounded-full mt-2 shrink-0"></div>
              <p>
                <strong>Essential:</strong> Diperlukan untuk login dan keamanan aplikasi.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 shrink-0"></div>
              <p>
                <strong>Functional:</strong> Menyimpan favorit dan preferensi Anda.
              </p>
            </div>
            <p className="text-gray-500 italic pt-1">Pilihan Anda bisa diubah kapan saja di pengaturan browser.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface Step {
  id: string;
  element?: string;
  emoji: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right" | "center" | "bottom-left";
  brightenBg?: boolean;
  isCircle?: boolean;
}

const steps: Step[] = [
  {
    id: "cookie-consent",
    emoji: "🍪",
    title: "Selamat Datang di LoggsMaps!",
    description: "Pilih preferensi cookies untuk pengalaman yang sesuai dengan kebutuhan Anda.",
    position: "bottom-left",
  },
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
  const { acceptAll, acceptEssentialOnly, rejectAll } = useCookieConsent();

  useEffect(() => {
    if (!isOpen) return;

    if (onStepChange) {
      onStepChange(steps[currentStep].id);
    }

    // Auto toggle map controls
    const internalControlSteps = ["layer-switcher", "filter", "recenter", "location", "bookmark", "help"];
    const stepId = steps[currentStep].id;

    const isInternalControl = internalControlSteps.includes(stepId);
    window.dispatchEvent(new CustomEvent("set-map-controls-open", { detail: isInternalControl }));

    return () => {
      // If closing guide, ensure controls also close
      if (currentStep === steps.length - 1) {
        window.dispatchEvent(new CustomEvent("set-map-controls-open", { detail: false }));
      }
    };
  }, [currentStep, isOpen, onStepChange]);

  // Ensure controls close when guide is closed
  useEffect(() => {
    if (!isOpen) {
      window.dispatchEvent(new CustomEvent("set-map-controls-open", { detail: false }));
    }
  }, [isOpen]);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState(1);

  const calculateCardPosition = useCallback((rect: DOMRect | null, position: string) => {
    // Use more accurate card dimensions - account for mobile screens and special positioning
    const isMobile = window.innerWidth < 768;
    const isCookieConsent = steps[currentStep]?.id === "cookie-consent";

    // Responsive card sizing for cookie consent step
    let cardWidth, cardHeight;
    if (isCookieConsent) {
      // Extra responsive sizing for cookie consent
      if (window.innerWidth < 480) {
        // Small mobile
        cardWidth = Math.min(280, window.innerWidth - 24);
        cardHeight = 280;
      } else if (window.innerWidth < 768) {
        // Mobile/tablet
        cardWidth = Math.min(320, window.innerWidth - 32);
        cardHeight = 300;
      } else {
        // Desktop
        cardWidth = 340;
        cardHeight = 320;
      }
    } else {
      // Default sizing for other steps
      cardWidth = isMobile ? Math.min(320, window.innerWidth - 32) : 280;
      cardHeight = 260;
    }
    const padding = isMobile ? 16 : 24;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Default center position
    let x = windowWidth / 2 - cardWidth / 2;
    let y = windowHeight / 2 - cardHeight / 2;

    if (position === "bottom-left") {
      // Special positioning for cookie consent - always bottom left corner
      // Responsive margins based on screen size
      const responsiveMargin = window.innerWidth < 480 ? 8 : window.innerWidth < 768 ? 12 : 20;
      x = responsiveMargin; // Left margin
      y = windowHeight - cardHeight - responsiveMargin; // Bottom margin

      // Ensure card doesn't go off-screen
      x = Math.max(responsiveMargin, Math.min(x, windowWidth - cardWidth - responsiveMargin));
      y = Math.max(responsiveMargin, Math.min(y, windowHeight - cardHeight - responsiveMargin));
    } else if (rect && position !== "center") {
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
        isActuallyVisible = style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";

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

  const handleCookieConsent = (action: "accept" | "essential" | "reject") => {
    switch (action) {
      case "accept":
        acceptAll();
        break;
      case "essential":
        acceptEssentialOnly();
        break;
      case "reject":
        rejectAll();
        break;
    }
    // Auto proceed to next step
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleNext = () => {
    // Prevent proceeding if still on cookie consent step
    if (steps[currentStep].id === "cookie-consent") {
      return; // User must choose cookie option first
    }

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
            {(isBrightenBg || !spotlightRect) && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`absolute inset-0 ${isBrightenBg ? "bg-black/20" : "bg-black/60"} pointer-events-auto`} />}
          </AnimatePresence>

          {/* Spotlight - only show when not brightenBg */}
          {spotlightRect && !isBrightenBg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={
                step.isCircle
                  ? {
                      opacity: 1,
                      left: spotlightRect.left + spotlightRect.width / 2 - (Math.max(spotlightRect.width, spotlightRect.height) + (window.innerWidth < 768 ? 16 : 24)) / 2,
                      top: spotlightRect.top + spotlightRect.height / 2 - (Math.max(spotlightRect.width, spotlightRect.height) + (window.innerWidth < 768 ? 16 : 24)) / 2,
                      width: Math.max(spotlightRect.width, spotlightRect.height) + (window.innerWidth < 768 ? 16 : 24),
                      height: Math.max(spotlightRect.width, spotlightRect.height) + (window.innerWidth < 768 ? 16 : 24),
                      borderRadius: "50%",
                    }
                  : {
                      opacity: 1,
                      left: spotlightRect.left - (window.innerWidth < 768 ? 4 : 6),
                      top: spotlightRect.top - (window.innerWidth < 768 ? 4 : 6),
                      width: spotlightRect.width + (window.innerWidth < 768 ? 8 : 12),
                      height: spotlightRect.height + (window.innerWidth < 768 ? 8 : 12),
                      borderRadius: window.innerWidth < 768 ? "8px" : "12px",
                    }
              }
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
            className={`absolute top-0 left-0 bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl shadow-xl pointer-events-auto ${
              steps[currentStep]?.id === "cookie-consent"
                ? window.innerWidth < 480
                  ? "w-[calc(100vw-24px)] max-w-[280px] p-3"
                  : window.innerWidth < 768
                  ? "w-[calc(100vw-32px)] max-w-[320px] p-4"
                  : "w-[340px] p-5"
                : window.innerWidth < 768
                ? "w-[calc(100vw-32px)] max-w-[320px] p-4 md:p-5"
                : "w-[280px] p-4 md:p-5"
            }`}>
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

                {/* Description or Cookie Consent */}
                {step.id === "cookie-consent" ? (
                  <div className="mb-4">
                    <p className="text-sm text-white/80 text-center mb-6">{step.description}</p>
                    <CookieConsentStep onAccept={() => handleCookieConsent("accept")} onReject={() => handleCookieConsent("reject")} onEssentialOnly={() => handleCookieConsent("essential")} />
                  </div>
                ) : (
                  <p className="text-sm text-white/80 text-center mb-4">{step.description}</p>
                )}
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

            {/* Buttons - Hide for cookie consent step */}
            {step.id !== "cookie-consent" && (
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
            )}

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
