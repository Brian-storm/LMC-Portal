import { CourseCard, CourseProps } from "@/components/CourseCard";

const sampleCourses: CourseProps[] = [
  {
    id: "c1",
    title: "Insurance Regulatory & Ethics Framework 2026",
    description:
      "In-depth review of Insurance Authority regulations, ethical guidelines, and practical compliance scenarios.",
    cpdHours: 3,
    accreditation: "HKFI / CII Approved",
    priceHKD: 1200,
    category: "Compliance",
  },
];

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Course Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sampleCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
