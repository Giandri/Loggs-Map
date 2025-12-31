"use client";

import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const marqueeText = "powered by loggsvisual  •  ";
  // Repeat text enough times to fill the screen width
  const repeatedText = Array(15).fill(marqueeText).join("");

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
      {/* Footer with gradient fade */}
      <div
        className="w-full h-16 z-50"
        style={{
          background: "linear-gradient(to top, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 0%)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          maskImage: "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, black 50%, transparent 100%)",
        }}
      />

      {/* Running Text with Framer Motion - Seamless Loop */}
      <div className="absolute bottom-1 left-0 right-0 overflow-hidden">
        <motion.div
          className="whitespace-nowrap flex"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            x: {
              duration: 25,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            },
          }}>
          <span className="text-xs font-medium text-white tracking-wider pr-4">{repeatedText}</span>
          <span className="text-xs font-medium text-white tracking-wider pr-4">{repeatedText}</span>
        </motion.div>
      </div>
    </div>
  );
};

export default Footer;
