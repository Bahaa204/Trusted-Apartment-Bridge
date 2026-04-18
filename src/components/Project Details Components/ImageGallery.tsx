import { useState } from "react";

type ImageGalleryProps = {
  images: string[];
};

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-lg mb-10 group">
      <img
        src={images[current]}
        alt="Project"
        className="w-full h-80 object-cover"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent((p) => (p === 0 ? images.length - 1 : p - 1))
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-lg"
          >
            &lt;
          </button>
          <button
            onClick={() =>
              setCurrent((p) => (p === images.length - 1 ? 0 : p + 1))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-lg"
          >
            &gt;
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition ${
                  i === current ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
