import React from "react";

type GradientTextProps = {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
};

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  from = "#8b5cf6",
  via = "#06b6d4",
  to = "#f97316",
}) => (
  <span
    style={{
      background: `linear-gradient(120deg, ${from}, ${via}, ${to})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontWeight: 600,
    }}
  >
    {children}
  </span>
);

export default GradientText;
