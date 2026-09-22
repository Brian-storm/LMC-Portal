"use client";

import { useParams, useRouter } from "next/navigation";
import { useAdminDict } from "@/components/admin/AdminDictContext";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import FaqCategoryForm from "@/components/admin/FaqCategoryForm";

export default function NewFaqCategoryPage() {
  const dict = useAdminDict();
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "en";

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title={dict.faq.newCategory}
        backHref={`/${locale}/admin/faq`}
        backLabel={dict.faq.faq}
      />
      <section className="bg-white border border-slate-200 p-6">
        <FaqCategoryForm
          mode="create"
          onSuccess={() => router.push(`/${locale}/admin/faq`)}
        />
      </section>
    </div>
  );
}