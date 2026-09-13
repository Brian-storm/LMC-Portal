import { PrismaClient, Role, RegistrationStatus, AdminPermission } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Parse a dateAndTime string into a Date for the sessionDate field.
 * Handles two formats:
 *   "2026-09-15 (Sat) 10:00 - 17:00"  → YYYY-MM-DD with time range
 *   "22/09/2026 (星期二) 14:15 - 15:45" → DD/MM/YYYY with weekday and time range
 */
function parseSessionDate(dateAndTime: string): Date {
  const yyyyMmDd = dateAndTime.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (yyyyMmDd) {
    return new Date(`${yyyyMmDd[1]}-${yyyyMmDd[2]}-${yyyyMmDd[3]}T00:00:00Z`);
  }
  const ddMmYyyy = dateAndTime.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (ddMmYyyy) {
    return new Date(`${ddMmYyyy[3]}-${ddMmYyyy[2]}-${ddMmYyyy[1]}T00:00:00Z`);
  }
  throw new Error(`Cannot parse dateAndTime: ${dateAndTime}`);
}

async function main() {
  // ─── Instructors ──────────────────────────────────────────
  const cyrus = await prisma.instructor.upsert({
    where: { id: "ins-cyrus-chung" },
    update: {},
    create: {
      id: "ins-cyrus-chung",
      nameZh: "鍾智明先生",
      nameEn: "Mr. Cyrus Chung",
      titleZh: "家族傳承規劃學院總教練 BA",
      titleEn: "Head Coach of CC Legacy Planning Institute BA",
      bioZh: "專注遺產規劃、信託架構、財富傳承領域的創始專家。",
      bioEn: "Legacy planning founder with deep expertise in estate planning, trust structures, and wealth succession.",
      avatarUrl: "/members/profile-cyrus-chung.svg",
    },
  });

  // Wilson Cheung row is kept for archival/future courses; no seeded course currently links to him.
  await prisma.instructor.upsert({
    where: { id: "ins-wilson-cheung" },
    update: {},
    create: {
      id: "ins-wilson-cheung",
      nameZh: "張志偉先生",
      nameEn: "Mr. Wilson Cheung",
      titleZh: "大灣區醫療政策專家",
      titleEn: "Greater Bay Area Health Policy Specialist",
      bioZh: "擁有全球保險、風險管理、財產意外險、損失理算及仲裁等領域院士資格。",
      bioEn: "With global fellowships in insurance, risk management, property casualty, loss adjusting, and arbitration.",
      avatarUrl: "/members/profile-wilson-cheung.svg",
    },
  });

  // Generic CUHK Medical Centre specialist — some courses (e.g. CPD26090103) are taught
  // by a rotating panel of doctors rather than one fixed instructor.
  const cuhkSpecialist = await prisma.instructor.upsert({
    where: { id: "ins-cuhk-specialist" },
    update: {},
    create: {
      id: "ins-cuhk-specialist",
      nameZh: "香港中文大學醫院 專科醫生",
      nameEn: "CUHK Medical Centre Specialist",
      titleZh: "香港中文大學醫院專科醫生",
      titleEn: "Specialist Team of CUHK Medical Centre",
      bioZh: "由香港中文大學醫院不同專科的醫生輪流主講，涵蓋各專科最新的診斷與治療發展。",
      bioEn: "Delivered by a rotating panel of specialist doctors from CUHK Medical Centre, covering the latest diagnostic and treatment developments across clinical specialties.",
      avatarUrl: "/members/profile-cuhk-specialist.svg",
    },
  });

  // Placeholder instructor for schedule-level instructor links
  const placeholderInstructor = await prisma.instructor.upsert({
    where: { id: "ins-placeholder" },
    update: {},
    create: {
      id: "ins-placeholder",
      nameZh: "待定講師",
      nameEn: "Placeholder Instructor",
      titleZh: "待定",
      titleEn: "To be confirmed",
      bioZh: "此課堂的講師資料將於稍後公佈。",
      bioEn: "Instructor details for this session will be announced later.",
      avatarUrl: null,
    },
  });

  // ─── CPD26090103 schedule-level instructors ────────────────
  // Dr. Ngo Chang Chung — Urology & Robotic Surgery (22/09 14:15)
  const drNgo = await prisma.instructor.upsert({
    where: { id: "ins-ngo-chang-chung" },
    update: {},
    create: {
      id: "ins-ngo-chang-chung",
      nameZh: "Dr. Ngo Chang Chung",
      nameEn: "Dr. Ngo Chang Chung",
      titleZh: "MB BS (HK); FRCSEd (Urol); FCSHK; FHKAM (Surgery)",
      titleEn: "MB BS (HK); FRCSEd (Urol); FCSHK; FHKAM (Surgery)",
      bioZh: null,
      bioEn: null,
      avatarUrl: null,
    },
  });

  // Dr. Jacqueline Choi — HK Healthcare System & GBA (22/09 16:00)
  const drJacquelineChoi = await prisma.instructor.upsert({
    where: { id: "ins-jacqueline-choi" },
    update: {},
    create: {
      id: "ins-jacqueline-choi",
      nameZh: "Dr. Jacqueline Choi",
      nameEn: "Dr. Jacqueline Choi",
      titleZh: "MB ChB (CUHK); MRCP (UK); M Med (Public Health) (Singapore); Dip Med (CUHK); FHKCCM; FFPH; FHKAM (Community Medicine)",
      titleEn: "MB ChB (CUHK); MRCP (UK); M Med (Public Health) (Singapore); Dip Med (CUHK); FHKCCM; FFPH; FHKAM (Community Medicine)",
      bioZh: null,
      bioEn: null,
      avatarUrl: null,
    },
  });

  // Dr. George Law — Sports Medicine (08/10 14:00)
  const drGeorgeLaw = await prisma.instructor.upsert({
    where: { id: "ins-george-law" },
    update: {},
    create: {
      id: "ins-george-law",
      nameZh: "Dr. George Law",
      nameEn: "Dr. George Law",
      titleZh: "MB ChB (CUHK); FRCSEd(Orth); FHKAM (Orthopaedic Surgery); FHKCOS",
      titleEn: "MB ChB (CUHK); FRCSEd(Orth); FHKAM (Orthopaedic Surgery); FHKCOS",
      bioZh: null,
      bioEn: null,
      avatarUrl: null,
    },
  });

  // Dr. Carol Yeung — Gynecological Cancers (08/10 15:45)
  const drCarolYeung = await prisma.instructor.upsert({
    where: { id: "ins-carol-yeung" },
    update: {},
    create: {
      id: "ins-carol-yeung",
      nameZh: "Dr. Carol Yeung",
      nameEn: "Dr. Carol Yeung",
      titleZh: "MB ChB (CUHK); MRCOG; FHKCOG; Cert HKCOG (Gynae Onc); FHKAM (Obstetrics and Gynaecology)",
      titleEn: "MB ChB (CUHK); MRCOG; FHKCOG; Cert HKCOG (Gynae Onc); FHKAM (Obstetrics and Gynaecology)",
      bioZh: null,
      bioEn: null,
      avatarUrl: null,
    },
  });

  // Dr. Yolanda Chan — Breast Cancer (14/10 14:15)
  const drYolandaChan = await prisma.instructor.upsert({
    where: { id: "ins-yolanda-chan" },
    update: {},
    create: {
      id: "ins-yolanda-chan",
      nameZh: "Dr. Yolanda Chan",
      nameEn: "Dr. Yolanda Chan",
      titleZh: "MB BS (HK); FHKAM (Surgery); FCSHK; FRCSEd",
      titleEn: "MB BS (HK); FHKAM (Surgery); FCSHK; FRCSEd",
      bioZh: null,
      bioEn: null,
      avatarUrl: null,
    },
  });

  // Dr. Linda Leung — Lung Cancer (14/10 16:00)
  const drLindaLeung = await prisma.instructor.upsert({
    where: { id: "ins-linda-leung" },
    update: {},
    create: {
      id: "ins-linda-leung",
      nameZh: "Dr. Linda Leung",
      nameEn: "Dr. Linda Leung",
      titleZh: "MB BS (Lond); MRCP (UK); FHKCP; FHKAM (Medicine); MPH (HK)",
      titleEn: "MB BS (Lond); MRCP (UK); FHKCP; FHKAM (Medicine); MPH (HK)",
      bioZh: null,
      bioEn: null,
      avatarUrl: null,
    },
  });

  // ─── Courses ──────────────────────────────────────────────
  await prisma.course.upsert({
    where: { slug: "cpd-101" },
    update: { isOpen: false },
    create: {
      id: "cpd-101",
      slug: "cpd-101",
      isOpen: false,
      nameZh: "傳承規劃證書課程",
      nameEn: "Certificate in Legacy Planning",
      descriptionZh: "全面掌握遺產架構與信託管治的專業課程。",
      descriptionEn: "Comprehensive guide to estate structure and trust governance.",
      category: "cpd",
      iaRefNumber: "cpd-101",
      accreditationBody: "HK Insurance Authority",
      cpdHours: 10,
      price: 2800.0,
      capacity: 30,
      registrationStatus: RegistrationStatus.FEW_SEATS,
      deliveryMode: "Online / In-person",
      language: "Cantonese / English",
      generalInstructorId: cyrus.id,
      syllabusItems: {
        create: [
          {
            moduleNumber: 1,
            titleZh: "信託管治入門",
            titleEn: "Introduction to Trust Governance",
            duration: "3 Hours",
            topicsZh: ["法律框架", "受信責任", "常見結構"],
            topicsEn: ["Legal framework", "Fiduciary duties", "Common structures"],
            sortOrder: 1,
          },
          {
            moduleNumber: 2,
            titleZh: "跨境遺產規劃",
            titleEn: "Cross-border Estate Planning",
            duration: "4 Hours",
            topicsZh: ["稅務影響", "跨司法管轄區資產"],
            topicsEn: ["Tax implications", "Multi-jurisdictional assets"],
            sortOrder: 2,
          },
          {
            moduleNumber: 3,
            titleZh: "財富傳承案例研究",
            titleEn: "Wealth Succession Case Studies",
            duration: "3 Hours",
            topicsZh: ["家族信託管理", "爭議預防"],
            topicsEn: ["Family trust administration", "Dispute prevention"],
            sortOrder: 3,
          },
        ],
      },
      schedules: {
        create: {
          dateAndTime: "2026-09-15 (Sat) 10:00 - 17:00",
          sessionDate: parseSessionDate("2026-09-15 (Sat) 10:00 - 17:00"),
          venue: "Unit 1011, Tower B, New Mandarin Plaza, Tsim Sha Tsui",
          quotaRemaining: 3,
        },
      },
      reviews: {
        create: {
          authorName: "Alex Wong",
          authorRole: "Senior Financial Planner",
          rating: 5,
          comment:
            "Very practical case studies on regulatory requirements and estate structuring.",
          date: new Date("2026-07-10"),
        },
      },
      faqs: {
        create: [
          {
            questionZh: "此課程可否申報CPD時數？",
            questionEn: "Is this course eligible for CPD hour declaration?",
            answerZh:
              "是，完成100%出席率後會獲發可驗證的CPD證書，IA REF: REF-cpd-101，符合香港保險業監管局認可要求。",
            answerEn:
              "Yes, a verifiable CPD certificate is issued upon 100% attendance under IA REF: REF-cpd-101. It meets the accredited requirements of the HK Insurance Authority.",
            sortOrder: 1,
          },
          {
            questionZh: "如何及何時收到CPD證書？",
            questionEn: "How and when will I receive my CPD certificate?",
            answerZh: "電子證書(PDF)將於確認全程出席後3至5個工作天內透過電郵發出。",
            answerEn:
              "Electronic certificates (PDF) are issued via email within 3 to 5 business days after successfully verifying your full attendance.",
            sortOrder: 2,
          },
          {
            questionZh: "獲取CPD學分的出席要求是什麼？",
            questionEn: "What is the attendance requirement for earning CPD credits?",
            answerZh:
              "參加者必須達到100%出席率。面授課程須簽到及簽退。遲到或早退超過15分鐘可能導致CPD學分被取消。",
            answerEn:
              "Participants must achieve 100% attendance. For in-person sessions, sign-in and sign-out records are mandatory. Late arrivals or early departures beyond 15 minutes may result in forfeiture of CPD credit.",
            sortOrder: 3,
          },
          {
            questionZh: "如選擇線上模式，出席如何驗證？",
            questionEn: "If I choose the online mode, how is attendance verified?",
            answerZh:
              "線上參加者必須使用完整註冊姓名登入，並全程保持活躍。互動投票回應及登入時間戳記為官方出席證明。",
            answerEn:
              "Online attendees must join using their full registered name and remain active for the full duration. Interactive poll responses and log-in timestamps serve as official proof.",
            sortOrder: 4,
          },
          {
            questionZh: "退款或改期政策是什麼？",
            questionEn: "What is the refund or rescheduling policy?",
            answerZh:
              "開課前至少7個曆日提出取消可獲90%退款（10%手續費）。請參閱完整條款及細則與私隱政策。",
            answerEn:
              "Cancellations requested at least 7 calendar days prior to the start date are eligible for a 90% refund (10% processing fee). Please review our full Terms and Conditions and Privacy Policy for complete details.",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  // Link cpd-101 schedule to placeholder instructor
  const cpd101Schedule = await prisma.schedule.findFirst({
    where: { course: { slug: "cpd-101" } },
  });
  if (cpd101Schedule && placeholderInstructor) {
    await prisma.scheduleInstructor.upsert({
      where: { scheduleId_instructorId: { scheduleId: cpd101Schedule.id, instructorId: placeholderInstructor.id } },
      update: {},
      create: { scheduleId: cpd101Schedule.id, instructorId: placeholderInstructor.id },
    });
  }

  // CPD26090103 is delivered as 6 standalone 90-minute classes: each of the 3 dates
  // hosts two sequential sessions at the same venue.
  //   22/09: 14:15–15:45 & 16:00–17:30
  //   08/10: 14:00–15:30 & 15:45–17:15
  //   14/10: 14:15–15:45 & 16:00–17:30
  const cpd26090103VenueEn = "CUHK Medical Centre, 9 Chak Cheung Street, Shatin, NT";
  const cpd26090103VenueZh = "香港新界沙田澤祥街9號 香港中文大學醫院";
  const cpd26090103Schedules = [
    { dateAndTime: "22/09/2026 (星期二) 14:15 - 15:45", sessionDate: parseSessionDate("22/09/2026 (星期二) 14:15 - 15:45"), venue: cpd26090103VenueZh, venueEn: cpd26090103VenueEn, venueZh: cpd26090103VenueZh, quotaRemaining: 60, isActive: true, cpdHoursIa: 1.5 },
    { dateAndTime: "22/09/2026 (星期二) 16:00 - 17:30", sessionDate: parseSessionDate("22/09/2026 (星期二) 16:00 - 17:30"), venue: cpd26090103VenueZh, venueEn: cpd26090103VenueEn, venueZh: cpd26090103VenueZh, quotaRemaining: 60, isActive: true, cpdHoursIa: 1.5 },
    { dateAndTime: "08/10/2026 (星期四) 14:00 - 15:30", sessionDate: parseSessionDate("08/10/2026 (星期四) 14:00 - 15:30"), venue: cpd26090103VenueZh, venueEn: cpd26090103VenueEn, venueZh: cpd26090103VenueZh, quotaRemaining: 60, isActive: true, cpdHoursIa: 1.5 },
    { dateAndTime: "08/10/2026 (星期四) 15:45 - 17:15", sessionDate: parseSessionDate("08/10/2026 (星期四) 15:45 - 17:15"), venue: cpd26090103VenueZh, venueEn: cpd26090103VenueEn, venueZh: cpd26090103VenueZh, quotaRemaining: 60, isActive: true, cpdHoursIa: 1.5 },
    { dateAndTime: "14/10/2026 (星期三) 14:15 - 15:45", sessionDate: parseSessionDate("14/10/2026 (星期三) 14:15 - 15:45"), venue: cpd26090103VenueZh, venueEn: cpd26090103VenueEn, venueZh: cpd26090103VenueZh, quotaRemaining: 60, isActive: true, cpdHoursIa: 1.5 },
    { dateAndTime: "14/10/2026 (星期三) 16:00 - 17:30", sessionDate: parseSessionDate("14/10/2026 (星期三) 16:00 - 17:30"), venue: cpd26090103VenueZh, venueEn: cpd26090103VenueEn, venueZh: cpd26090103VenueZh, quotaRemaining: 60, isActive: true, cpdHoursIa: 1.5 },
  ];

  await prisma.course.upsert({
    where: { slug: "CPD26090103" },
    // Resync schedules on every run so the seed stays authoritative for CPD26090103.
    update: {
      nameZh: "香港醫療體制發展、大灣區醫療概況與醫療保障證書課程",
      nameEn:
        "Hong Kong's Healthcare System and the Evolving Landscape of Greater Bay Area Healthcare Development, with Medical Protection Overview",
      nameCn: "香港医疗体制发展、大湾区医疗概况与医疗保障证书课程",
      iaRefNumber: "CPD26090103",
      organizerZh: "德智顧問管理有限公司",
      organizerEn: "LMC Management Consultancy Ltd.",
      organizerLogoUrl: "/company/logo-text-black.svg",
      coOrganizerZh: "香港中文大學醫院",
      coOrganizerEn: "CUHK Medical Centre",
      coOrganizerLogoUrl: "/CUHK-Medical-Centre/cuhk-medical-centre-logo.svg",
      generalInstructorId: cuhkSpecialist.id,
      schedules: {
        deleteMany: {},
        create: cpd26090103Schedules,
      },
    },
    create: {
      id: "CPD26090103",
      slug: "CPD26090103",
      nameZh: "香港醫療體制發展、大灣區醫療概況與醫療保障證書課程",
      nameEn:
        "Hong Kong's Healthcare System and the Evolving Landscape of Greater Bay Area Healthcare Development, with Medical Protection Overview",
      nameCn: "香港医疗体制发展、大湾区医疗概况与医疗保障证书课程",
      descriptionZh:
        "涵蓋香港醫療體制、大灣區醫療概況、危疾系列（乳癌、婦科癌症、前列腺健康、肺癌）及常見運動受傷處理的綜合課程。",
      descriptionEn:
        "A comprehensive course covering HK healthcare system, GBA healthcare overview, critical illness series (breast cancer, gynecological cancers, prostate health, lung cancer) and common sports injury management.",
      descriptionCn:
        "涵盖香港医疗体制、大湾区医疗概况、危疾系列（乳癌、妇科癌症、前列腺健康、肺癌）及常见运动受伤处理的综合课程。",
      category: "cpd",
      iaRefNumber: "CPD26090103",
      accreditationBody: "HK Insurance Authority",
      cpdHours: 9,
      cpdHoursIa: 9,
      cpdRulesZh:
        "出席記錄將直接提交至相關認證機構。必須全程出席並通過身份驗證方可獲得認可 CPD 時數。",
      cpdRulesEn:
        "Attendance records will be submitted directly to relevant accreditation bodies. Full attendance and identity verification are required to earn accredited CPD hours.",
      cpdRulesCn:
        "出席记录将直接提交至相关认证机构。必须全程出席并通过身份验证方可获得认可 CPD 学时。",
      price: 1500.0,
      unitPrice: 250.0,
      capacity: 50,
      imageUrl: "/company/posters/Healthcare CPD Course Syllabus_page-0001.jpg",
      registrationStatus: RegistrationStatus.OPEN,
      deliveryMode: "In-person",
      language: "Cantonese",
      organizerZh: "德智顧問管理有限公司",
      organizerEn: "LMC Management Consultancy Ltd.",
      organizerLogoUrl: "/company/logo-text-black.svg",
      coOrganizerZh: "香港中文大學醫院",
      coOrganizerEn: "CUHK Medical Centre",
      coOrganizerLogoUrl: "/CUHK-Medical-Centre/cuhk-medical-centre-logo.svg",
      generalInstructorId: cuhkSpecialist.id,
      syllabusItems: {
        create: [
          {
            moduleNumber: 1,
            titleZh: "主題 - 香港醫療體制發展、大灣區醫療概況與醫療保障",
            titleEn:
              "Topic - Hong Kong's Healthcare System and the Evolving Landscape of Greater Bay Area Healthcare Development, with Medical Protection Overview",
            duration: "1.5 Hours",
            topicsZh: ["香港醫療體制發展", "大灣區醫療概況", "醫療保障"],
            topicsEn: [
              "HK healthcare system development",
              "GBA healthcare overview",
              "Medical insurance",
            ],
            sortOrder: 1,
          },
          {
            moduleNumber: 2,
            titleZh: "主題 - 危疾系列：乳癌診斷、臨床治療與患者支援",
            titleEn:
              "Topic - Critical Illness: Breast Cancer Diagnosis, Clinical Treatment and Patient Support",
            duration: "1.5 Hours",
            topicsZh: ["乳癌診斷", "臨床治療", "患者支援"],
            topicsEn: [
              "Breast cancer diagnosis",
              "Clinical treatment",
              "Patient support",
            ],
            sortOrder: 2,
          },
          {
            moduleNumber: 3,
            titleZh: "主題 - 常見運動受傷的處理",
            titleEn: "Topic - Sports Medicine: Injury Management and Recovery",
            duration: "1.5 Hours",
            topicsZh: ["常見運動受傷處理"],
            topicsEn: ["Common sports injury management"],
            sortOrder: 3,
          },
          {
            moduleNumber: 4,
            titleZh: "主題 - 危疾系列：認識婦科癌症",
            titleEn:
              "Topic - Critical Illness: Understanding Gynecological Cancers: Diagnosis, Treatment, Multidisciplinary Care and the Patient Journey",
            duration: "1.5 Hours",
            topicsZh: ["婦科癌症認識"],
            topicsEn: ["Understanding gynecological cancers"],
            sortOrder: 4,
          },
          {
            moduleNumber: 5,
            titleZh: "主題 - 危疾系列：前列腺健康及微創手術最新發展",
            titleEn:
              "Topic - Critical Illness: Urology and Robotic Surgery: Modern Approaches to Diagnosis, Treatment, and Recovery",
            duration: "1.5 Hours",
            topicsZh: ["前列腺健康", "微創手術最新發展"],
            topicsEn: [
              "Prostate health",
              "Latest advances in minimally invasive surgery",
            ],
            sortOrder: 5,
          },
          {
            moduleNumber: 6,
            titleZh: "主題 - 認識肺癌：從診斷到個人化治療",
            titleEn:
              "Topic - Critical Illness: Leading Cause of Cancer Death in HK - Lung Cancer: Diagnosis, Treatment, and Multidisciplinary",
            duration: "1.5 Hours",
            topicsZh: ["肺癌診斷", "個人化治療"],
            topicsEn: ["Lung cancer diagnosis", "Personalised treatment"],
            sortOrder: 6,
          },
        ],
      },
      schedules: {
        create: cpd26090103Schedules,
      },
      reviews: {
        create: {
          authorName: "Grace Chen",
          authorRole: "Insurance Compliance Manager",
          rating: 5,
          comment:
            "Clear breakdown of GBA medical regulations and how insurance policies link across borders.",
          date: new Date("2026-08-01"),
        },
      },
      faqs: {
        create: [
          {
            questionZh: "此課程如何申報CPD時數？",
            questionEn: "How do I declare CPD hours for this course?",
            answerZh:
              "完成100%出席率後，出席記錄將直接提交至香港保險業監管局。IA REF: CPD26090103。",
            answerEn:
              "Upon 100% attendance, attendance records will be submitted directly to the HK Insurance Authority under IA REF: CPD26090103.",
            sortOrder: 1,
          },
          {
            questionZh: "面授課程的出席要求是什麼？",
            questionEn:
              "What is the attendance requirement for in-person sessions?",
            answerZh:
              "參加者必須達100%出席率。須簽到及簽退，遲到或早退超過15分鐘可能導致CPD學分被取消。",
            answerEn:
              "Participants must achieve 100% attendance. Sign-in and sign-out are mandatory. Late arrivals or early departures beyond 15 minutes may result in forfeiture of CPD credit.",
            sortOrder: 2,
          },
          {
            questionZh: "如何及何時收到CPD證書？",
            questionEn: "How and when will I receive my CPD certificate?",
            answerZh:
              "電子證書(PDF)將於確認全程出席後3至5個工作天內透過電郵發出。",
            answerEn:
              "Electronic certificates (PDF) are issued via email within 3 to 5 business days after successfully verifying your full attendance.",
            sortOrder: 3,
          },
          {
            questionZh: "場地位置及交通？",
            questionEn: "Venue location and transportation?",
            answerZh:
              "香港新界沙田澤祥街9號 香港中文大學醫院。港鐵大學站步行約8分鐘。",
            answerEn:
              "CUHK Medical Centre, 9 Chak Cheung Street, Shatin, NT. About 8 min walk from University MTR station.",
            sortOrder: 4,
          },
          {
            questionZh: "退款或改期政策是什麼？",
            questionEn: "What is the refund or rescheduling policy?",
            answerZh:
              "開課前至少7個曆日提出取消可獲90%退款（10%手續費）。請參閱完整條款及細則與私隱政策。",
            answerEn:
              "Cancellations requested at least 7 calendar days prior to the start date are eligible for a 90% refund (10% processing fee). Please review our full Terms and Conditions and Privacy Policy.",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  // ─── Test learner user ────────────────────────────────────
  const learnerPasswordHash = await bcrypt.hash("learner123", 10);

  const learnerUser = await prisma.user.upsert({
    where: { email: "taiman.chan@example.com" },
    update: { passwordHash: learnerPasswordHash },
    create: {
      email: "taiman.chan@example.com",
      nameZh: "陳大文",
      nameEn: "CHAN Tai Man",
      idDocNumber: "IA12345678",
      phone: "+852 6123 4567",
      role: Role.STUDENT,
      passwordHash: learnerPasswordHash,
    },
  });

  // ─── ScheduleTopic links for CPD26090103 ────────────────────
  const cpd26090103 = await prisma.course.findUnique({ where: { slug: "CPD26090103" } });
  if (cpd26090103) {
    const allSyllabusItems = await prisma.syllabusItem.findMany({
      where: { courseId: cpd26090103.id },
      orderBy: { moduleNumber: "asc" },
    });
    const allSchedules = await prisma.schedule.findMany({
      where: { courseId: cpd26090103.id },
      orderBy: { sessionDate: "asc" },
    });
    // Map each class (matched by its exact date & time string) to the single topic it covers.
    const scheduleTopicMap: Record<string, number[]> = {
      "22/09/2026 (星期二) 14:15 - 15:45": [5],
      "22/09/2026 (星期二) 16:00 - 17:30": [1],
      "08/10/2026 (星期四) 14:00 - 15:30": [3],
      "08/10/2026 (星期四) 15:45 - 17:15": [4],
      "14/10/2026 (星期三) 14:15 - 15:45": [2],
      "14/10/2026 (星期三) 16:00 - 17:30": [6],
    };
    for (const schedule of allSchedules) {
      const modNums = scheduleTopicMap[schedule.dateAndTime] ?? [];
      for (const modNum of modNums) {
        const si = allSyllabusItems.find((s) => s.moduleNumber === modNum);
        if (si) {
          try {
            await prisma.scheduleTopic.create({
              data: { scheduleId: schedule.id, syllabusItemId: si.id, sortOrder: 0 },
            });
          } catch {
            // ignore duplicate
          }
        }
      }
    }
    console.log("ScheduleTopic links created for CPD26090103");
  }

  // Link each CPD26090103 schedule to its specific instructor
  // Match by dateAndTime string (same approach as scheduleTopicMap above) to
  // avoid position-mismatch bugs when schedules are sorted alphabetically.
  const scheduleInstructorMapByDate: Record<string, string> = {
    "22/09/2026 (星期二) 14:15 - 15:45": drNgo.id,
    "22/09/2026 (星期二) 16:00 - 17:30": drJacquelineChoi.id,
    "08/10/2026 (星期四) 14:00 - 15:30": drGeorgeLaw.id,
    "08/10/2026 (星期四) 15:45 - 17:15": drCarolYeung.id,
    "14/10/2026 (星期三) 14:15 - 15:45": drYolandaChan.id,
    "14/10/2026 (星期三) 16:00 - 17:30": drLindaLeung.id,
  };
  const cpd26090103SchedulesDb = await prisma.schedule.findMany({
    where: { course: { slug: "CPD26090103" } },
  });
  for (const sched of cpd26090103SchedulesDb) {
    const instructorId = scheduleInstructorMapByDate[sched.dateAndTime];
    if (!instructorId) {
      console.warn(`No instructor mapped for schedule: ${sched.dateAndTime}`);
      continue;
    }
    await prisma.scheduleInstructor.upsert({
      where: { scheduleId_instructorId: { scheduleId: sched.id, instructorId } },
      update: {},
      create: { scheduleId: sched.id, instructorId },
    });
  }

  // ─── Test receipt (VERIFIED enrolment with receipt number) ─
  const receiptCourse = await prisma.course.findUnique({ where: { id: "cpd-101" } });
  if (receiptCourse) {
    await prisma.registrant.upsert({
      where: { id: "reg-verified-001" },
      update: {},
      create: {
        id: "reg-verified-001",
        courseId: "cpd-101",
        userId: learnerUser.id,
        enrollmentType: "INDIVIDUAL",
        paymentStatus: "VERIFIED",
        paymentMethod: "FPS",
        receiptNumber: "RCPT-2026-00001",
        submittedAt: new Date("2026-08-25T10:30:00Z"),
      },
    });
    // Link the registrant to the course's schedule so it's not an orphan
    const cpd101Schedule = await prisma.schedule.findFirst({
      where: { courseId: "cpd-101" },
    });
    if (cpd101Schedule) {
      await prisma.registrantSchedule.upsert({
        where: { registrantId_scheduleId: { registrantId: "reg-verified-001", scheduleId: cpd101Schedule.id } },
        update: {},
        create: { registrantId: "reg-verified-001", scheduleId: cpd101Schedule.id },
      });
    }
    console.log("Test receipt created for enrolment reg-verified-001 (RCPT-2026-00001)");
  }
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@lmcconsulting.hk" },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: "admin@lmcconsulting.hk",
      nameZh: "系統管理員",
      nameEn: "System Administrator",
      idDocNumber: "ADMIN-001",
      phone: "+852 0000 0000",
      role: Role.ADMIN,
      passwordHash: adminPasswordHash,
    },
  });

  await prisma.admin.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      permissions: AdminPermission.SUPER_ADMIN,
    },
  });

  console.log("Seed completed successfully");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });