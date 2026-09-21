// Shared types for enrollment components

export interface ScheduleInstructor {
  name: string;
  title: string;
  bio: string;
}

export interface SyllabusItem {
  id: string;
  moduleNumber: number;
  titleZh: string;
  titleEn: string;
  duration: string;
  topicsZh: string[];
  topicsEn: string[];
}

export interface ScheduleTopic {
  syllabusItem: SyllabusItem;
}

export interface Schedule {
  id: string;
  dateAndTime: string;
  sessionDate: string | null;
  startTime: string;
  endTime: string;
  venue: string;
  quotaRemaining: number;
  instructor?: ScheduleInstructor;
  topics: ScheduleTopic[];
}

export interface CourseData {
  id: string;
  nameZh: string;
  nameEn: string;
  nameCn: string | null;
  price: string;
  unitPrice?: string;
  registrationStatus: string;
  capacity: number;
  schedules: Schedule[];
}