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
          className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white ${className}`}>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8">
            <img src="/images/loggs logo.png" alt="Loggs Visual Logo" className="h-16 md:h-20 w-auto" />
          </motion.div>

          {/* Mirage Loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}>
            <l-mirage size="60" speed="2.5" color="black"></l-mirage>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

