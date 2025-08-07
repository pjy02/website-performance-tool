import { Variants } from 'framer-motion';
import React, { useEffect, useState } from 'react';

// 性能优化工具函数
export class AnimationOptimizer {
  // 防抖函数，用于限制动画触发频率
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // 节流函数，用于限制动画触发频率
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // 优化的动画变体，减少不必要的计算
  static createOptimizedVariants(baseVariants: Variants, optimizations?: {
    reduceComplexity?: boolean;
    disableGpu?: boolean;
    simplifyTransitions?: boolean;
  }): Variants {
    if (!optimizations?.reduceComplexity) {
      return baseVariants;
    }

    const optimized: Variants = {};
    
    Object.keys(baseVariants).forEach(key => {
      const originalVariant = baseVariants[key as keyof Variants];
      
      if (typeof originalVariant === 'object' && originalVariant !== null) {
        optimized[key as keyof Variants] = {
          ...originalVariant,
          // 简化过渡效果
          transition: optimizations.simplifyTransitions ? {
            duration: 0.2,
            ease: 'easeOut'
          } : originalVariant.transition,
          // 减少GPU加速使用
          willChange: optimizations.disableGpu ? 'auto' : originalVariant.willChange || 'auto'
        };
      } else {
        optimized[key as keyof Variants] = originalVariant;
      }
    });

    return optimized;
  }

  // 内存优化的动画配置
  static getMemoryOptimizedConfig(isLowEndDevice: boolean = false) {
    return {
      // 低端设备使用更简单的动画
      staggerDelay: isLowEndDevice ? 0.05 : 0.1,
      animationDuration: isLowEndDevice ? 0.2 : 0.4,
      maxConcurrentAnimations: isLowEndDevice ? 3 : 6,
      // 禁用复杂的动画效果
      disableComplexAnimations: isLowEndDevice,
      // 减少阴影和模糊效果
      reduceVisualEffects: isLowEndDevice,
    };
  }

  // 检测设备性能
  static detectDevicePerformance(): 'high' | 'medium' | 'low' {
    if (typeof window === 'undefined') return 'medium';

    // 检测硬件并发数
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    
    // 检测设备内存（如果可用）
    const deviceMemory = (navigator as any).deviceMemory || 4;
    
    // 检测网络连接类型
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType || '4g';
    
    // 综合评分
    let score = 0;
    
    // CPU 评分
    if (hardwareConcurrency >= 8) score += 3;
    else if (hardwareConcurrency >= 4) score += 2;
    else if (hardwareConcurrency >= 2) score += 1;
    
    // 内存评分
    if (deviceMemory >= 8) score += 3;
    else if (deviceMemory >= 4) score += 2;
    else if (deviceMemory >= 2) score += 1;
    
    // 网络评分
    if (effectiveType === '4g') score += 2;
    else if (effectiveType === '3g') score += 1;
    
    if (score >= 6) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }
}

// 动画调度器
export class AnimationScheduler {
  private static activeAnimations = new Set<string>();
  private static maxConcurrent = 6;
  private static queue: Array<{ id: string; callback: () => void }> = [];

  static schedule(id: string, callback: () => void): void {
    if (this.activeAnimations.size < this.maxConcurrent) {
      this.executeAnimation(id, callback);
    } else {
      this.queue.push({ id, callback });
    }
  }

  private static executeAnimation(id: string, callback: () => void): void {
    this.activeAnimations.add(id);
    callback();
    
    // 模拟动画完成
    setTimeout(() => {
      this.activeAnimations.delete(id);
      this.processQueue();
    }, 300);
  }

  private static processQueue(): void {
    if (this.queue.length > 0 && this.activeAnimations.size < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) {
        this.executeAnimation(next.id, next.callback);
      }
    }
  }

  static setMaxConcurrent(max: number): void {
    this.maxConcurrent = max;
  }

  static getActiveCount(): number {
    return this.activeAnimations.size;
  }
}

