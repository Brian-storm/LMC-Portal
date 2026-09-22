"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import FaqCategoryForm from "@/components/admin/FaqCategoryForm";

interface FaqCategoryData {
  id: string;
  nameZh: string;
  nameEn: string;
  nameZhCn: string | null;
  order: number;
}

export default function EditFaqCategoryPage() {
  const dict = useAdminDict();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";
  const id = params.id as string;

  const [category, setCategory] = useState<FaqCategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/faq/categories");
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      const found = data.categories.find((c: FaqCategoryData) => c.id === id);
      if (!found) throw new Error("Category not found");
      setCategory(found);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategory();
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
        title={dict.faq.editCategory}
        backHref={`/${locale}/admin/faq`}
        backLabel={dict.faq.faq}
      />
      <section className="bg-white border border-slate-200 p-6">
        <FaqCategoryForm
          mode="edit"
          initialData={category}
          onSuccess={() => router.push(`/${locale}/admin/faq`)}
        />
      </section>
    </div>
  );
}