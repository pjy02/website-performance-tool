import { Variants } from 'framer-motion';

// 按钮点击动画变体
export const buttonVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
  disabled: { scale: 1, opacity: 0.6 }
};

// 卡片悬停动画变体
export const cardVariants: Variants = {
  idle: { 
    y: 0, 
    scale: 1,
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
  },
  hover: { 
    y: -4, 
    scale: 1.02,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// 页面进入动画变体
export const pageEntryVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: 'easeOut',
      staggerChildren: 0.1
    }
  }
};

// 标题进入动画变体
export const titleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: 'easeOut' 
    }
  }
};

// 内容区域进入动画变体
export const contentVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      delay: 0.2,
      ease: 'easeOut' 
    }
  }
};

// Tabs切换动画变体
export const tabsVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3, 
      ease: 'easeOut' 
    }
  },
  exit: { 
    opacity: 0, 
    x: -20,
    transition: { 
      duration: 0.2, 
      ease: 'easeIn' 
    }
  }
};

// 加载状态动画变体
export const loadingVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// 数值计数动画变体
export const numberVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.5 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      type: 'spring',
      stiffness: 300,
      damping: 15
    }
  }
};

// 状态指示器动画变体
export const statusVariants: Variants = {
  success: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.6,
      repeat: 0,
      ease: 'easeOut'
    }
  },
  error: {
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.5,
      repeat: 0,
      ease: 'easeInOut'
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// 列表项动画变体
export const listItemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// 消息通知动画变体
export const messageVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -50,
    scale: 0.8
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    y: -50,
    scale: 0.8,
    transition: { 
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

// CDN状态呼吸灯动画变体
export const cdnStatusVariants: Variants = {
  active: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  inactive: {
    opacity: 0.3
  }
};

// Ping波浪动画变体
export const pingWaveVariants: Variants = {
  start: {
    scale: 0,
    opacity: 1
  },
  end: {
    scale: 2,
    opacity: 0,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeOut'
    }
  }
};

// 容器动画变体（用于包裹多个子元素）
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// 渐进式显示动画变体
export const fadeInUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

// 滑入动画变体
export const slideInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

// 工具函数：检测用户是否偏好减少动画
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// 工具函数：获取动画配置（考虑用户偏好）
export const getAnimationConfig = (variants: Variants, reducedMotionVariants?: Variants) => {
  if (prefersReducedMotion()) {
    return reducedMotionVariants || {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 }
    };
  }
  return variants;
};

// 响应式动画时长配置
export const responsiveDurations = {
  mobile: 0.3,
  tablet: 0.4,
  desktop: 0.5
};

// 获取当前设备类型的动画时长
export const getResponsiveDuration = (): number => {
  if (typeof window === 'undefined') return responsiveDurations.desktop;
  
  const width = window.innerWidth;
  if (width < 768) return responsiveDurations.mobile;
  if (width < 1024) return responsiveDurations.tablet;
  return responsiveDurations.desktop;
};