"use client";

import { QUALITIES, QUALITY_CLASS } from "@/shared/config/options";
import { cn } from "@/shared/lib/utils";

const STARS = [1, 2, 3, 4, 5];

export function QualityRadios({
  name,
  value,
  onChange,
}: {
  name: string;
  value: string;
  onChange: (quality: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 text-sm font-heading">
      {QUALITIES.map((quality) => (
        <label
          key={quality}
          className={cn("flex items-center gap-1", QUALITY_CLASS[quality])}
        >
          <input
            type="radio"
            name={name}
            checked={value === quality}
            onChange={() => onChange(quality)}
          />
          {quality}
        </label>
      ))}
    </div>
  );
}

export function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange: (stars: number) => void;
}) {
  return (
    <div className="flex gap-1 text-xl leading-none text-yellow-400">
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          className="text-yellow-400"
          onClick={() => onChange(star)}
          aria-label={`${star} stars`}
        >
          {star <= value ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