// 动画性能监控
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();
  private static thresholds = {
    warning: 50, // ms
    critical: 100 // ms
  };

  static startMeasure(id: string): void {
    if (typeof window === 'undefined') return;
    performance.mark(`${id}-start`);
  }

  static endMeasure(id: string): number {
    if (typeof window === 'undefined') return 0;
    
    performance.mark(`${id}-end`);
    performance.measure(id, `${id}-start`, `${id}-end`);
    
    const measures = performance.getEntriesByName(id);
    const duration = measures[measures.length - 1]?.duration || 0;
    
    // 存储指标
    if (!this.metrics.has(id)) {
      this.metrics.set(id, []);
    }
    this.metrics.get(id)!.push(duration);
    
    // 清理标记
    performance.clearMarks(`${id}-start`);
    performance.clearMarks(`${id}-end`);
    performance.clearMeasures(id);
    
    return duration;
  }

  static getAverageDuration(id: string): number {
    const durations = this.metrics.get(id) || [];
    if (durations.length === 0) return 0;
    
    const sum = durations.reduce((a, b) => a + b, 0);
    return sum / durations.length;
  }

  static isPerformanceAcceptable(id: string): boolean {
    const avg = this.getAverageDuration(id);
    return avg < this.thresholds.warning;
  }

  static getMetrics(): Record<string, { average: number; count: number; status: 'good' | 'warning' | 'critical' }> {
    const result: Record<string, any> = {};
    
    this.metrics.forEach((durations, id) => {
      const average = this.getAverageDuration(id);
      let status: 'good' | 'warning' | 'critical' = 'good';
      
      if (average >= this.thresholds.critical) status = 'critical';
      else if (average >= this.thresholds.warning) status = 'warning';
      
      result[id] = {
        average,
        count: durations.length,
        status
      };
    });
    
    return result;
  }
}

// 优化的动画Hook
export function useOptimizedAnimation(options: {
  id?: string;
  enabled?: boolean;
  performanceMode?: 'auto' | 'high' | 'medium' | 'low';
  onPerformanceIssue?: (metrics: any) => void;
} = {}) {
  const {
    id = 'default',
    enabled = true,
    performanceMode = 'auto',
    onPerformanceIssue
  } = options;

  const devicePerformance = performanceMode === 'auto' 
    ? AnimationOptimizer.detectDevicePerformance() 
    : performanceMode;

  const shouldOptimize = devicePerformance === 'low' || !enabled;

  const startAnimation = (callback: () => void) => {
    if (!enabled) return;
    
    if (shouldOptimize) {
      AnimationScheduler.schedule(id, callback);
    } else {
      callback();
    }
  };

  const measurePerformance = (callback: () => void) => {
    if (!enabled || typeof window === 'undefined') {
      callback();
      return;
    }

    PerformanceMonitor.startMeasure(id);
    callback();
    const duration = PerformanceMonitor.endMeasure(id);
    
    if (!PerformanceMonitor.isPerformanceAcceptable(id) && onPerformanceIssue) {
      onPerformanceIssue({
        id,
        duration,
        average: PerformanceMonitor.getAverageDuration(id),
        devicePerformance
      });
    }
  };

  return {
    devicePerformance,
    shouldOptimize,
    startAnimation,
    measurePerformance,
    metrics: PerformanceMonitor.getMetrics()
  };
}

// 导出便捷的工具函数
export const {
  debounce,
  throttle,
  createOptimizedVariants,
  getMemoryOptimizedConfig,
  detectDevicePerformance
} = AnimationOptimizer;

// 设备类型检测Hook
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const updateDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    updateDeviceType();
    window.addEventListener('resize', updateDeviceType);
    return () => window.removeEventListener('resize', updateDeviceType);
  }, []);

  return deviceType;
};

// 检测用户是否偏好减少动画的Hook
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};