import React from 'react';
import { cn } from "@/lib/utils";

export const SkeletonLoader = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-cg-surface/80 border border-cg-border/40", className)}
      {...props}
    />
  );
};
