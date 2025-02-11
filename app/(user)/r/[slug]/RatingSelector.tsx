"use client";

import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { useState } from "react";

interface ReviewSelectorProps {
  onSelect: (rating: number) => void;
  initialRating?: number;
}

export default function ReviewSelector({ onSelect, initialRating = 0 }: ReviewSelectorProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const starRatings: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Perfect",
  };

  const handleMousseEnter = (index: number) => {
    setHover(index);
  };

  const handleMousseLeave = () => {
    setHover(0);
  };

  const handleClick = (index: number) => {
    setRating(index);
    onSelect(index);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            onMouseEnter={() => handleMousseEnter(index)}
            onMouseLeave={handleMousseLeave}
            onClick={() => handleClick(index)}
            className={cn(
              "cursor-pointer p-1 drop-shadow-md",
              index <= (hover || rating)
                ? "text-yellow-500 hover:text-yellow-600"
                : "text-gray-300 hover:text-gray-400"
            )}
          >
            <Star className="h-8 w-8 fill-current" />
          </div>
        ))}
      </div>
      <p className="w-full text-center text-sm font-light text-muted-foreground">
        {rating
          ? starRatings[rating]
          : hover
          ? starRatings[hover]
          : '\u00A0'}
      </p>
    </div>
  );
}