import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-semibold transition-[transform,background-color,border-color,color] duration-150 ease-out active:not-disabled:scale-[0.96] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-copper text-bg hover:bg-copper/90",
        ghost: "border border-line bg-surface/40 text-fg hover:border-copper",
        quiet: "min-h-11 bg-transparent px-0 text-copper hover:text-fg",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  if (asChild) {
    return <Slot className={cn(buttonVariants({ variant }), className)} {...props} />;
  }
  return (
    <button className={cn(buttonVariants({ variant }), className)} type={type} {...props} />
  );
}

export { buttonVariants };
