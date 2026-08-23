import Link from "next/link";
import { Scale, BookOpen, ShieldAlert, Award, ArrowLeft } from "lucide-react";

export function StyledComponent() {
  return (
    <div className="bg-white border border-slate-200 border-l-4 border-l-blue-900 p-6 shadow-2xs hover:border-l-blue-700 hover:shadow-md transition-all">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-50 text-blue-900 rounded-xs">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="font-serif font-bold text-slate-900">Professional Courses</h3>
      </div>
      {/* Content */}
    </div>
  );
}