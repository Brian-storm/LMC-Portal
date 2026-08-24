import { Course } from "@/components/courses/types";
import { CoursesView } from "@/components/courses/CourseView";
import { getDictionary } from "@/dictionaries/get-dictionary";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

// Example data source (replace with your DB query or API fetch)
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
    <CoursesView
      currentLocale={locale}
      dict={dict.courseView}
      initialCourses={courses}
    />
  );
}
