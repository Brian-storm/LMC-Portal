import { Course } from "@/components/courses/types";

/**
 * ApiCourse — 描述 `GET /api/courses` 回傳的清單 course 物件。
 * 欄位對應 Prisma `Course` model 的 selected fields（見
 * `src/app/api/courses/route.ts` 的 GET handler）。
 */
export interface ApiCourse {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  category: string;
  iaRefNumber: string | null;
  cpdHours: number;
  price: number;
  capacity: number;
  registrationStatus: string;
  deliveryMode: string;
  language: string;
  schedules: Array<{
    id: string;
    dateAndTime: string;
    venue: string;
    quotaRemaining: number;
  }>;
}

/**
 * mapApiCourse — 將 API 回傳的原始 course 物件對應到前端 `Course` 型別。
 *
 * 根據 locale 選取中/英文的 name 與 description，並將 Prisma 的
 * registrationStatus（OPEN / FEW_SEATS / FULL / CLOSED）轉為小寫，
 * 以符合 `CourseStatus` 的定義。fee 欄位統一格式為 "HKD xxx" 或 "Free"。
 * 僅取第一個 active schedule 的 venue / quotaRemaining / dateAndTime
 * 作為卡片上顯示的快速資訊。
 */
export function mapApiCourse(c: ApiCourse, locale: string): Course {
  const isZh = locale === "zh-hk" || locale === "zh-cn";
  return {
    id: c.id,
    slug: c.slug,
    title: isZh ? c.nameZh : c.nameEn,
    description: isZh ? c.descriptionZh : c.descriptionEn,
    category: c.category as Course["category"],
    cpdHours: c.cpdHours,
    deliveryMode: c.deliveryMode,
    language: c.language,
    fee: c.price === 0 ? "Free" : `HKD ${c.price.toLocaleString()}`,
    status: (c.registrationStatus?.toLowerCase() ?? "open") as Course["status"],
    iaRefNumber: c.iaRefNumber ?? undefined,
    iaCode: c.iaRefNumber ?? undefined,
    venue: c.schedules?.[0]?.venue,
    seatsLeft: c.schedules?.[0]?.quotaRemaining,
    date: c.schedules?.[0]?.dateAndTime,
  };
}