"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import FaqQuestionForm from "@/components/admin/FaqQuestionForm";

interface FaqCategoryOption {
  id: string;
  nameZh: string;
  nameEn: string;
  nameZhCn: string | null;
}

interface FaqQuestionData {
  id: string;
  categoryId: string;
  questionZh: string;
  questionEn: string;
  questionZhCn: string | null;
  answerZh: string;
  answerEn: string;
  answerZhCn: string | null;
  isPublished: boolean;
}

export default function EditFaqQuestionPage() {
  const dict = useAdminDict();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const id = params.id as string;

  const [categories, setCategories] = useState<FaqCategoryOption[]>([]);
  const [question, setQuestion] = useState<FaqQuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, faqRes] = await Promise.all([
        fetch("/api/admin/faq/categories"),
        fetch("/api/admin/faq?limit=500"),
      ]);

      if (!catRes.ok) throw new Error("Failed to load categories");
      if (!faqRes.ok) throw new Error("Failed to load questions");

      const catData = await catRes.json();
      const faqData = await faqRes.json();

      const found = faqData.generalFaqs?.find((q: FaqQuestionData) => q.id === id);
      if (!found) throw new Error("Question not found");

      setCategories(catData.categories);
      setQuestion(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm text-slate-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title={dict.faq.editQuestion}
        backHref={`/${locale}/admin/faq`}
        backLabel={dict.faq.faq}
      />
      <section className="bg-white border border-slate-200 p-6">
        <FaqQuestionForm
          mode="edit"
          categories={categories}
          initialData={question}
          onSuccess={() => router.push(`/${locale}/admin/faq`)}
        />
      </section>
    </div>
  );
}