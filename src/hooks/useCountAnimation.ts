import { useEffect, useRef, useState } from "react";

export function useCountAnimation(finalValue: number, duration = 1000) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          let startTime: number | null = null;
          let animationFrameId: number;

          const animate = (currentTime: number) => {
            if (startTime === null) {
              startTime = currentTime;
            }

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Use easeOut animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(finalValue * easeProgress);

            setDisplayValue(currentValue);

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(animate);
            }
          };

          animationFrameId = requestAnimationFrame(animate);

          return () => {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
          };
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [finalValue, duration]);

  return { displayValue, elementRef };
}
