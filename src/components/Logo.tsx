import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
    <svg
      className={cn(className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M4 20V16H8V12H12V8H16V4" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="16" y="2" width="5" height="5" rx="1" fill="hsl(var(--primary))"/>
    </svg>
);
