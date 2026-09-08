"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, Check, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CookieConsentDict } from "@/dictionaries/types";

interface CookieConsentProps {
  dict: CookieConsentDict;
  locale?: string;
}

// Helper: set a real document.cookie with name, value, and expiry in days.
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days > 0) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  // When days === 0, the cookie expires immediately (effective deletion).
  // For days > 0, set a normal cookie with the given lifespan.
  // For days < 0, we delete the cookie by setting max-age=0.
  const maxAge = days < 0 ? 0 : days * 86400;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${expires}`;
};

// Apply the consent decision as real cookies so server / analytics vendors
// can read the user's choice.
const applyConsentCookies = (data: {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}) => {
  const YEAR = 365;
  // Necessary cookies are always applied (portal auth, locale, etc.).
  setCookie("lmc_cookie_necessary", "accepted", YEAR);
  // Analytics – if accepted, set with long expiry; if rejected, delete.
  if (data.analytics) {
    setCookie("lmc_cookie_analytics", "accepted", YEAR);
  } else {
    setCookie("lmc_cookie_analytics", "rejected", -1);
  }
  // Marketing – same approach.
  if (data.marketing) {
    setCookie("lmc_cookie_marketing", "accepted", YEAR);
  } else {
    setCookie("lmc_cookie_marketing", "rejected", -1);
  }
  // Persist the full consent record in localStorage so the banner does not
  // reappear on subsequent visits.
  localStorage.setItem("lmc_cookie_consent", JSON.stringify(data));
};

export function CookieConsent({ dict, locale = "en" }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preference toggles (necessary is always true and locked).
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already saved cookie preferences.
    const consent = localStorage.getItem("lmc_cookie_consent");
    if (!consent) {
      // Delay display slightly for smoother page load experience.
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const data = { necessary: true, analytics: true, marketing: true };
    applyConsentCookies(data);
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    applyConsentCookies(preferences);
    setIsVisible(false);
  };

  const handleDecline = () => {
    const data = { necessary: true, analytics: false, marketing: false };
    applyConsentCookies(data);
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
              <span>{dict.title}</span>
            </div>
            <button
              onClick={handleDecline}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              aria-label={dict.closeDialog}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          {!showPreferences ? (
            <>
              <p className="text-slate-600 leading-relaxed text-xs mb-4">
                {dict.description}{" "}
                <Link
                  href={`/${locale}/privacy`}
                  className="text-emerald-900 underline font-medium hover:text-emerald-700"
                >
                  {dict.privacyPolicy}
                </Link>{" "}
                {dict.descriptionSuffix}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-semibold py-2 px-3 rounded-xs text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {dict.acceptAll}
                  </button>
                  <button
                    onClick={handleDecline}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xs text-xs border border-slate-200 transition-colors"
                  >
                    {dict.essentialOnly}
                  </button>
                </div>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="w-full text-center text-slate-500 hover:text-emerald-900 text-[11px] font-medium py-1 transition-colors underline"
                >
                  {dict.customize}
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
                      {dict.essentialTitle}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {dict.essentialDescription}
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
                      {dict.analyticsTitle}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {dict.analyticsDescription}
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
                  {dict.saveChoices}
                </button>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xs text-xs border border-slate-200 transition-colors"
                >
                  {dict.back}
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}