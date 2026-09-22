import type { Metadata } from "next";
import { headers } from "next/headers";
import { getDictionary } from "@/dictionaries/get-dictionary";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { FAQAccordion } from "@/components/faq/FAQAccordion";

interface PageProps {
  params: Promise<{ locale: string }>;
}

// Locale suffix mapping: en → En, zh-hk → Zh, zh-cn → ZhCn
const localeFieldSuffix: Record<string, string> = {
  en: "En",
  "zh-hk": "Zh",
  "zh-cn": "ZhCn",
};

/**
 * Pick the locale-appropriate field from a trilingual object.
 * e.g. pickField({ nameZh, nameEn, nameZhCn }, "zh-hk") returns nameZh
 */
function pickField(
  fields: Record<string, unknown>,
  locale: string,
  baseName: string,
): string {
  const suffix = localeFieldSuffix[locale] || "En";
  const key = `${baseName}${suffix}`;
  return (fields[key] as string) ?? "";
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  return {
    title: dict.faqPage.pageTitle,
    description: dict.faqPage.pageDescription,
  };
}

async function fetchFaq() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  let baseUrl: string;

  if (configuredUrl) {
    baseUrl = configuredUrl.replace(/\/$/, "");
  } else {
    const headersList = await headers();
    const host = headersList.get("host") ?? "localhost:3000";
    baseUrl = `${protocol}://${host}`;
  }

  const res = await fetch(`${baseUrl}/api/faq`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch FAQs");
  return res.json() as Promise<{
    categories: Array<{
      category: { id: string; nameZh: string; nameEn: string; nameZhCn: string | null };
      items: Array<{
        id: string;
        questionZh: string;
        questionEn: string;
        questionZhCn: string | null;
        answerZh: string;
        answerEn: string;
        answerZhCn: string | null;
        order: number;
      }>;
    }>;
  }>;
}

export default async function FaqPage({ params }: PageProps) {
  const { locale } = await params;

  const dict = await getDictionary(locale);

  // Fetch + locale mapping — errors handled by FAQAccordion on the client
  let categories: Array<{
    category: { id: string; name: string };
    items: Array<{ id: string; question: string; answer: string; order: number }>;
  }> = [];
  let fetchError: string | null = null;

  try {
    const data = await fetchFaq();
    categories = data.categories.map((cat) => ({
      category: {
        id: cat.category.id,
        name: pickField(cat.category, locale, "name"),
      },
      items: cat.items
        .map((item) => ({
          id: item.id,
          question: pickField(item, locale, "question"),
          answer: pickField(item, locale, "answer"),
          order: item.order,
        }))
        .sort((a, b) => a.order - b.order),
    }));
  } catch (err) {
    console.error("FAQ fetch error:", err);
    fetchError = "Failed to load FAQs. Please try again.";
  }

  return (
    <>
      <Breadcrumbs
        currentLocale={locale}
        items={[{ label: dict.breadcrumbs.faq }]}
        dict={dict.breadcrumbs}
      />
      <div className="bg-slate-50 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {dict.faqPage.pageTitle}
            </h1>
            <p className="mt-2 text-slate-600 text-sm">
              {dict.faqPage.pageDescription}
            </p>
          </div>

          {/* FAQ accordion */}
          <div className="bg-white border border-slate-200 p-6 md:p-8">
            <FAQAccordion
              categories={fetchError ? undefined : categories}
              error={fetchError}
              dict={dict.faqPage}
            />
          </div>
        </div>
      </div>
    </>
  );
}