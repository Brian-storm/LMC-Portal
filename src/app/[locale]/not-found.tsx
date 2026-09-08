import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDictionary, Locale } from "@/dictionaries/get-dictionary";

export default async function NotFound({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale as Locale;
  const dict = await getDictionary(locale);
  const { notFoundPage: t } = dict;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background text-foreground transition-colors duration-300">
      <div className="relative flex flex-col items-center max-w-md w-full text-center space-y-6">
        {/* Decorative icon */}
        <div className="relative">
          <div className="absolute -inset-4 bg-warning/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center border border-warning/20">
            <FileQuestion className="w-7 h-7 text-warning" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {t.title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            {t.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button
            variant="default"
            className="flex-1"
            asChild
          >
            <Link href={`/${locale}`}>{t.goHome}</Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            asChild
          >
            <Link href={`/${locale}/courses`}>{t.browseCourses}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}