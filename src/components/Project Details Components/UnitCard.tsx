import type { House } from "@/types/types";

type UnitCardProps = {
  house: House;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onBuy: () => void;
};

export default function UnitCard({
  house,
  isHovered,
  onHover,
  onLeave,
  onBuy,
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
          className="flex gap-5 text-sm"
          style={{ color: isHovered ? "rgba(255,255,255,0.85)" : "#666" }}
        >
          <span>🛏 {house.nb_bedrooms} Bedrooms</span>
          <span>🚿 {house.nb_bathrooms} Bathrooms</span>
        </div>
        <button
          type="button"
          onClick={onBuy}
          className={`mt-5 w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
            isHovered
              ? "border-white bg-white text-orange-500 hover:bg-white/90"
              : "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
          }`}
        >
          Buy this unit
        </button>
      </div>
    </div>
  );
}
