// src/app/loading.tsx
import { Shield } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-background text-foreground transition-colors duration-300">
      <div className="relative flex flex-col items-center max-w-sm w-full">
        {/* Soft Ambient Glow Effect */}
        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* Central Brand Icon Indicator */}
        <div className="relative z-10 flex items-center justify-center mb-6">
          {/* Animated Outer Ring */}
          <div className="absolute w-16 h-16 rounded-full border-2 border-primary/20 border-t-accent animate-spin" />
          
          {/* Inner Badge Icon */}
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-xs">
            <Shield className="w-5 h-5 text-primary animate-pulse" />
          </div>
        </div>

        {/* Status Text & Progress Bar */}
        <div className="relative z-10 text-center space-y-3 w-full">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase">
            LMC Management Consultancy
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Preparing your workspace...
          </p>

          {/* Smooth Loading Track */}
          <div className="w-48 h-1 bg-border/60 rounded-full mx-auto overflow-hidden mt-4">
            <div className="h-full bg-accent rounded-full animate-indeterminate" />
          </div>
        </div>
      </div>
    </div>
  );
}