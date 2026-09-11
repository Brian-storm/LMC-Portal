import { ShieldCheck, Award, CheckCircle2 } from "lucide-react";
import type { CredentialsBarDict } from "@/dictionaries/types";

interface CredentialsBarProps {
  dict: CredentialsBarDict;
}

export function CredentialsBar({ dict }: CredentialsBarProps) {
  return (
    <section className="bg-card border-b border-border/80 py-6 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                {dict.accredited.title}
              </h4>
              <p className="text-muted-foreground text-xs">
                {dict.accredited.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <Award className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                {dict.advisory.title}
              </h4>
              <p className="text-muted-foreground text-xs">
                {dict.advisory.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                {dict.portal.title}
              </h4>
              <p className="text-muted-foreground text-xs">
                {dict.portal.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
