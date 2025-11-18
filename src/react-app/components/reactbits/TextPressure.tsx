import React from "react";

type TextPressureProps = {
  text: string;
  flex?: boolean;
  alpha?: boolean;
  stroke?: boolean;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  textColor?: string;
  strokeColor?: string;
  minFontSize?: number;
};

// Lightweight TextPressure-inspired component for animated headlines.
export const TextPressure: React.FC<TextPressureProps> = ({
  text,
  flex = true,
  alpha = false,
  stroke = false,
  width = true,
  weight = true,
  italic = false,
  textColor = "#ffffff",
  strokeColor = "#ff0000",
  minFontSize = 36,
}) => {
  const variation = [
    width ? "\"wdth\" 120" : undefined,
    weight ? "\"wght\" 800" : undefined,
    italic ? "\"ital\" 1" : undefined,
  ]
    .filter(Boolean)
    .join(", ");

  const style: React.CSSProperties = {
    display: flex ? "flex" : "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: `${minFontSize}px`,
    fontWeight: weight ? 800 : 600,
    fontStyle: italic ? "italic" : "normal",
    color: textColor,
    WebkitTextStroke: stroke ? `1px ${strokeColor}` : undefined,
    opacity: alpha ? 0.9 : 1,
    fontVariationSettings: variation || undefined,
    letterSpacing: "-0.04em",
    lineHeight: 1.1,
  };

  return <div style={style}>{text}</div>;
};

export default TextPressure;
