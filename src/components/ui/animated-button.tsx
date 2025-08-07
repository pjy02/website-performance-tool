import * as React from "react";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants, getAnimationConfig } from "@/lib/animations";

// 扩展原有的按钮变体，添加动画相关类
const animatedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean;
  disableAnimation?: boolean;
  animationScale?: number;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    disableAnimation = false,
    animationScale = 0.95,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // 如果禁用动画或用户偏好减少动画，使用原始按钮
    if (disableAnimation || getAnimationConfig(buttonVariants) !== buttonVariants) {
      return (
        <Comp
          ref={ref}
          data-slot="button"
          className={cn(animatedButtonVariants({ variant, size, className }))}
          disabled={disabled}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    // 动画按钮的变体配置
    const buttonMotionVariants = {
      idle: { scale: 1 },
      hover: { scale: 1.05, transition: { duration: 0.2 } },
      tap: { scale: animationScale, transition: { duration: 0.1 } },
      disabled: { scale: 1, opacity: 0.6 }
    };

    return (
      <motion.button
        ref={ref}
        data-slot="button"
        className={cn(animatedButtonVariants({ variant, size, className }))}
        disabled={disabled}
        variants={buttonMotionVariants}
        initial="idle"
        whileHover={!disabled ? "hover" : undefined}
        whileTap={!disabled ? "tap" : undefined}
        animate={disabled ? "disabled" : "idle"}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, animatedButtonVariants };