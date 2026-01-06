"use client";

import { motion, AnimatePresence } from "framer-motion";
import { mirage } from "ldrs";

mirage.register();

interface PageLoaderProps {
  isLoading?: boolean;
  className?: string;
}

export default function PageLoader({ isLoading = true, className = "" }: PageLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: "easeInOut",
            },
          }}
          className={`fixed inset-0 z-[9999] flex flex-col bg-white ${className}`}>
          {/* Top Spacer - for centering logo/loader */}
          <div className="flex-1 flex items-center justify-center">
            {/* Center Content - Logo & Loader */}
            <div className="flex flex-col items-center justify-center text-center">
              {/* Logo */}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: 0.2, duration: 0.5 }} className="mb-8">
                <img src="/images/loggs logo.png" alt="Loggs Visual Logo" className="h-16 md:h-20 w-auto" />
              </motion.div>

              {/* Mirage Loader */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
                <l-mirage size="60" speed="2.5" color="black"></l-mirage>
              </motion.div>
            </div>
          </div>

          {/* Version Info - Fixed at Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center space-y-2">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.8, duration: 0.3 }} className="inline-block px-3 py-1 bg-black/5 rounded-full border border-black/10">
              <div className="text-xs text-black font-medium tracking-wider">VERSION 1.0.0</div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
