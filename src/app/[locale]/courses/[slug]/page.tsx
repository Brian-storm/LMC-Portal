// src/app/[locale]/courses/[slug]/page.tsx

import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { CourseDetailView } from "@/components/courses/CourseDetailView";
import { DetailedCourse } from "@/components/courses/types";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

async function getCourseBySlug(slug: string): Promise<DetailedCourse | null> {
  const courses: Record<string, DetailedCourse> = {
    "cpd-101": {
      id: "cpd-101",
      title: "Certificate in Legacy Planning",
      description:
        "Comprehensive guide to estate structure and trust governance.",
      category: "cpd",
      cpdHours: 10,
      deliveryMode: "Online / In-person",
      language: "Cantonese / English",
      fee: "HKD 2,800",
      status: "fewSeats",
      iaRefNumber: "REF-cpd-101",
      accreditationBody: "HK Insurance Authority",
      instructors: [
        {
          id: "ins-1",
          name: "Mr. Cyrus Chung",
          title: "Head Coach of CC Legacy Planning Institute BA",
          photoUrl: "/members/profile-cyrus-chung.svg",
          bio: "Legacy planning founder with deep expertise in estate planning, trust structures, and wealth succession.",
        },
      ],
      syllabus: [
        {
          moduleNumber: 1,
          title: "Introduction to Trust Governance",
          duration: "3 Hours",
          topics: ["Legal framework", "Fiduciary duties", "Common structures"],
        },
        {
          moduleNumber: 2,
          title: "Cross-border Estate Planning",
          duration: "4 Hours",
          topics: ["Tax implications", "Multi-jurisdictional assets"],
        },
        {
          moduleNumber: 3,
          title: "Wealth Succession Case Studies",
          duration: "3 Hours",
          topics: ["Family trust administration", "Dispute prevention"],
        },
      ],
      schedules: [
        {
          id: "sch-101-1",
          dateAndTime: "2026-09-15 (Sat) 10:00 - 17:00",
          venue: "Unit 1011, Tower B, New Mandarin Plaza, Tsim Sha Tsui",
          quotaRemaining: 3,
        },
      ],
      reviews: [
        {
          id: "rev-101-1",
          authorName: "Alex Wong",
          authorRole: "Senior Financial Planner",
          rating: 5,
          comment:
            "Very practical case studies on regulatory requirements and estate structuring.",
          date: "2026-07-10",
        },
      ],
      faqs: [
        {
          id: "faq-101-1",
          question: "Is this course eligible for CPD hour declaration?",
          answer:
            "Yes, a verifiable CPD certificate is issued upon 100% attendance under IA REF: REF-cpd-101. It meets the accredited requirements of the HK Insurance Authority.",
        },
        {
          id: "faq-101-2",
          question: "How and when will I receive my CPD certificate?",
          answer:
            "Electronic certificates (PDF) are issued via email within 3 to 5 business days after successfully verifying your full attendance.",
        },
        {
          id: "faq-101-3",
          question:
            "What is the attendance requirement for earning CPD credits?",
          answer:
            "Participants must achieve 100% attendance. For in-person sessions, sign-in and sign-out records are mandatory. Late arrivals or early departures beyond 15 minutes may result in forfeiture of CPD credit.",
        },
        {
          id: "faq-101-4",
          question: "If I choose the online mode, how is attendance verified?",
          answer:
            "Online attendees must join using their full registered name and remain active for the full duration. Interactive poll responses and log-in timestamps serve as official proof.",
        },
        {
          id: "faq-101-5",
          question: "What is the refund or rescheduling policy?",
          answer:
            "Cancellations requested at least 7 calendar days prior to the start date are eligible for a 90% refund (10% processing fee). You may request to transfer your enrollment to a future date free of charge up to 3 days before the session.",
        },
      ],
    },
    "cpd-102": {
      id: "cpd-102",
      title: "Overview of Healthcare in the Greater Bay Area",
      description:
        "Regulatory frameworks and healthcare cross-border opportunities.",
      category: "compliance",
      cpdHours: 6,
      deliveryMode: "Online",
      language: "Cantonese",
      fee: "HKD 1,500",
      status: "open",
      iaRefNumber: "REF-cpd-102",
      accreditationBody: "HK Insurance Authority",
      instructors: [
        {
          id: "ins-2",
          name: "Mr. Wilson Cheung",
          title: "Greater Bay Area Health Policy Specialist",
          photoUrl: "/members/profile-wilson-cheung.svg",
          bio: "With global fellowships in insurance, risk management, property casualty, loss adjusting, and arbitration.",
        },
      ],
      syllabus: [
        {
          moduleNumber: 1,
          title: "GBA Healthcare Regulatory Frameworks",
          duration: "3 Hours",
          topics: [
            "Medical Device and Medicine Direct Measure",
            "Cross-border medical insurance settlement",
            "Hospital accreditation standards",
          ],
        },
        {
          moduleNumber: 2,
          title: "Cross-border Market & Policy Opportunities",
          duration: "3 Hours",
          topics: [
            "Elderly care integration in GBA",
            "Private medical insurance trends",
            "Regulatory compliance for advisors",
          ],
        },
      ],
      schedules: [
        {
          id: "sch-102-1",
          dateAndTime: "2026-10-03 (Sat) 14:00 - 20:00",
          venue:
            "Live Interactive Webinar (Zoom Link provided upon enrollment)",
          quotaRemaining: 25,
        },
      ],
      reviews: [
        {
          id: "rev-102-1",
          authorName: "Grace Chen",
          authorRole: "Insurance Compliance Manager",
          rating: 5,
          comment:
            "Clear breakdown of GBA medical regulations and how insurance policies link across borders.",
          date: "2026-08-01",
        },
      ],
      faqs: [
        {
          id: "faq-102-1",
          question:
            "How do I receive my CPD certificate for the online session?",
          answer:
            "Attendance and active participation are tracked digitally via Zoom duration logs and in-class pop-up quizzes. Digital CPD certificates under IA REF: REF-cpd-102 are emailed within 3 working days.",
        },
        {
          id: "faq-102-2",
          question: "Are course materials provided prior to the webinar?",
          answer:
            "Yes, downloadable presentation slides and regulatory reference guides (PDF) are sent via email 24 hours prior to the session start.",
        },
        {
          id: "faq-102-3",
          question: "What technical setup do I need to attend online?",
          answer:
            "You need a stable internet connection, a desktop/laptop computer, and an updated Zoom Client. Mobile attendance is discouraged to ensure seamless completion of tracking prompts.",
        },
        {
          id: "faq-102-4",
          question:
            "Will a recording be available if I miss part of the session?",
          answer:
            "Due to strict CPD accreditation policies, watching session recordings does NOT qualify for CPD credit declaration. Live presence is required.",
        },
        {
          id: "faq-102-5",
          question: "Can my employer be billed directly or issued an invoice?",
          answer:
            "Yes. During checkout or by contacting our support team, select corporate billing to request a tax invoice and official receipt.",
        },
      ],
    },
  };

  return courses[slug] || null;
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  const [dict, course] = await Promise.all([
    getDictionary(locale),
    getCourseBySlug(slug),
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
