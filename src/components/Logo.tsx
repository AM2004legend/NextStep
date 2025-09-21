import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <svg
    className={cn(className)}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 21V3H8.33333L18.6667 15.3333V21H16V17.3333L8.33333 9.66667V21H5Z" 
      fill="currentColor" 
    />
    <path 
      d="M8 17V15H10V13H12V11H14V9H16V7H18V5L20 7V5H18" 
      stroke="hsl(var(--background))"
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);