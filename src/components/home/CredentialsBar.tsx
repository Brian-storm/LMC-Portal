import { ShieldCheck, Award, CheckCircle2 } from "lucide-react";

export function CredentialsBar() {
  return (
    <section className="bg-card border-b border-border/80 py-6 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Accredited Curriculums
              </h4>
              <p className="text-muted-foreground text-xs">
                Recognized by regional governing bodies.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <Award className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Executive Advisory
              </h4>
              <p className="text-muted-foreground text-xs">
                Taught by seasoned industry leaders.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start space-x-3">
            <CheckCircle2 className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Secure Enterprise Portal
              </h4>
              <p className="text-muted-foreground text-xs">
                24/7 access to student records and resources.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
