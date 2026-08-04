"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface GenerationHeroProps {
  destination: string | null;
  state: string;
}

const AI_THOUGHTS = [
  "Mapping the hidden corners of your destination…",
  "Consulting local knowledge and travel wisdom…",
  "Balancing discovery with authentic experience…",
  "Curating a journey that fits only you…",
  "Weaving together pace, mood, and place…",
  "Selecting the moments that matter most…",
];

export function GenerationHero({ destination, state }: GenerationHeroProps) {
  const [thoughtIndex, setThoughtIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter cycling through AI_THOUGHTS
  useEffect(() => {
    if (state === "PERSISTING") return;
    const thought = AI_THOUGHTS[thoughtIndex];
    let charIndex = 0;
    setDisplayed("");
    setIsTyping(true);

    const typeInterval = setInterval(() => {
      charIndex++;
      setDisplayed(thought.slice(0, charIndex));
      if (charIndex === thought.length) {
        clearInterval(typeInterval);
        setIsTyping(false);
        // Pause then advance to next thought
        setTimeout(() => {
          setThoughtIndex((prev) => (prev + 1) % AI_THOUGHTS.length);
        }, 2600);
      }
    }, 32);

    return () => clearInterval(typeInterval);
  }, [thoughtIndex, state]);

  const displayDestination = destination?.split(",")[0]?.trim() || "Your Journey";

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] mb-8" style={{ height: "360px", boxShadow: "0 24px 60px -20px rgba(26, 31, 26, 0.4)" }}>
      {/* Deep editorial background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #151915 0%, #1c241c 40%, #171d15 70%, #0f130e 100%)",
        }}
      />

      {/* Ambient orb — top right */}
      <motion.div
        className="absolute -top-20 -right-20 rounded-full"
        style={{
          width: 360,
          height: 360,
          background:
            "radial-gradient(circle, rgba(116,135,107,0.30) 0%, rgba(116,135,107,0.08) 55%, transparent 75%)",
        }}
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary orb — bottom left */}
      <motion.div
        className="absolute -bottom-16 -left-16 rounded-full"
        style={{
          width: 260,
          height: 260,
          background:
            "radial-gradient(circle, rgba(180,160,120,0.18) 0%, rgba(180,160,120,0.04) 60%, transparent 80%)",
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.5, 0.85, 0.5],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Subtle texture grain overlay */}
      <div
        className="absolute inset-0 bg-grain opacity-[0.04] mix-blend-overlay pointer-events-none"
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 px-10 pt-12 pb-10 flex flex-col justify-between h-full" style={{ height: "360px" }}>
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2.5"
        >
          <span
            className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.3em]"
            style={{ color: "rgba(116,135,107,0.9)" }}
          >
            <AiOrb />
            Wayheld Concierge · Crafting
          </span>
        </motion.div>

        {/* Destination headline */}
        <div className="mt-8 mb-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="font-display font-light leading-[1.0] tracking-[-0.02em] line-clamp-3"
            style={{
              fontSize: "clamp(2.8rem, 7vw, 4.5rem)",
              color: "#F4EFE6",
              textShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            {displayDestination}
          </motion.h2>
        </div>

        {/* Typewriter AI thought */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 flex items-start gap-3"
        >
          <div
            className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full"
            style={{ background: "rgba(116,135,107,0.8)" }}
          />
          <div className="text-sm leading-relaxed min-h-[1.4rem]" style={{ color: "rgba(244,239,230,0.6)" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={thoughtIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {displayed}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    style={{ color: "rgba(116,135,107,0.9)" }}
                  >
                    |
                  </motion.span>
                )}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Small pulsing AI orb indicator */
function AiOrb() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <motion.span
        className="absolute inline-flex h-full w-full rounded-full"
        style={{ backgroundColor: "rgba(116,135,107,0.7)" }}
        animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ backgroundColor: "rgba(116,135,107,1)" }}
      />
    </span>
  );
}
