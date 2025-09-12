
"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({
  className,
}: {
  className?: string;
}) => {
  const numberOfBeams = 50;
  const duration = 5;

  const getRandomValue = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-full h-full z-0 overflow-hidden",
        className
      )}
    >
      <div className="relative w-full h-full">
        {Array.from({ length: numberOfBeams }).map((_, i) => (
          <motion.div
            key={`beam-${i}`}
            initial={{
              y: getRandomValue(-10, 10) > 0 ? -20 : "120%",
              x: `${getRandomValue(0, 100)}%`,
            }}
            animate={{
              y: getRandomValue(-10, 10) > 0 ? "120%" : -20,
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: getRandomValue(0, duration),
              ease: "linear",
            }}
            style={{
              position: "absolute",
              width: `${getRandomValue(1, 3)}px`,
              height: `${getRandomValue(20, 100)}px`,
              backgroundColor: `hsl(var(--primary) / ${getRandomValue(
                0.1,
                0.3
              )})`,
              boxShadow: `0 0 ${getRandomValue(
                5,
                15
              )}px hsl(var(--primary) / ${getRandomValue(0.2, 0.5)})`,
              top: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};
