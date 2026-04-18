import type { ImageGalleryProps } from "@/types/projects";
import { useState } from "react";

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="relative h-48 overflow-hidden group/gallery">
      <img
        src={images[current]}
        alt="Project"
        className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-105"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrent((p) => (p === 0 ? images.length - 1 : p - 1));
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition text-sm"
          >
            &lt;
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrent((p) => (p === images.length - 1 ? 0 : p + 1));
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 transition text-sm"
          >
            &gt;
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition ${
                  i === current ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
