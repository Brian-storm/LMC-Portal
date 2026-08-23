import Link from "next/link";
import { BookOpen, UserCheck, Newspaper, ArrowRight } from "lucide-react";

interface FeatureCardsProps {
  currentLocale: string;
}

const FEATURES = [
  {
    icon: BookOpen,
    title: "Professional Courses",
    description:
      "Browse our comprehensive registry of executive training, regulatory compliance programs, and management certificates.",
    cta: "Explore Catalog",
    link: "/courses",
  },
  {
    icon: UserCheck,
    title: "Student & Client Portal",
    description:
      "Access your course dashboards, view transcript history, or manage organizational training records securely.",
    cta: "Sign In To Portal",
    link: "/portal",
  },
  {
    icon: Newspaper,
    title: "Latest News & Insights",
    description:
      "Read our latest publications on consultancy insights, corporate policy developments, and scheduled seminar announcements.",
    cta: "View Announcements",
    link: "/about",
  },
];

export function FeatureCards({ currentLocale }: FeatureCardsProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-900">
            Explore Our Platform
          </h2>
          <p className="text-2xl font-sans font-bold text-slate-900">
            Institutional Services & Quick Access
          </p>
          <div className="w-12 h-0.5 bg-blue-900 mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xs p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xs flex items-center justify-center text-blue-900">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-sans font-bold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 mt-6">
                  <Link
                    href={`/${currentLocale}${feature.link}`}
                    className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-blue-900 hover:text-blue-800 transition-colors group"
                  >
                    <span>{feature.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
