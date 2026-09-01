"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, User, Mail } from "lucide-react";
import { NewsletterFormDict } from "@/dictionaries/types";

interface NewsletterFormProps {
  currentLocale: string;
  dict?: NewsletterFormDict;
}

export function ConsultationForm({ currentLocale, dict }: NewsletterFormProps) {
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const tag = dict?.tag || "Get Started";
  const title = dict?.title || "Book a Free Consultation";
  const description =
    dict?.description ||
    "Our team will help you find the right CPD courses for your career development. Leave your details and we'll get back to you within 1-2 business days.";
  const namePlaceholder = dict?.namePlaceholder || "Your Name";
  const emailPlaceholder = dict?.emailPlaceholder || "Email Address";
  const submitButton = dict?.submitButton || "Send Enquiry";
  const submittingButton = dict?.submittingButton || "Sending...";
  const successMessage =
    dict?.successMessage ||
    "Thank you for your enquiry. We will contact you within 1-2 business days.";
  const privacyPrefix =
    dict?.privacyPrefix ||
    "We respect your privacy. View our ";
  const privacyLinkText = dict?.privacyLinkText || "Privacy Policy";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ fullName: "", email: "" });
    }, 800);
  };

  return (
    <section className="bg-[#1b4332] text-white py-14 border-t border-emerald-900/50">
      <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
            {tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
            {title}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 p-4 rounded-xs max-w-lg mx-auto flex items-center justify-center space-x-2 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="max-w-xl mx-auto space-y-3 sm:space-y-0 sm:flex sm:gap-3"
          >
            <div className="relative flex-1">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder={namePlaceholder}
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full bg-emerald-950 border border-emerald-800 rounded-xs pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder={emailPlaceholder}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-emerald-950 border border-emerald-800 rounded-xs pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-accent hover:bg-navbar-accent-hover text-accent-foreground font-bold px-5 py-2 text-xs uppercase tracking-wider transition-colors rounded-xs shrink-0 disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? submittingButton : submitButton}
            </button>
          </form>
        )}

        <p className="text-[10px] text-slate-500">
          {privacyPrefix}
          <Link
            href={`/${currentLocale}/privacy`}
            className="underline hover:text-emerald-400"
          >
            {privacyLinkText}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
