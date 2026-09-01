import { PrismaClient, Role, RegistrationStatus, AdminPermission } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const wilson = await prisma.instructor.upsert({
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

  // ─── Courses ──────────────────────────────────────────────
  await prisma.course.upsert({
    where: { slug: "cpd-101" },
    update: {},
    create: {
      id: "cpd-101",
      slug: "cpd-101",
      nameZh: "傳承規劃證書課程",
      nameEn: "Certificate in Legacy Planning",
      descriptionZh: "全面掌握遺產架構與信託管治的專業課程。",
      descriptionEn: "Comprehensive guide to estate structure and trust governance.",
      category: "cpd",
      iaRefNumber: "REF-cpd-101",
      accreditationBody: "HK Insurance Authority",
      cpdHours: 10,
      price: 2800.0,
      capacity: 30,
      registrationStatus: RegistrationStatus.FEW_SEATS,
      deliveryMode: "Online / In-person",
      language: "Cantonese / English",
      instructors: {
        create: { instructorId: cyrus.id },
      },
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

  await prisma.course.upsert({
    where: { slug: "cpd-102" },
    update: {},
    create: {
      id: "cpd-102",
      slug: "cpd-102",
      nameZh: "大灣區醫療保健概覽",
      nameEn: "Overview of Healthcare in the Greater Bay Area",
      descriptionZh: "監管框架與醫療跨境機遇。",
      descriptionEn: "Regulatory frameworks and healthcare cross-border opportunities.",
      category: "compliance",
      iaRefNumber: "REF-cpd-102",
      accreditationBody: "HK Insurance Authority",
      cpdHours: 6,
      price: 1500.0,
      capacity: 50,
      registrationStatus: RegistrationStatus.OPEN,
      deliveryMode: "Online",
      language: "Cantonese",
      instructors: {
        create: { instructorId: wilson.id },
      },
      syllabusItems: {
        create: [
          {
            moduleNumber: 1,
            titleZh: "大灣區醫療監管框架",
            titleEn: "GBA Healthcare Regulatory Frameworks",
            duration: "3 Hours",
            topicsZh: ["醫療器械和藥品直接措施", "跨境醫療保險結算", "醫院認證標準"],
            topicsEn: [
              "Medical Device and Medicine Direct Measure",
              "Cross-border medical insurance settlement",
              "Hospital accreditation standards",
            ],
            sortOrder: 1,
          },
          {
            moduleNumber: 2,
            titleZh: "跨境市場與政策機遇",
            titleEn: "Cross-border Market & Policy Opportunities",
            duration: "3 Hours",
            topicsZh: ["大灣區養老整合", "私人醫療保險趨勢", "顧問監管合規"],
            topicsEn: [
              "Elderly care integration in GBA",
              "Private medical insurance trends",
              "Regulatory compliance for advisors",
            ],
            sortOrder: 2,
          },
        ],
      },
      schedules: {
        create: {
          dateAndTime: "2026-10-03 (Sat) 14:00 - 20:00",
          venue: "Live Interactive Webinar (Zoom Link provided upon enrollment)",
          quotaRemaining: 25,
        },
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
            questionZh: "線上課程如何接收CPD證書？",
            questionEn: "How do I receive my CPD certificate for the online session?",
            answerZh:
              "出席及活躍參與透過Zoom時長記錄與課堂內彈出測驗數碼追蹤。數碼CPD證書(IA REF: REF-cpd-102)於3個工作天內電郵發出。",
            answerEn:
              "Attendance and active participation are tracked digitally via Zoom duration logs and in-class pop-up quizzes. Digital CPD certificates under IA REF: REF-cpd-102 are emailed within 3 working days.",
            sortOrder: 1,
          },
          {
            questionZh: "網絡研討會前會提供課程材料嗎？",
            questionEn: "Are course materials provided prior to the webinar?",
            answerZh: "是的，可下載的簡報投影片及監管參考指南(PDF)將於課程開始前24小時透過電郵發送。",
            answerEn:
              "Yes, downloadable presentation slides and regulatory reference guides (PDF) are sent via email 24 hours prior to the session start.",
            sortOrder: 2,
          },
          {
            questionZh: "線上參加需要什麼技術設置？",
            questionEn: "What technical setup do I need to attend online?",
            answerZh:
              "您需要穩定的網絡連接、桌上/筆記型電腦及已更新的Zoom客戶端。不建議使用手機參加以確保順利完成追蹤提示。",
            answerEn:
              "You need a stable internet connection, a desktop/laptop computer, and an updated Zoom Client. Mobile attendance is discouraged to ensure seamless completion of tracking prompts.",
            sortOrder: 3,
          },
          {
            questionZh: "如錯過部分課堂，會有錄影提供嗎？",
            questionEn: "Will a recording be available if I miss part of the session?",
            answerZh: "基於嚴格的CPD認證政策，觀看課程錄影並不符合CPD學分申報資格。必須現場出席。",
            answerEn:
              "Due to strict CPD accreditation policies, watching session recordings does NOT qualify for CPD credit declaration. Live presence is required.",
            sortOrder: 4,
          },
          {
            questionZh: "可以企業直接付款或開具發票嗎？",
            questionEn: "Can my employer be billed directly or issued an invoice?",
            answerZh:
              "可以。企業付款選項須根據標準服務條款與私隱政策進行驗證。結帳時選擇企業付款以索取稅務發票。",
            answerEn:
              "Yes. Corporate billing options are subject to verification under our standard Terms of Service and Privacy Policy. Select corporate billing during checkout to request a tax invoice.",
            sortOrder: 5,
          },
        ],
      },
    },
  });

  // ─── Admin user ───────────────────────────────────────────
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