// components/ui/filtered-textarea.tsx
"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Textarea } from "./textarea";

const FilteredTextarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const filtered = e.target.value.replace(/[<>{}[\]\\\/]/g, "").slice(0, 500);

    e.target.value = filtered;
    props.onChange?.(e);
  };

  return (
    <Textarea
      className={cn("resize-none", className)}
      ref={ref}
      onChange={handleChange}
      maxLength={300}
      {...props}
    />
  );
});

FilteredTextarea.displayName = "FilteredTextarea";

export { FilteredTextarea };
