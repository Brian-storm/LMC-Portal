import en from "@/dictionaries/en.json";

export type CourseViewDict = typeof en.courseView;
export type CourseStatus = "open" | "fewSeats" | "full" | "closed";

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

// Base Course interface used in catalog view
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  cpdHours: number | string;
  deliveryMode: string;
  language: string;
  fee: string;
  status?: CourseStatus;
  iaRefNumber?: string;
  iaCode?: string; // Added optional property
  speaker?: string; // Added optional property
}

// Extended interface for single detailed page
export interface DetailedCourse extends Course {
  status: CourseStatus;
  accreditationBody?: string;
  instructors: Instructor[];
  syllabus: SyllabusModule[];
  schedules: ScheduleSession[];
  reviews: CourseReview[];
  faqs: CourseFAQ[];
}
