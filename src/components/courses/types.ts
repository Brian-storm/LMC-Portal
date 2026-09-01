import en from "@/dictionaries/en.json";

export type CourseViewDict = typeof en.courseView & {
  categoryValues: Record<string, string>;
  deliveryModeValues: Record<string, string>;
  languageValues: Record<string, string>;
};
export type CourseStatus = "open" | "fewSeats" | "full" | "closed";
export type CourseCategory = "cpd" | "compliance" | "management";

export interface Instructor {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  bio: string;
}

export interface SyllabusModule {
  moduleNumber: number;
  title: string;
  duration: string;
  topics: string[];
}

export interface ScheduleSession {
  id: string;
  dateAndTime: string;
  venue: string;
  quotaRemaining: number;
}

export interface CourseReview {
  id: string;
  authorName: string;
  authorRole: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CourseFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface Course {
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: CourseCategory;
  cpdHours: number | string;
  deliveryMode: string;
  language: string;
  fee: string;
  feeHKD?: number | string;
  status?: CourseStatus;
  brochureUrl?: string;
  iaRefNumber?: string;
  iaCode?: string;
  speaker?: string;
  accreditationBody?: string;
  isMandatory?: boolean;
  date?: string;
  venue?: string;
  seatsLeft?: number;
}

export interface DetailedCourse extends Course {
  status: CourseStatus;
  accreditationBody?: string;
  instructors: Instructor[];
  syllabus: SyllabusModule[];
  schedules: ScheduleSession[];
  reviews: CourseReview[];
  faqs: CourseFAQ[];
}