import { CourseViewDict } from "@/dictionaries/types";
import { Course } from "./types";
import { CourseCard } from "./CourseCard";

interface CourseListProps {
  courses: Course[];
  dict: CourseViewDict;
  currentLocale: string;
  onClearFilters: () => void;
}

export function CourseList({
  courses,
  dict,
  currentLocale,
  onClearFilters,
}: CourseListProps) {
  return (
    <main className="lg:col-span-3 space-y-3">
      {/* Status Bar */}
      <div className="bg-white border border-slate-300 px-3.5 py-2 flex justify-between items-center text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-emerald-600 rounded-full inline-block"></span>
          <span>{dict.activeRegister}</span>
        </div>
        <span>
          {dict.totalListings}{" "}
          <strong className="text-slate-900">{courses.length}</strong>
        </span>
      </div>

      {/* Empty State or List */}
      {courses.length === 0 ? (
        <div className="bg-white border border-slate-300 rounded-xs p-10 text-center space-y-2">
          <p className="text-slate-600 text-xs font-medium">
            {dict.emptyState}
          </p>
          <button
            onClick={onClearFilters}
            className="inline-block text-xs font-bold text-[#1b4332] hover:underline uppercase tracking-wider"
          >
            {dict.resetSearchParameters}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              dict={dict}
              currentLocale={currentLocale}
            />
          ))}
        </div>
      )}
    </main>
  );
}
