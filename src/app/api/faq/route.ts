import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/faq
 *
 * Returns published FAQs grouped by category.
 * No auth required. Only includes categories that have at least one published FAQ.
 */
export async function GET() {
  try {
    // Fetch all categories ordered by `order`
    const categories = await prisma.generalFaqCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        generalFaqs: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          select: {
            id: true,
            questionZh: true,
            questionEn: true,
            questionZhCn: true,
            answerZh: true,
            answerEn: true,
            answerZhCn: true,
            order: true,
          },
        },
      },
    });

    // Only include categories that have at least one published FAQ
    const categoriesWithFaqs = categories
      .filter((c) => c.generalFaqs.length > 0)
      .map((c) => ({
        category: {
          id: c.id,
          nameZh: c.nameZh,
          nameEn: c.nameEn,
          nameZhCn: c.nameZhCn,
        },
        items: c.generalFaqs,
      }));

    return NextResponse.json({ categories: categoriesWithFaqs });
  } catch (error) {
    console.error("GET /api/faq error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}