"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCarouselDict } from "@/dictionaries/types"

export interface HeroSlideData {
  title: string;
  subtitle: string;
  ctaText: string;
}

interface HeroCarouselProps {
  currentLocale: string;
  dict?: HeroCarouselDict;
}

const DEFAULT_SLIDES = [
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
      "https://images.unsplash.com/photo-1672380135241-c024f7fbfa13?q=80&w=1600&auto=format&fit=crop",
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

export function HeroCarousel({ currentLocale, dict }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Merge image & link metadata with localized text content from dict
  const slides = DEFAULT_SLIDES.map((slide, index) => ({
    ...slide,
    title: dict?.slides?.[index]?.title || slide.title,
    subtitle: dict?.slides?.[index]?.subtitle || slide.subtitle,
    ctaText: dict?.slides?.[index]?.ctaText || slide.ctaText,
  }));

  const badgeText = dict?.badge || "LMC Management Consultancy";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative !h-[460px] sm:!h-[520px] md:!h-[560px] overflow-hidden bg-[#1b4332] text-white">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide
              ? "opacity-100 z-10 pointer-events-auto"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${slide.image}')` }}
          >
            {/* Preserved dark blue image overlay */}
            <div className="absolute inset-0 bg-emerald-950/60 backdrop-brightness-90" />
          </div>

          <div className="relative z-20 container mx-auto px-4 max-w-7xl h-full flex flex-col justify-center items-start">
            <div className="max-w-2xl space-y-4">
              <span className="inline-block px-2.5 py-1 bg-emerald-950/90 text-emerald-100 text-[10px] font-semibold uppercase tracking-wider rounded-xs border border-emerald-800/50">
                {badgeText}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-white tracking-tight leading-tight">
                {slide.title}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {slide.subtitle}
              </p>
              <div className="pt-2">
                <Link
                  href={`/${currentLocale}${slide.ctaLink}`}
                  className="inline-flex items-center space-x-2 bg-accent hover:bg-navbar-accent-hover text-accent-foreground font-bold px-5 py-2.5 text-xs uppercase tracking-wider transition-colors rounded-xs shadow-md"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 transition-all rounded-xs ${
              index === currentSlide
                ? "w-8 bg-accent"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
