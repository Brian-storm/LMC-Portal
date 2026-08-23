"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, User, Mail } from "lucide-react";

interface NewsletterFormProps {
  currentLocale: string;
}

export function NewsletterForm({ currentLocale }: NewsletterFormProps) {
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    <section className="bg-slate-900 text-white py-14 border-t border-slate-800">
      <div className="container mx-auto px-4 max-w-4xl text-center space-y-6">
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Stay Informed
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Subscribe to Consultancy Bulletins
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Receive quarterly regulatory updates, upcoming course schedules, and
            executive industry insights directly in your inbox.
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-slate-800 border border-slate-700 text-blue-200 p-4 rounded-xs max-w-lg mx-auto flex items-center justify-center space-x-2 text-xs">
            <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            <span>
              Thank you for subscribing. You have been added to our mailing
              list.
            </span>
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
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xs pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xs pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 text-white font-medium px-5 py-2 text-xs uppercase tracking-wider transition-colors rounded-xs shrink-0 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Subscribe"}
            </button>
          </form>
        )}

        <p className="text-[10px] text-slate-500">
          We respect your privacy. Unsubscribe at any time. View our{" "}
          <Link
            href={`/${currentLocale}/privacy`}
            className="underline hover:text-slate-400"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
