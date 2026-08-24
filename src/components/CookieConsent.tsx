"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CookieConsentProps {
  locale?: string;
}

export function CookieConsent({ locale = "en" }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference Toggles
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already saved cookie preferences
    const consent = localStorage.getItem("lmc_cookie_consent");
    if (!consent) {
      // Delay display slightly for smoother page load experience
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const data = { necessary: true, analytics: true, marketing: true };
    localStorage.setItem("lmc_cookie_consent", JSON.stringify(data));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("lmc_cookie_consent", JSON.stringify(preferences));
    setIsVisible(false);
  };

  const handleDecline = () => {
    const data = { necessary: true, analytics: false, marketing: false };
    localStorage.setItem("lmc_cookie_consent", JSON.stringify(data));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed bottom-5 right-5 z-50 w-full max-w-sm px-4 sm:px-0"
      >
        <div className="bg-white border border-slate-200 rounded-xs shadow-xl p-5 text-slate-800 text-xs sm:text-sm relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-base">
              <Cookie className="w-5 h-5 text-emerald-800 shrink-0" />
              <span>Cookie Preferences</span>
            </div>
            <button
              onClick={handleDecline}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label="Close dialogue"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          {!showPreferences ? (
            <>
              <p className="text-slate-600 leading-relaxed text-xs mb-4">
                We use cookies and analytical tools to ensure portal
                functionality, deliver accredited training records, and enhance
                your user experience. Read our{" "}
                <Link
                  href={`/${locale}/privacy`}
                  className="text-emerald-900 underline font-medium hover:text-emerald-700"
                >
                  Privacy Policy
                </Link>{" "}
                for full details.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-2 px-3 rounded-xs text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Accept All
                  </button>
                  <button
                    onClick={handleDecline}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xs text-xs border border-slate-200 transition-colors"
                  >
                    Essential Only
                  </button>
                </div>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="w-full text-center text-slate-500 hover:text-emerald-900 text-[11px] font-medium py-1 transition-colors underline"
                >
                  Customize Preferences
                </button>
              </div>
            </>
          ) : (
            /* Preferences Customization Panel */
            <div className="space-y-3 pt-1">
              <div className="space-y-2 border-t border-b border-slate-100 py-3 my-2 text-xs">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-slate-500" />
                      Essential Cookies
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Required for portal auth and security.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="h-4 w-4 rounded-xs border-slate-300 text-emerald-900 focus:ring-emerald-900 cursor-not-allowed opacity-60"
                  />
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Analytics & Usage
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Anonymous site usage optimization.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        analytics: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded-xs border-slate-300 text-emerald-900 focus:ring-emerald-900 accent-emerald-900 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons for Preferences */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSavePreferences}
                  className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-2 px-3 rounded-xs text-xs transition-colors"
                >
                  Save Choices
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xs text-xs border border-slate-200 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
