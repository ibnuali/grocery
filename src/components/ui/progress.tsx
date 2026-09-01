import * as React from "react";

export interface ProgressProps {
  value: number; // 0 - 100
  className?: string;
  colorVariant?: "accent" | "cyan" | "coral" | "mint";
  "aria-label"?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className = "",
  colorVariant = "accent",
  "aria-label": ariaLabel,
}) => {
  const boundedValue = Math.min(100, Math.max(0, value));
  const colors = {
    accent: "var(--color-accent)",
    cyan: "var(--color-accent-2)",
    coral: "var(--color-accent-3)",
    mint: "var(--color-mint)",
  };

  return (
    <div
      className={className}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={boundedValue}
      style={{
        height: "0.6rem",
        width: "100%",
        overflow: "hidden",
        borderRadius: "var(--radius-pill)",
        background: "var(--color-paper-3)",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${boundedValue}%`,
          borderRadius: "var(--radius-pill)",
          background: colors[colorVariant],
          transition: "width 400ms var(--ease-snap)",
        }}
      />
    </div>
  );
};
