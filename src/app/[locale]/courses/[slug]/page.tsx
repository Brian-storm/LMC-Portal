/**
 * CourseDetailPage — 課程詳情 Server Component。
 *
 * 在 server side 向 `GET /api/courses/[slug]` 發起 fetch，
 * 將結果透過 `mapApiCourseDetail` 轉為前端 `DetailedCourse` 型別後，
 * 以 `course` prop 傳給 `CourseDetailView` client component。
 *
 * 當 API 回傳 404 或 slug 不存在時呼叫 `notFound()` 顯示 404 page。
 */

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { CourseDetailView } from "@/components/courses/CourseDetailView";
import { mapApiCourseDetail, ApiCourseDetail } from "@/lib/map-course-detail";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

async function fetchCourse(slug: string, locale: string) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/courses/${slug}?locale=${locale}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch course");
  const data = await res.json();
  return mapApiCourseDetail(data.course as ApiCourseDetail, locale);
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const [dict, course] = await Promise.all([
    getDictionary(locale),
    fetchCourse(slug, locale),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <CourseDetailView
      currentLocale={locale}
      dict={dict.courseView}
      course={course}
    />
  );
}