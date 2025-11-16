import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

export const Button = ({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) => {
  const classes = ["btn"];

  if (variant !== "primary") {
    classes.push(`btn-${variant}`);
  }

  if (size === "sm") classes.push("btn-sm");
  if (size === "lg") classes.push("btn-lg");

  if (className) classes.push(className);

  return (
    <button className={classes.join(" ").trim()} {...props}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </button>
  );
};
