
"use client";
import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export const Spotlight = ({
  className,
  fill,
}: {
  className?: string;
  fill?: string;
}) => {
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect();

    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-30 transition-opacity duration-500 opacity-0 group-hover:opacity-100",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 bg-transparent">
        <motion.div
          className="absolute inset-0 z-10 bg-transparent"
          style={{
            background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              hsl(var(--primary) / 0.1),
              transparent 80%
            )
          `,
          }}
        />
        <motion.div
          className="absolute inset-0 z-20 bg-transparent"
          style={{
            maskImage: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
            WebkitMaskImage: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              white,
              transparent 80%
            )
          `,
          }}
        />
      </div>
    </div>
  );
};
