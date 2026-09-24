"use client";

import { useState } from "react";

const EMAIL = "bjornlndq@proton.me";

/**
 * The address is a real mailto link, so it works without JavaScript and for
 * anyone who wants their mail client. The copy button is the convenience on
 * top, for people who would rather paste it somewhere.
 */
export default function CopyEmail() {
  const [result, setResult] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setResult("copied");
    } catch {
      // Clipboard can be refused (permissions, insecure context); the mailto
      // link beside this still works, and the visitor is told.
      setResult("failed");
    }
    window.setTimeout(() => setResult("idle"), 2400);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={`mailto:${EMAIL}`}
        className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black-100 transition hover:bg-purple"
      >
        {EMAIL}
      </a>
      <button
        type="button"
        onClick={copy}
        className="rounded-full border border-white/15 px-5 py-3 text-sm text-white-100 transition hover:border-white/40 hover:text-white"
      >
        {result === "copied" ? "Copied" : "Copy address"}
      </button>
      {/* The outcome is announced here rather than through the button. It is
          always in the DOM, since a live region added together with its
          message is often missed. Success already shows on the button;
          failure is shown here as well. */}
      <p
        role="status"
        className={result === "failed" ? "basis-full text-sm text-white-200" : "sr-only"}
      >
        {result === "copied"
          ? "Email address copied to the clipboard."
          : result === "failed"
            ? "Couldn't copy. The address is " + EMAIL + "."
            : ""}
      </p>
    </div>
  );
}
