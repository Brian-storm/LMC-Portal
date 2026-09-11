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
  venueEn: string | null;
  venueZh: string | null;
  quotaRemaining: number;
  topics: {
    sortOrder: number;
    syllabusItem: {
      id: string;
      moduleNumber: number;
      titleZh: string;
      titleEn: string;
      duration: string;
      topicsZh: string[];
      topicsEn: string[];
    };
  }[];
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
  nameCn: string | null;
  descriptionZh: string | null;
  descriptionEn: string | null;
  descriptionCn: string | null;
  category: string;
  iaRefNumber: string | null;
  accreditationBody: string | null;
  cpdHours: number;
  cpdHoursIa: number | null;
  cpdRulesZh: string | null;
  cpdRulesEn: string | null;
  cpdRulesCn: string | null;
  price: number;
  unitPrice: number | null;
  capacity: number;
  imageUrl: string | null;
  registrationStatus: string;
  deliveryMode: string | null;
  language: string | null;
  organizerZh: string | null;
  organizerEn: string | null;
  coOrganizerZh: string | null;
  coOrganizerEn: string | null;
  courseCode: string | null;
  feeDescriptionZh: string | null;
  feeDescriptionEn: string | null;
  feeDescriptionCn: string | null;
  certificateDescriptionZh: string | null;
  certificateDescriptionEn: string | null;
  certificateDescriptionCn: string | null;
  instructors: ApiCourseInstructor[];
  syllabusItems: ApiSyllabusItem[];
  schedules: ApiSchedule[];
  reviews: ApiReview[];
  faqs: ApiFaq[];
}

