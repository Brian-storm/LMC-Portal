"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  UserCheck,
  Newspaper,
  ArrowRight,
  ShieldCheck,
  Award,
  CheckCircle2,
  Mail,
  User,
} from "lucide-react";

interface HomePageProps {
  currentLocale: string;
}

// Sample image slides for the Hero Banner
const HERO_SLIDES = [
  {
    id: 1,
    title: "Executive Training & Professional Advisory",
    subtitle:
      "Empowering organizations and professionals with institutional-grade management consulting and accredited courses.",
    ctaText: "Explore Courses",
    ctaLink: "/courses",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Seamless Access via Student & Client Portals",
    subtitle:
      "Track certifications, access course materials, and manage accounts with enterprise security.",
    ctaText: "Access Portal",
    ctaLink: "/portal",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Industry Leadership & Strategic Insight",
    subtitle:
      "Stay ahead of compliance regulations, financial technologies, and corporate governance standards.",
    ctaText: "Read Insights",
    ctaLink: "/about",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1600&auto=format&fit=crop",
  },
];

export function HomePage({ currentLocale }: HomePageProps) {
  // --- Slide Carousel State ---
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length,
    );

  // --- Form Subscription State ---
  const [formData, setFormData] = useState({ fullName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email) return;

    setIsSubmitting(true);
    // Simulate API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({ fullName: "", email: "" });
    }, 800);
  };

  return (
    <div className="bg-slate-50 text-slate-800">
      {/* SECTION 1: Sliding Image Hero Banner */}
      <section className="relative h-[480px] sm:h-[540px] md:h-[600px] overflow-hidden bg-slate-900 text-white">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 z-10 pointer-events-auto"
                : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Background Image with Dark Gradient Overlay for Contrast */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${slide.image}')` }}
            >
              <div className="absolute inset-0 bg-slate-950/70 backdrop-brightness-90" />
            </div>

            {/* Slide Content Overlay */}
            <div className="relative z-20 container mx-auto px-4 max-w-7xl h-full flex flex-col justify-center items-start">
              <div className="max-w-2xl space-y-4">
                <span className="inline-block px-2.5 py-1 bg-blue-900/90 text-blue-100 text-[10px] font-semibold uppercase tracking-wider rounded-xs border border-blue-700/50">
                  LMC Management Consultancy
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
                  {slide.title}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="pt-2">
                  <Link
                    href={`/${currentLocale}${slide.ctaLink}`}
                    className="inline-flex items-center space-x-2 bg-blue-900 hover:bg-blue-800 text-white font-medium px-5 py-2.5 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-md"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Navigation Arrows; disabled for clean UI */}
        {/* <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-slate-900/60 hover:bg-slate-900 text-white border border-slate-700/80 rounded-xs transition-colors"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-slate-900/60 hover:bg-slate-900 text-white border border-slate-700/80 rounded-xs transition-colors"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button> */}

        {/* Slide Indicators / Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 transition-all rounded-xs ${
                index === currentSlide
                  ? "w-8 bg-blue-500"
                  : "w-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* SECTION 2: Key Credentials Bar */}
      <section className="bg-white border-b border-slate-200 py-6">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <ShieldCheck className="w-8 h-8 text-blue-900 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Accredited Curriculums
                </h4>
                <p className="text-slate-500 text-xs">
                  Recognized by regional governing bodies.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <Award className="w-8 h-8 text-blue-900 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Executive Advisory
                </h4>
                <p className="text-slate-500 text-xs">
                  Taught by seasoned industry leaders.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start space-x-3">
              <CheckCircle2 className="w-8 h-8 text-blue-900 shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                  Secure Enterprise Portal
                </h4>
                <p className="text-slate-500 text-xs">
                  24/7 access to student records and resources.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Multi-purpose Feature Navigation Cards */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-900">
              Explore Our Platform
            </h2>
            <p className="text-2xl font-serif font-bold text-slate-900">
              Institutional Services & Quick Access
            </p>
            <div className="w-12 h-0.5 bg-blue-900 mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Courses */}
            <div className="bg-white border border-slate-200 rounded-xs p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xs flex items-center justify-center text-blue-900">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Professional Courses
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Browse our comprehensive registry of executive training,
                  regulatory compliance programs, and management certificates.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href={`/${currentLocale}/courses`}
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-blue-900 hover:text-blue-800 transition-colors group"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Feature 2: Portal Sign-In */}
            <div className="bg-white border border-slate-200 rounded-xs p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xs flex items-center justify-center text-blue-900">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Student & Client Portal
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Access your course dashboards, view transcript history, or
                  manage organizational training records securely.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href={`/${currentLocale}/portal`}
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-blue-900 hover:text-blue-800 transition-colors group"
                >
                  <span>Sign In To Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Feature 3: Recent Updates & Insights */}
            <div className="bg-white border border-slate-200 rounded-xs p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xs flex items-center justify-center text-blue-900">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Latest News & Insights
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Read our latest publications on consultancy insights,
                  corporate policy developments, and scheduled seminar
                  announcements.
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 mt-6">
                <Link
                  href={`/${currentLocale}/about`}
                  className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-blue-900 hover:text-blue-800 transition-colors group"
                >
                  <span>View Announcements</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Institutional Newsletter & Updates Subscription Form */}
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
              Receive quarterly regulatory updates, upcoming course schedules,
              and executive industry insights directly in your inbox.
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
              {/* Full Name Input */}
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

              {/* Email Input */}
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

              {/* Submit Button */}
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
    </div>
  );
}
