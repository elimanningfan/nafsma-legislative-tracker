"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("nafsma-cookie-consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem("nafsma-cookie-consent", "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem("nafsma-cookie-consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-nafsma-dark-navy border-t border-gray-700 p-4 shadow-lg">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-300">
          This website uses cookies for essential functionality and analytics.
          See our{" "}
          <a href="/privacy" className="underline text-white hover:text-nafsma-teal">
            Privacy Policy
          </a>{" "}
          for details.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 text-sm text-gray-300 border border-gray-500 rounded-md hover:bg-gray-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-nafsma-teal text-white font-medium rounded-md hover:bg-nafsma-blue transition-colors"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="p-1 text-gray-400 hover:text-white"
            aria-label="Close cookie banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