export function mapApiCourseDetail(c: ApiCourseDetail, locale: string): DetailedCourse {
  const isZh = locale === "zh-hk" || locale === "zh-cn";
  // zh-cn locale prefers the Simplified Chinese variant, falling back to
  // Traditional (nameZh) and then English. zh-hk still uses Traditional first.
  const isSimplified = locale === "zh-cn";

  // Locale-aware "Free" label for zero-price courses
  const freeLabel = isSimplified ? "免费" : isZh ? "免費" : "Free";

  /** Pick a locale-aware string from zh/en pair */
  const localized = (zh: string | null | undefined, en: string | null | undefined): string =>
    isZh ? (zh ?? en ?? "") : (en ?? zh ?? "");

  // Three-way localized picker: Simplified → Traditional → English by locale
  const localizedCn = (
    cn: string | null | undefined,
    zh: string | null | undefined,
    en: string | null | undefined,
  ): string => {
    if (isSimplified) return cn ?? zh ?? en ?? "";
    if (isZh) return zh ?? cn ?? en ?? "";
    return en ?? zh ?? cn ?? "";
  };

  // Locale-aware picker for bilingual venue fields:
  // prefer the locale-specific field, fall back to the other language, then to venue
  const localizedVenue = (s: ApiSchedule): string =>
    isZh ? (s.venueZh ?? s.venueEn ?? s.venue)
        : (s.venueEn ?? s.venueZh ?? s.venue);

  // Derive venue: deduplicate schedule venues (locale-aware)
  const uniqueVenues = [...new Set(c.schedules.map(localizedVenue))];

  // Derive datesText: extract date portions from schedule dateAndTime, deduplicated
  const timeRangePattern = /\s+\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/;
  const uniqueDateSet = new Set<string>();
  for (const s of c.schedules) {
    const datePart = s.dateAndTime.replace(timeRangePattern, "").trim();
    if (datePart) uniqueDateSet.add(datePart);
  }
  const dates = [...uniqueDateSet].sort((a, b) => {
    const parseDate = (s: string) => {
      const m = s.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      return m ? new Date(+m[3], +m[2] - 1, +m[1]).getTime() : 0;
    };
    return parseDate(a) - parseDate(b);
  });

  // Derive hoursText: per-topic duration from first syllabus item + total cpdHours
  const perTopicDuration = c.syllabusItems.length > 0
    ? (isZh ? c.syllabusItems[0].duration.replace(/hours/i, "小時").trim() : c.syllabusItems[0].duration)
    : `${c.cpdHours}${isZh ? "小時" : " hours"}`;

  // Build feeStructureLines from syllabus count + unitPrice (bundle price not in DB)
  const feeStructureLines: string[] = [];
  const topicCount = c.syllabusItems.length;
  if (topicCount > 0) {
    feeStructureLines.push(isZh ? `共 ${topicCount} 個主題` : `Total: ${topicCount} topics`);
    if (c.unitPrice) {
      const unitPriceStr = Number(c.unitPrice).toLocaleString();
      if (isZh) {
        feeStructureLines.push(`• 單個主題：HKD ${unitPriceStr} / ${perTopicDuration}`);
      } else {
        feeStructureLines.push(`• Single topic: HKD ${unitPriceStr} / ${perTopicDuration}`);
      }
    }
  }

  const instructors: Instructor[] = c.instructors.map((ci) => ({
    id: ci.instructor.id,
    name: localized(ci.instructor.nameZh, ci.instructor.nameEn),
    title: localized(ci.instructor.titleZh, ci.instructor.titleEn),
    photoUrl: ci.instructor.avatarUrl ?? "/placeholder.svg",
    bio: localized(ci.instructor.bioZh, ci.instructor.bioEn),
  }));

  const syllabus: SyllabusModule[] = c.syllabusItems.map((si) => ({
    id: si.id,
    moduleNumber: si.moduleNumber,
    title: localized(si.titleZh, si.titleEn),
    duration: si.duration,
    topics: isZh ? si.topicsZh : si.topicsEn,
  }));

  const schedules: ScheduleSession[] = c.schedules.map((s) => ({
    id: s.id,
    dateAndTime: s.dateAndTime,
    venue: localizedVenue(s),
    quotaRemaining: s.quotaRemaining,
    topics: (s.topics ?? []).map((t) => ({
      syllabusItem: {
        id: t.syllabusItem.id,
        moduleNumber: t.syllabusItem.moduleNumber,
        title: localized(t.syllabusItem.titleZh, t.syllabusItem.titleEn),
        duration: t.syllabusItem.duration,
        topics: isZh ? t.syllabusItem.topicsZh : t.syllabusItem.topicsEn,
      },
    })),
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
    title: localizedCn(c.nameCn, c.nameZh, c.nameEn),
    description: localizedCn(c.descriptionCn, c.descriptionZh, c.descriptionEn),
    category: c.category as DetailedCourse["category"],
    cpdHours: c.cpdHours,
    cpdHoursIa: c.cpdHoursIa ?? undefined,
    unitPrice: c.unitPrice ?? undefined,
    cpdRulesZh: c.cpdRulesZh ?? undefined,
    cpdRulesEn: c.cpdRulesEn ?? undefined,
    cpdRulesCn: c.cpdRulesCn ?? undefined,
    deliveryMode: c.deliveryMode ?? "",
    language: c.language ?? "",
    fee: c.price === 0 ? freeLabel : `HKD ${c.price.toLocaleString()}`,
    venue: uniqueVenues.join(isZh ? "；" : "; "),
    datesText: dates.join("、"),
    hoursText: isZh
      ? `每堂 ${perTopicDuration}，共 ${c.cpdHours} 小時`
      : `${perTopicDuration} per session, ${c.cpdHours} hours total`,
    feeStructureLines,
    status: (c.registrationStatus?.toLowerCase() ?? "open") as DetailedCourse["status"],
    capacity: c.capacity,
    imageUrl: c.imageUrl ?? undefined,
    iaRefNumber: c.iaRefNumber ?? undefined,
    accreditationBody: c.accreditationBody ?? undefined,
    organizer: localized(c.organizerZh, c.organizerEn),
    coOrganizer: localized(c.coOrganizerZh, c.coOrganizerEn),
    courseCode: c.courseCode ?? undefined,
    feeDescriptionZh: c.feeDescriptionZh ?? undefined,
    feeDescriptionEn: c.feeDescriptionEn ?? undefined,
    feeDescriptionCn: c.feeDescriptionCn ?? undefined,
    certificateDescriptionZh: c.certificateDescriptionZh ?? undefined,
    certificateDescriptionEn: c.certificateDescriptionEn ?? undefined,
    certificateDescriptionCn: c.certificateDescriptionCn ?? undefined,
    instructors,
    syllabus,
    schedules,
    reviews,
    faqs,
  };
}