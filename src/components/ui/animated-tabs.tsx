"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import { tabsVariants, getAnimationConfig } from "@/lib/animations";

function AnimatedTabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function AnimatedTabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props}
    />
  );
}

function AnimatedTabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function AnimatedTabsContent({
  className,
  children,
  disableAnimation = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  disableAnimation?: boolean;
}) {
  // 如果禁用动画或用户偏好减少动画，使用原始内容
  if (disableAnimation || getAnimationConfig(tabsVariants) !== tabsVariants) {
    return (
      <TabsPrimitive.Content
        data-slot="tabs-content"
        className={cn("flex-1 outline-none", className)}
        {...props}
      >
        {children}
      </TabsPrimitive.Content>
    );
  }

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none relative", className)}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={props.value}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={tabsVariants}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </TabsPrimitive.Content>
  );
}

// 为了更好的性能，我们还创建一个优化的版本，使用motion.div包装
function OptimizedAnimatedTabsContent({
  className,
  children,
  disableAnimation = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  disableAnimation?: boolean;
}) {
  // 如果禁用动画或用户偏好减少动画，使用原始内容
  if (disableAnimation || getAnimationConfig(tabsVariants) !== tabsVariants) {
    return (
      <TabsPrimitive.Content
        data-slot="tabs-content"
        className={cn("flex-1 outline-none", className)}
        {...props}
      >
        {children}
      </TabsPrimitive.Content>
    );
  }

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={tabsVariants}
      >
        {children}
      </motion.div>
    </TabsPrimitive.Content>
  );
}

export { 
  AnimatedTabs, 
  AnimatedTabsList, 
  AnimatedTabsTrigger, 
  AnimatedTabsContent,
  OptimizedAnimatedTabsContent 
};