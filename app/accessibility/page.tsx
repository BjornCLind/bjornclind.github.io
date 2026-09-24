import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibility | Bjorn Lindqvist",
  description: "How this site is built to be usable by everyone, and how to report a problem.",
  alternates: { canonical: "/accessibility" },
};

const EMAIL = "bjornlndq@proton.me";

const MEASURES = [
  "Semantic HTML throughout: landmarks, a single heading outline per page and real lists, links and buttons.",
  "Everything works from the keyboard, in reading order, with a visible focus ring and a skip link to the main content.",
  "Text meets WCAG AA contrast against its background.",
  "Animation follows your system's reduce-motion setting, and the pause button in the bottom-left corner stops it on every page. The choice is remembered.",
  "Decorative visuals, such as the globe and the project animations, are hidden from screen readers. Anything they convey is also written out as text.",
  "Content does not depend on JavaScript and reflows to a 320px-wide screen without horizontal scrolling.",
];

const LIMITS = [
  "The interactive visuals respond to a mouse or touch. They are decorative, and nothing on the site depends on them.",
  "The optional Pixel Bjorn character follows the mouse pointer. He is off unless you switch him on.",
];

export default function AccessibilityPage() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="min-h-screen bg-black-100 px-5 text-white sm:px-10"
    >
      <article className="mx-auto max-w-3xl py-24 sm:py-32">
        <Link href="/" className="inline-block text-sm text-purple underline underline-offset-4">
          <span aria-hidden="true">&larr; </span>Back to home
        </Link>

        <h1 className="mt-8 text-3xl font-bold sm:text-4xl">Accessibility</h1>
        <p className="mt-6 text-lg leading-relaxed text-white-100">
          This site aims to conform to the Web Content Accessibility Guidelines
          (WCAG) 2.2 at level AA.
        </p>

        <h2 className="mt-12 text-xl font-semibold">What that covers</h2>
        <ul className="mt-5 space-y-3 leading-relaxed text-white-200">
          {MEASURES.map((m) => (
            <li key={m} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-purple/60" />
              <span>{m}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-xl font-semibold">Known limitations</h2>
        <ul className="mt-5 space-y-3 leading-relaxed text-white-200">
          {LIMITS.map((m) => (
            <li key={m} className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-purple/60" />
              <span>{m}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-xl font-semibold">Found a problem?</h2>
        <p className="mt-5 leading-relaxed text-white-200">
          If something is hard to use, email{" "}
          <a href={`mailto:${EMAIL}`} className="text-purple underline underline-offset-4">
            {EMAIL}
          </a>{" "}
          with the page and what went wrong, and I will fix it.
        </p>

        <p className="mt-12 text-sm text-white-200">Last reviewed September 2026.</p>
      </article>
    </main>
  );
}
