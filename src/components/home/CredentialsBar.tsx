import { ShieldCheck, Award, CheckCircle2 } from "lucide-react";

export interface CredentialItem {
  title: string;
  description: string;
}

interface CredentialsBarProps {
  dict?: {
    accredited?: CredentialItem;
    advisory?: CredentialItem;
    portal?: CredentialItem;
  };
}

export function CredentialsBar({ dict }: CredentialsBarProps) {
  const accredited = {
    title: dict?.accredited?.title || "Accredited Curriculums",
    description:
      dict?.accredited?.description ||
      "Recognized by regional governing bodies.",
  };

  const advisory = {
    title: dict?.advisory?.title || "Executive Advisory",
    description:
      dict?.advisory?.description || "Taught by seasoned industry leaders.",
  };

  const portal = {
    title: dict?.portal?.title || "Secure Enterprise Portal",
    description:
      dict?.portal?.description ||
      "24/7 access to student records and resources.",
  };

  return (
    <section className="bg-card border-b border-border/80 py-6 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                {accredited.title}
              </h4>
              <p className="text-muted-foreground text-xs">
                {accredited.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <Award className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                {advisory.title}
              </h4>
              <p className="text-muted-foreground text-xs">
                {advisory.description}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                {portal.title}
              </h4>
              <p className="text-muted-foreground text-xs">
                {portal.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
