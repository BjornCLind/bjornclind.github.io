"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Props:
 *  navItems: array of { name: string; link: string; icon?: JSX.Element }
 *    e.g., { name: 'Home', link: '/#hero', icon: <HomeIcon /> }
 *  className?: string
 */
export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;

      // Always visible near the top
      if (scrollYProgress.get() < 0.05) {
        setVisible(true);
      } else {
        // If scrolling up => show, if scrolling down => hide
        setVisible(direction < 0);
      }
    }
  });

  /**
   * Custom click handler for nav items that use hash links (#section).
   * - Prevents default Next.js link jump.
   * - Smoothly scrolls to the target with an offset so it’s not overlapped by the navbar.
   * - Updates the URL hash manually (history.pushState).
   */
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: string
  ) => {
    if (link.startsWith("/#")) {
      e.preventDefault();
      const anchor = link.split("#")[1];
      const target = document.getElementById(anchor);
      if (target) {
        const offset = 100; // Adjust based on your navbar height
        const topPos = target.offsetTop - offset;
        window.scrollTo({ top: topPos, behavior: "smooth" });
        // Update the URL hash without forcing a jump
        window.history.pushState({}, "", link);
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      {/** The motion.div container that slides in/out */}
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed z-[5000] top-10 inset-x-0 mx-auto flex items-center justify-center",
          "px-10 py-5 max-w-fit md:min-w-[70vw] lg:min-w-fit rounded-lg",
          "border border-transparent shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)]",
          "backdrop-blur-[16px] backdrop-saturate-[180%]",
          "[background-color:rgba(17,25,40,0.75)] [border-radius:12px] [border:1px_solid_rgba(255,255,255,0.125)]",
          className
        )}
      >
        {navItems.map((navItem, idx) => (
          <a
            key={`link-${idx}`}
            href={navItem.link}
            onClick={(e) => handleNavClick(e, navItem.link)}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 transition-all",
              "text-sm font-medium rounded-md !cursor-pointer select-none",
              "hover:bg-white/10 hover:text-neutral-50 text-neutral-200"
            )}
          >
            {navItem.icon && <span>{navItem.icon}</span>}
            <span>{navItem.name}</span>
          </a>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
