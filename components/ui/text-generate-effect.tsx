"use client";

import { useEffect, useRef } from "react";
import { motion, stagger, useAnimate, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.5,
}: {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");

  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (!hasAnimatedRef.current) {
      // Only animate once to prevent repeated triggering
      animate(
        "span",
        {
          opacity: 1,
          filter: filter ? "blur(0px)" : "none",
        },
        {
          duration,
          delay: stagger(0.2),
        }
      );
      hasAnimatedRef.current = true; // Mark animation as done
    }
  }, [animate, filter, duration]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        <AnimatePresence>
          {wordsArray.map((word, idx) => (
            <motion.span
              key={word + idx}
              initial={{ opacity: 0, filter: filter ? "blur(10px)" : "none" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                duration,
                delay: idx * 0.2,
              }}
              className={`${idx > 2 ? "text-purple" : "text-white"} mx-1`}
            >
              {word}
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className={cn("font-bold", className)}>
      <div className="my-4">
        <div className="leading-snug tracking-wide">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
