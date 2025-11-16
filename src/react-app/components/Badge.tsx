import { ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "ultra"
  | "ultra-plus";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

export const Badge = ({
  variant = "default",
  children,
  className = "",
}: BadgeProps) => {
  const classes = ["badge"];

  if (variant !== "default") {
    classes.push(`badge-${variant}`);
  }

  if (className) classes.push(className);

  return <span className={classes.join(" ").trim()}>{children}</span>;
};
