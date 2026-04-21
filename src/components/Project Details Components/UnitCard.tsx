import { BedDouble, ShowerHead, Maximize2 } from "lucide-react";
import type { UnitCardProps } from "@/types/projects";

export default function UnitCard({
  house,
  isHovered,
  onHover,
  onLeave,
  onBuy,
  onBookTour,
  LoginNotice,
}: UnitCardProps) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative rounded-xl transition-all duration-300 overflow-hidden"
      style={{
        background: isHovered
          ? "linear-gradient(135deg, #ff5c00, #ff8c42)"
          : "#fff",
        transform: isHovered
          ? "translateY(-4px) scale(1.02)"
          : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? "0 12px 30px rgba(255,92,0,0.3)"
          : "0 2px 10px rgba(0,0,0,0.06)",
        border: isHovered ? "2px solid #ff5c00" : "2px solid #f1f1f1",
      }}
    >
      {/* Floor badge */}
      <div
        className="px-3 py-1.5 text-xs font-bold"
        style={{
          background: isHovered ? "rgba(0,0,0,0.15)" : "#f8f9fa",
          color: isHovered ? "white" : "#888",
        }}
      >
        Floor {house.floor} — Unit #{house.id}
      </div>
      <div className="p-4">
        <p
          className="text-xl font-extrabold mb-3"
          style={{ color: isHovered ? "white" : "#ff5c00" }}
        >
          ${house.price.toLocaleString()}
        </p>
        <div
          className="flex flex-wrap gap-4 text-sm"
          style={{ color: isHovered ? "rgba(255,255,255,0.85)" : "#666" }}
        >
          <span className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 shrink-0" />
            {house.nb_bedrooms} Bed{house.nb_bedrooms !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <ShowerHead className="w-4 h-4 shrink-0" />
            {house.nb_bathrooms} Bath{house.nb_bathrooms !== 1 ? "s" : ""}
          </span>
          {house.area != null && (
            <span className="flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 shrink-0" />
              {house.area} m²
            </span>
          )}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={onBuy}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed ${
              isHovered
                ? "border-white bg-white text-orange-500 hover:bg-white/90"
                : "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
            }`}
            disabled={LoginNotice}
          >
            {LoginNotice ? "Login to buy" : "Buy this unit"}
          </button>
          <button
            type="button"
            onClick={onBookTour}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition cursor-pointer ${
              isHovered
                ? "border-white/70 bg-transparent text-white hover:bg-white/15"
                : "border-orange-500 bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            Book a tour
          </button>
        </div>
      </div>
    </div>
  );
}
