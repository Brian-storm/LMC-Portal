import Link from "next/link";
import {
  ShieldCheck,
  Award,
  Building2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/dictionaries/get-dictionary";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const t = dict.aboutPage;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        <div className="bg-white border border-slate-200 p-8 md:p-12 space-y-6">
          <Badge
            variant="outline"
            className="rounded-none border-slate-300 text-slate-700 tracking-wider uppercase text-xs"
          >
            {t.badge}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 font-serif">
            {t.heroTitle}
          </h1>
          <p className="text-slate-600 leading-relaxed text-base md:text-lg max-w-3xl">
            {t.heroDesc}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-none px-6 py-2 text-xs font-medium transition-colors"
            >
              {t.exploreCourses} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-none px-6 py-2 text-xs font-medium transition-colors"
            >
              {t.contactAdvisory}
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {t.whyTitle}
            </h2>
            <p className="text-sm text-slate-600">{t.whySubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-none border-slate-200 shadow-none bg-white">
              <CardHeader className="space-y-3">
                <ShieldCheck className="h-8 w-8 text-slate-900 stroke-[1.5]" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  {t.pillar1Title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardDescription className="text-slate-600 leading-normal text-xs">
                  {t.pillar1Desc}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-none border-slate-200 shadow-none bg-white">
              <CardHeader className="space-y-3">
                <Award className="h-8 w-8 text-slate-900 stroke-[1.5]" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  {t.pillar2Title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardDescription className="text-slate-600 leading-normal text-xs">
                  {t.pillar2Desc}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-none border-slate-200 shadow-none bg-white">
              <CardHeader className="space-y-3">
                <Building2 className="h-8 w-8 text-slate-900 stroke-[1.5]" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  {t.pillar3Title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardDescription className="text-slate-600 leading-normal text-xs">
                  {t.pillar3Desc}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            {t.curriculaTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {t.curriculaItems.map((subject, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 border border-slate-100 p-3 bg-slate-50"
              >
                <CheckCircle2 className="h-4 w-4 text-slate-800 shrink-0" />
                <span className="text-xs font-medium text-slate-800">
                  {subject}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-none border-slate-300 bg-slate-900 text-white shadow-none">
          <CardHeader className="space-y-2">
            <Badge className="w-fit bg-slate-800 text-slate-200 rounded-none border-none text-[10px] tracking-widest uppercase">
              {t.ctaBadge}
            </Badge>
            <CardTitle className="text-2xl font-bold font-serif text-white">
              {t.ctaTitle}
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              {t.ctaDesc}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Link
              href={`/${locale}/dashboard`}
              className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 rounded-none px-6 py-2 text-xs font-semibold transition-colors"
            >
              {t.ctaButton}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}