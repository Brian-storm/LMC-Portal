/**
 * CoursesPage — 課程目錄 Server Component。
 *
 * 在 server side 向 `GET /api/courses` 發起初始 fetch（含 locale 與 limit=100），
 * 將結果透過 `mapApiCourse` 轉為前端 `Course` 型別後，以 `initialCourses` prop
 * 傳給 `CoursesView` client component。後續的類別切換、CPD 時數篩選等操作
 * 由 client 端直接向 `/api/courses` 發起二次 fetch。
 *
 * 使用 `no-store` cache 確保每次頁面請求都拿到最新資料。
 */

import { headers } from "next/headers";
import { CoursesView } from "@/components/courses/CoursesView";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { mapApiCourse, ApiCourse } from "@/lib/map-course";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

async function fetchCourses(
  locale: string,
  category?: string,
  cpdHoursMin?: number,
) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const params = new URLSearchParams();
  params.set("locale", locale);
  params.set("limit", "100");
  if (category && category !== "all") params.set("category", category);
  if (cpdHoursMin && cpdHoursMin > 0)
    params.set("cpdHoursMin", String(cpdHoursMin));

  const res = await fetch(`${baseUrl}/api/courses?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch courses");
  const data = await res.json();
  return {
    courses: data.courses.map((c: ApiCourse) => mapApiCourse(c, locale)),
    pagination: data.pagination as {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
  };
}

export default async function CoursesPage({ params }: PageProps) {
  const { locale } = await params;

  const [dict, { courses }] = await Promise.all([
    getDictionary(locale),
    fetchCourses(locale),
  ]);

  return (
    <main className="min-h-screen bg-slate-100/80 border-t border-slate-300 py-6 sm:py-8">
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