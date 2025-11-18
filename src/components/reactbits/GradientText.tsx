import React from "react";

type GradientTextProps = {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
};

const GradientText: React.FC<GradientTextProps> = ({
  children,
  from = "#a78bfa",
  via = "#60a5fa",
  to = "#f472b6",
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
