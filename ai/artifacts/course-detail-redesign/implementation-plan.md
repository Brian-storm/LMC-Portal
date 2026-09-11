# Implementation Plan: Course Detail Page Redesign

## Epic
Course Detail Page — 「香港醫療體制發展、大灣區醫療概況與醫療保障」

## Source
`course_details.md` — structured layout with organizers, course title, description, topics list, details table, and certificates section.

---

## 1. Current State Analysis

### Prisma Schema (`prisma/schema.prisma`)
The `Course` model currently lacks these fields required by the source markdown:
- `organizer` / `organizerZh` / `organizerEn`
- `coOrganizer` / `coOrganizerZh` / `coOrganizerEn`
- `courseCode`
- `feeDescription` (rich text for the fee breakdown)

Existing relevant fields:
- `nameZh`, `nameEn`, `nameCn` (course title)
- `descriptionZh`, `descriptionEn`, `descriptionCn`
- `cpdHours`, `cpdHoursIa`
- `price`, `unitPrice`
- `deliveryMode`, `language`
- `syllabusItems`, `schedules`, `instructors`, `faqs`

### API Layer
- `GET /api/courses/[slug]` returns course + nested instructors, syllabusItems, schedules, reviews, faqs
- `mapApiCourseDetail()` in `src/lib/map-course-detail.ts` maps API response to `DetailedCourse` type

### Frontend
- `CourseDetailView` (`src/components/courses/CourseDetailView.tsx`) renders the detail page
- Dictionary keys in `courseView` section of `en.json`, `zh-hk.json`, `zh-cn.json`
- `types.ts` defines `DetailedCourse`, `SyllabusModule`, `Instructor`, `ScheduleSession` etc.

---

## 2. Required Changes

### Task 1: Add new fields to Prisma schema

**Files:**
- `prisma/schema.prisma`

**Changes:**
Add these fields to the `Course` model:

```prisma
organizerZh   String?
organizerEn   String?
coOrganizerZh String?
coOrganizerEn String?
courseCode    String?
feeDescriptionZh String?
feeDescriptionEn String?
feeDescriptionCn String?
certificateDescriptionZh String?
certificateDescriptionEn String?
certificateDescriptionCn String?
```

Then run `npx prisma migrate dev --name add_course_detail_fields`.

### Task 2: Add fields to API types and mapper

**Files:**
- `src/lib/map-course-detail.ts`
- `src/components/courses/types.ts`

**Changes to `ApiCourseDetail` (map-course-detail.ts):**
Add:
```ts
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
```

**Changes to `DetailedCourse` (types.ts):**
Add:
```ts
organizer?: string;
coOrganizer?: string;
courseCode?: string;
feeDescriptionZh?: string;
feeDescriptionEn?: string;
feeDescriptionCn?: string;
certificateDescriptionZh?: string;
certificateDescriptionEn?: string;
certificateDescriptionCn?: string;
```

**Changes to `mapApiCourseDetail()` mapper:**
Add mapping logic for new fields using locale-aware pickers.

### Task 3: Add dictionary keys

**Files:**
- `src/dictionaries/en.json`
- `src/dictionaries/zh-hk.json`
- `src/dictionaries/zh-cn.json`
- `src/dictionaries/types.ts` (if new slice types needed)

**New keys under `courseView`:**
```json
{
  "organizerLabel": "Organizer",
  "coOrganizerLabel": "Co-organizer",
  "topicsSectionTag": "Course Topics",
  "topicsHint": "Can enroll in one or more topic courses",
  "courseDetailsTable": "Course Details",
  "certificatesSection": "Certificates & CPD Hours",
  "singleTopicCpd": "Per single topic course:",
  "allTopicsCpd": "Upon completing all six topic courses:",
  "attendanceCert": "Attendance Certificate issued by CUHK Medical Centre",
  "graduationCert": "Graduation Certificate issued by CUHK Medical Centre",
  "feeNote": "Fee includes course materials and certificate.",
  "enrollPrompt": "Enroll in one or more topics"
}
```

### Task 4: Redesign CourseDetailView component

**File:**
- `src/components/courses/CourseDetailView.tsx`

**Changes:**
Restructure the page layout to match the `course_details.md` structure:

1. **Organizers Section** — Show organizer (LMC) and co-organizer (CUHK Medical Centre) at the top
2. **Course Title** — Display the full course name + English subtitle
3. **Course Description** — Description paragraph
4. **Course Topics** — Numbered list of 6 topics (from syllabusItems), each with Chinese + English title, clickable to filter/select
5. **Course Details Table** — Key-value table with: course type, delivery mode, language, venue, dates, hours, fee structure
6. **Certificates & CPD Hours** — Section showing per-topic and all-topics CPD credits, with certificate descriptions
7. Keep existing sections: Syllabus & Modules, Instructor Profiles, FAQs

**Layout:**
- Single column (full-width) instead of sidebar grid
- Topics section prominently displayed with enrollment options
- Details table styled as a two-column grid

### Task 5: Update the course detail page server component (if needed)

**File:**
- `src/app/[locale]/courses/[slug]/page.tsx`

May update to pass new fields if the component needs them directly.

---

## 3. Verification Criteria

1. `npm run typecheck` passes with no errors
2. `npm run lint` passes
3. Course detail page renders all sections from `course_details.md`
4. All dictionary keys resolve correctly in en, zh-hk, zh-cn
5. i18n locale-aware field picking works (cn → zh → en fallback)
6. Responsive layout works on mobile/tablet/desktop

---

## 4. Risks & Dependencies

- **Database migration required** — new fields added to Prisma schema
- **Existing course data** — existing courses will have null values for new fields; component must handle gracefully
- **Mock data** — if using seed data, seed script must be updated with new fields
- **No `organizer`/`coOrganizer` in current Prisma model** — these are completely new fields
