import Link from "next/link";
import {
  ShieldCheck,
  Award,
  GraduationCap,
  Building2,
  FileCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About Us | LMC Management Consultancy",
  description:
    "Accredited Continuing Professional Development (CPD) and corporate management consultancy services in Hong Kong.",
};

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Hero Section */}
        <div className="bg-white border border-slate-200 p-8 md:p-12 space-y-6">
          <Badge
            variant="outline"
            className="rounded-none border-slate-300 text-slate-700 tracking-wider uppercase text-xs"
          >
            Hong Kong Professional Training & Compliance
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 font-serif">
            Empowering Financial & Insurance Professionals Through Accredited
            Excellence
          </h1>
          <p className="text-slate-600 leading-relaxed text-base md:text-lg max-w-3xl">
            LMC Management Consultancy delivers high-impact Continuing
            Professional Development (CPD) courses, executive training, and
            advisory services across Hong Kong. We bridge regulatory
            requirements with practical corporate expertise.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              asChild
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-none px-6"
            >
              <Link href="/courses">
                Explore CPD Courses <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-none border-slate-300 text-slate-700"
            >
              <Link href="/contact">Contact Our Advisory</Link>
            </Button>
          </div>
        </div>

        {/* Key Accreditation Pillars */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Why Professionals Choose LMC
            </h2>
            <p className="text-sm text-slate-600">
              Built to satisfy Hong Kong’s strict regulatory standards and
              professional guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-none border-slate-200 shadow-none bg-white">
              <CardHeader className="space-y-3">
                <ShieldCheck className="h-8 w-8 text-slate-900 stroke-[1.5]" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  Regulatory Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardDescription className="text-slate-600 leading-normal text-xs">
                  All training modules align with criteria set by local
                  regulatory authorities, ensuring fully transferable CPD hours.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-none border-slate-200 shadow-none bg-white">
              <CardHeader className="space-y-3">
                <Award className="h-8 w-8 text-slate-900 stroke-[1.5]" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  Verified e-Certificates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardDescription className="text-slate-600 leading-normal text-xs">
                  Automated electronic attendance receipts and tamper-proof PDF
                  certificates generated upon course completion.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="rounded-none border-slate-200 shadow-none bg-white">
              <CardHeader className="space-y-3">
                <Building2 className="h-8 w-8 text-slate-900 stroke-[1.5]" />
                <CardTitle className="text-lg font-bold text-slate-900">
                  Corporate Solutions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardDescription className="text-slate-600 leading-normal text-xs">
                  Tailored group training programs, corporate bulk enrollment,
                  and automated attendance tracking for institutions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Core Domains & Framework */}
        <div className="bg-white border border-slate-200 p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">
            Our Core Curricula Areas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Insurance Law & Ethics",
              "Anti-Money Laundering (AML)",
              "Risk Management & Governance",
              "Financial Product Compliance",
            ].map((subject, index) => (
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

        {/* Institutional Callout Box */}
        <Card className="rounded-none border-slate-300 bg-slate-900 text-white shadow-none">
          <CardHeader className="space-y-2">
            <Badge className="w-fit bg-slate-800 text-slate-200 rounded-none border-none text-[10px] tracking-widest uppercase">
              Student & Corporate Portal
            </Badge>
            <CardTitle className="text-2xl font-bold font-serif text-white">
              Need Instant Enrollment or Verification?
            </CardTitle>
            <CardDescription className="text-slate-300 text-xs">
              Access your student dashboard to track completed hours, download
              electronic receipts, or verify attendance records.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              asChild
              className="bg-white text-slate-900 hover:bg-slate-100 rounded-none text-xs font-semibold"
            >
              <Link href="/student/courses">Go to Student Portal</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
