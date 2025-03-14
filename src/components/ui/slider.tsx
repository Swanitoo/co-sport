"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "@/lib/utils";

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  showValues?: boolean;
  showValuePrefix?: string;
  showValueSuffix?: string;
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(
  (
    { className, showValues, showValuePrefix, showValueSuffix, ...props },
    ref
  ) => {
    const defaultValue = Array.isArray(props.defaultValue)
      ? props.defaultValue
      : props.defaultValue !== undefined
      ? [props.defaultValue]
      : [0];
    const value = props.value
      ? Array.isArray(props.value)
        ? props.value
        : [props.value]
      : undefined;

    return (
      <div className="relative space-y-2">
        <SliderPrimitive.Root
          ref={ref}
          className={cn(
            "relative flex w-full touch-none select-none items-center",
            className
          )}
          {...props}
          defaultValue={defaultValue}
          value={value}
        >
          <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <SliderPrimitive.Range className="absolute h-full bg-primary" />
          </SliderPrimitive.Track>
          {(value || defaultValue).map((_: number, i: number) => (
            <SliderPrimitive.Thumb
              key={i}
              className="block size-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            />
          ))}
        </SliderPrimitive.Root>

        {showValues && (
          <div className="flex justify-between text-xs text-muted-foreground">
            {(value || defaultValue).map((val: number, i: number) => (
              <span key={i} className="text-xs font-medium">
                {showValuePrefix || ""}
                {val}
                {showValueSuffix || ""}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
