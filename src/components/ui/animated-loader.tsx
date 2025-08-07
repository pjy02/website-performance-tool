import * as React from "react";
import { motion } from "framer-motion";
import { Loader2, Activity } from "lucide-react";
import { loadingVariants, getAnimationConfig } from "@/lib/animations";

export interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "spin" | "pulse" | "bounce";
  text?: string;
  className?: string;
  disableAnimation?: boolean;
  icon?: React.ReactNode;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8"
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base"
};

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  size = "md",
  variant = "spin",
  text,
  className = "",
  disableAnimation = false,
  icon
}) => {
  // 如果禁用动画或用户偏好减少动画，使用简单的加载器
  if (disableAnimation || getAnimationConfig(loadingVariants) !== loadingVariants) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
        {text && <span className={textSizeClasses[size]}>{text}</span>}
      </div>
    );
  }

  const defaultIcon = icon || <Activity className={sizeClasses[size]} />;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        variants={loadingVariants}
        animate={variant}
        className="flex-shrink-0"
      >
        {defaultIcon}
      </motion.div>
      {text && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className={textSizeClasses[size]}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
};

// 骨架屏动画组件
export interface AnimatedSkeletonProps {
  lines?: number;
  className?: string;
  height?: string;
  width?: string;
}

export const AnimatedSkeleton: React.FC<AnimatedSkeletonProps> = ({
  lines = 1,
  className = "",
  height = "1rem",
  width = "100%"
}) => {
  const skeletonLines = Array.from({ length: lines }, (_, i) => (
    <motion.div
      key={i}
      className={`bg-muted rounded ${className}`}
      style={{ 
        height, 
        width: i === lines - 1 && lines > 1 ? "80%" : width,
        marginBottom: lines > 1 && i < lines - 1 ? "0.5rem" : "0"
      }}
      initial={{ opacity: 0.3 }}
      animate={{ 
        opacity: [0.3, 0.7, 0.3],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.1
      }}
    />
  ));

  return <div className="space-y-2">{skeletonLines}</div>;
};

// 脉冲加载器组件
export const PulseLoader: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4"
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`bg-primary rounded-full ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// 进度条加载器组件
export interface ProgressLoaderProps {
  progress?: number;
  className?: string;
  height?: string;
  showPercentage?: boolean;
}

export const ProgressLoader: React.FC<ProgressLoaderProps> = ({
  progress = 0,
  className = "",
  height = "4px",
  showPercentage = false
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className={`bg-muted rounded-full overflow-hidden ${height}`}>
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-muted-foreground mt-1 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

// 圆形进度加载器组件
export interface CircularLoaderProps {
  progress?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
}

export const CircularLoader: React.FC<CircularLoaderProps> = ({
  progress = 0,
  size = 40,
  strokeWidth = 4,
  className = "",
  showPercentage = false
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted opacity-20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-primary"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>
      {showPercentage && (
        <motion.span
          className="absolute text-xs font-medium"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {Math.round(progress)}%
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedLoader;