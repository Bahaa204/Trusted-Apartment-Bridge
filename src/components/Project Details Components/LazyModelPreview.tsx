import { useEffect, useRef, useState } from "react";

type LazyModelPreviewProps = {
  children: React.ReactNode;
  className?: string;
};

export default function LazyModelPreview({
  children,
  className,
}: LazyModelPreviewProps) {
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible) return;
    const node = containerRef.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? (
        children
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400">
          Loading preview...
        </div>
      )}
    </div>
  );
}
