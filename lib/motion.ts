"use client";

import { useEffect, useState } from "react";

/**
 * Site-wide motion setting.
 *
 * The visitor's operating-system preference is the default; the pause button
 * in the corner overrides it either way and is remembered. The effective
 * value lives on <html data-motion>, set by MOTION_BOOT before the page
 * paints, so CSS and every component read the same answer.
 */

const KEY = "motion";
const EVENT = "motionchange";

/** Runs in <head>, before first paint: no flash of motion the visitor has turned off. */
export const MOTION_BOOT = `(function(){try{var s=localStorage.getItem("${KEY}");var r=s?s==="reduced":matchMedia("(prefers-reduced-motion: reduce)").matches;document.documentElement.dataset.motion=r?"reduced":"full"}catch(e){}})()`;

export function prefersReducedMotion(): boolean {
  const set = document.documentElement.dataset.motion;
  if (set) return set === "reduced";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function apply(reduced: boolean) {
  document.documentElement.dataset.motion = reduced ? "reduced" : "full";
  window.dispatchEvent(new Event(EVENT));
}

export function setReducedMotion(reduced: boolean) {
  try {
    window.localStorage.setItem(KEY, reduced ? "reduced" : "full");
  } catch {
    // Storage can be unavailable; the setting still holds for this page view.
  }
  apply(reduced);
}

/** Follow the operating-system setting live, unless the visitor has chosen. */
export function watchSystemMotion() {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onChange = () => {
    if (!readStored()) apply(media.matches);
  };
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/**
 * A value that changes whenever the motion setting does. Put it in an
 * effect's dependencies and read prefersReducedMotion() inside: the effect
 * then tears down and restarts in the right mode when the setting flips, and
 * its first run still reads the real value rather than a pre-hydration guess.
 */
export function useMotionSetting(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(EVENT, bump);
    return () => window.removeEventListener(EVENT, bump);
  }, []);
  return version;
}
