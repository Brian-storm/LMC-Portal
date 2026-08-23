// src/components/CourseCard.tsx
import Link from "next/link";
import { Clock, Award, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Define component prop types
export interface CourseProps {
  id: string;
  title: string;
  description: string;
  cpdHours: number;
  accreditation: string;
  priceHKD: number;
  category: string;
}

export function CourseCard({ course }: { course: CourseProps }) {
  return (
    <Card className="rounded-none border-slate-200 shadow-none hover:border-slate-400 transition-colors flex flex-col justify-between bg-white">
      <CardHeader className="space-y-3">
        {/* Top Badges */}
        <div className="flex justify-between items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-none text-[11px] border-slate-300 text-slate-700 bg-slate-50"
          >
            <Clock className="w-3 h-3 mr-1 text-slate-500" />
            {course.cpdHours} CPD Hours
          </Badge>
          <Badge className="rounded-none text-[10px] bg-slate-900 text-white hover:bg-slate-900 uppercase tracking-wider">
            {course.category}
          </Badge>
        </div>

        {/* Title */}
        <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2 leading-snug">
          {course.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
          {course.description}
        </p>

        {/* Accreditation Tag */}
        <div className="flex items-center text-xs text-slate-500 border-t border-slate-100 pt-3">
          <Award className="w-4 h-4 mr-1.5 text-slate-700 shrink-0" />
          <span className="truncate">
            Accreditation: <strong>{course.accreditation}</strong>
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-4 bg-slate-50/50">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest block">
            Course Fee
          </span>
          <span className="text-base font-bold text-slate-900">
            HK$ {course.priceHKD.toLocaleString()}
          </span>
        </div>

        <Button
          asChild
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-none text-xs"
        >
          <Link href={`/courses/${course.id}`}>
            Enroll <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
