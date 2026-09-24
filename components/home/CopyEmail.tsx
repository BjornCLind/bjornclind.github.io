"use client";

import { useState } from "react";

const EMAIL = "bjornlndq@proton.me";

/**
 * The address is a real mailto link, so it works without JavaScript and for
 * anyone who wants their mail client. The copy button is the convenience on
 * top, for people who would rather paste it somewhere.
 */
export default function CopyEmail() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be refused (permissions, insecure context); the mailto
      // link beside this still works.
    }
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
        <span aria-live="polite">{copied ? "Copied" : "Copy address"}</span>
      </button>
    </div>
  );
}
