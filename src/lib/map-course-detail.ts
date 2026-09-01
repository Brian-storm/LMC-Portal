import { DetailedCourse, SyllabusModule, Instructor, ScheduleSession, CourseReview, CourseFAQ } from "@/components/courses/types";

/** Raw API instructor from the junction table { instructor: { ... } } */
interface ApiCourseInstructor {
  instructor: {
    id: string;
    nameZh: string;
    nameEn: string;
    titleZh: string | null;
    titleEn: string | null;
    bioZh: string | null;
    bioEn: string | null;
    avatarUrl: string | null;
  };
}

/** Raw API syllabus item with locale-aware fields */
interface ApiSyllabusItem {
  id: string;
  moduleNumber: number;
  titleZh: string;
  titleEn: string;
  duration: string;
  topicsZh: string[];
  topicsEn: string[];
  sortOrder: number;
}

/** Raw API schedule */
interface ApiSchedule {
  id: string;
  dateAndTime: string;
  venue: string;
  quotaRemaining: number;
}

/** Raw API review */
interface ApiReview {
  id: string;
  authorName: string;
  authorRole: string | null;
  rating: number;
  comment: string;
  date: string;
}

/** Raw API FAQ with locale-aware fields */
interface ApiFaq {
  id: string;
  questionZh: string;
  questionEn: string;
  answerZh: string;
  answerEn: string;
  sortOrder: number;
}

/** Full course response from GET /api/courses/[slug] */
export interface ApiCourseDetail {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string | null;
  descriptionEn: string | null;
  category: string;
  iaRefNumber: string | null;
  accreditationBody: string | null;
  cpdHours: number;
  price: number;
  capacity: number;
  registrationStatus: string;
  deliveryMode: string | null;
  language: string | null;
  instructors: ApiCourseInstructor[];
  syllabusItems: ApiSyllabusItem[];
  schedules: ApiSchedule[];
  reviews: ApiReview[];
  faqs: ApiFaq[];
}

export function mapApiCourseDetail(c: ApiCourseDetail, locale: string): DetailedCourse {
  const isZh = locale === "zh-hk" || locale === "zh-cn";

  /** Pick a locale-aware string from zh/en pair */
  const localized = (zh: string | null | undefined, en: string | null | undefined): string =>
    isZh ? (zh ?? en ?? "") : (en ?? zh ?? "");

  const instructors: Instructor[] = c.instructors.map((ci) => ({
    id: ci.instructor.id,
    name: localized(ci.instructor.nameZh, ci.instructor.nameEn),
    title: localized(ci.instructor.titleZh, ci.instructor.titleEn),
    photoUrl: ci.instructor.avatarUrl ?? "/placeholder.svg",
    bio: localized(ci.instructor.bioZh, ci.instructor.bioEn),
  }));

  const syllabus: SyllabusModule[] = c.syllabusItems.map((si) => ({
    moduleNumber: si.moduleNumber,
    title: localized(si.titleZh, si.titleEn),
    duration: si.duration,
    topics: isZh ? si.topicsZh : si.topicsEn,
  }));

  const schedules: ScheduleSession[] = c.schedules.map((s) => ({
    id: s.id,
    dateAndTime: s.dateAndTime,
    venue: s.venue,
    quotaRemaining: s.quotaRemaining,
  }));

  const reviews: CourseReview[] = c.reviews.map((r) => ({
    id: r.id,
    authorName: r.authorName,
    authorRole: r.authorRole ?? "",
    rating: r.rating,
    comment: r.comment,
    date: typeof r.date === "string" ? r.date : new Date(r.date).toISOString().slice(0, 10),
  }));

  const faqs: CourseFAQ[] = c.faqs.map((f) => ({
    id: f.id,
    question: localized(f.questionZh, f.questionEn),
    answer: localized(f.answerZh, f.answerEn),
  }));

  return {
    id: c.id,
    slug: c.slug,
    title: localized(c.nameZh, c.nameEn),
    description: localized(c.descriptionZh, c.descriptionEn),
    category: c.category as DetailedCourse["category"],
    cpdHours: c.cpdHours,
    deliveryMode: c.deliveryMode ?? "",
    language: c.language ?? "",
    fee: c.price === 0 ? "Free" : `HKD ${c.price.toLocaleString()}`,
    status: (c.registrationStatus?.toLowerCase() ?? "open") as DetailedCourse["status"],
    iaRefNumber: c.iaRefNumber ?? undefined,
    accreditationBody: c.accreditationBody ?? undefined,
    instructors,
    syllabus,
    schedules,
    reviews,
    faqs,
  };
}