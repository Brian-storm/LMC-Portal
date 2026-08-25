import { Course } from "@/components/courses/types";
import { CoursesView } from "@/components/courses/CoursesView";
import { getDictionary } from "@/dictionaries/get-dictionary";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

async function getCourses(): Promise<Course[]> {
  return [
    {
      id: "cpd-101",
      title: "Certificate in Legacy Planning",
      description:
        "Comprehensive guide to estate structure and trust governance.",
      category: "cpd",
      cpdHours: 10,
      deliveryMode: "Online / In-person",
      language: "Cantonese / English",
      fee: "HKD 2,800",
      status: "fewSeats",
    },
    {
      id: "cpd-102",
      title: "Overview of Healthcare in the Greater Bay Area",
      description:
        "Regulatory frameworks and healthcare cross-border opportunities.",
      category: "compliance",
      cpdHours: 6,
      deliveryMode: "Online",
      language: "Cantonese",
      fee: "HKD 1,500",
      status: "open",
    },
  ];
}

export default async function CoursesPage({ params }: PageProps) {
  const { locale } = await params;

  const [dict, courses] = await Promise.all([
    getDictionary(locale),
    getCourses(),
  ]);

  return (
    <main className="min-h-screen bg-slate-100/80 border-t border-slate-300 py-6 sm:py-8">
      {/* Decorative top institutional header rule */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-300 rounded-xs p-4 sm:p-6 shadow-2xs">
          <CoursesView
            currentLocale={locale}
            dict={dict.courseView}
            initialCourses={courses}
          />
        </div>
      </div>
    </main>
  );
}
