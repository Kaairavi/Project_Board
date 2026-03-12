"use client";

export default function ProgressRing({
  progress,
}: {
  progress: number;
}) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width="56" height="56" className="rotate-[-90deg]">
      <circle
        cx="28"
        cy="28"
        r={radius}
        stroke="#E5E7EB"
        strokeWidth="6"
        fill="transparent"
      />
      <circle
        cx="28"
        cy="28"
        r={radius}
        stroke="#6366F1"
        strokeWidth="6"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}
