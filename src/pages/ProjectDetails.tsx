import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";

type House = {
  id: number;
  price: number;
  floor: number;
  nb_bedrooms: number;
  nb_bathrooms: number;
};

type Building = {
  id: number;
  name: string;
  houses: House[];
};

type Project = {
  id: number;
  name: string;
  description: string;
  country_id: number;
  location: string;
  images_url: string[];
  countries: { name: string } | null;
  buildings: Building[];
};

/* ─── Image Gallery ─── */
function Gallery({ images }: { images: string[] }) {
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

/* ─── Realistic 3D Building ─── */
function Building3D({
  building,
  isSelected,
  onClick,
  hoveredFloor,
  onFloorHover,
  onFloorLeave,
}: {
  building: Building;
  isSelected: boolean;
  onClick: () => void;
  hoveredFloor: number | null;
  onFloorHover: (houseId: number) => void;
  onFloorLeave: () => void;
}) {
  const maxFloor = Math.max(...building.houses.map((h) => h.floor), 1);
  const floorCount = Math.max(maxFloor, building.houses.length);
  const floorH = 32;
  const height = floorCount * floorH + 40; // +40 for lobby + roof
  const width = 120;
  const depth = 50;

  // Sort houses by floor descending for display
  const sortedHouses = [...building.houses].sort((a, b) => b.floor - a.floor);
  const hoveredHouse = building.houses.find((h) => h.id === hoveredFloor);

  return (
    <div
      onClick={onClick}
      className="cursor-pointer group/bld flex flex-col items-center relative"
      style={{ perspective: "900px" }}
    >
      {/* Hover tooltip */}
      {hoveredHouse && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            bottom: `${height + 60}px`,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div
            className="bg-gray-900 text-white rounded-xl px-5 py-4 shadow-2xl border border-gray-700"
            style={{ minWidth: "220px" }}
          >
            <p className="text-xs text-orange-400 font-semibold mb-2">
              Floor {hoveredHouse.floor} — Unit #{hoveredHouse.id}
            </p>
            <p className="text-xl font-extrabold text-white mb-3">
              ${hoveredHouse.price.toLocaleString()}
            </p>
            <div className="flex gap-4 text-sm text-gray-300">
              <span>🛏 {hoveredHouse.nb_bedrooms} Beds</span>
              <span>🚿 {hoveredHouse.nb_bathrooms} Baths</span>
            </div>
            {/* Arrow */}
            <div
              className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-gray-900 border-r border-b border-gray-700"
              style={{ transform: "translateX(-50%) rotate(45deg)" }}
            />
          </div>
        </div>
      )}

      <div
        className="relative transition-all duration-700 ease-out"
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transformStyle: "preserve-3d",
          transform: isSelected
            ? "rotateX(-5deg) rotateY(-12deg) scale(1.12) translateY(-8px)"
            : "rotateX(-8deg) rotateY(-20deg) scale(1) translateY(0)",
        }}
      >
        {/* ── Front face ── */}
        <div
          className="absolute inset-0 overflow-hidden transition-all duration-500"
          style={{
            transform: `translateZ(${depth / 2}px)`,
            borderRadius: "6px 6px 0 0",
            background: isSelected
              ? "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
              : "linear-gradient(180deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)",
            boxShadow: isSelected
              ? "0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(255,92,0,0.15)"
              : "0 15px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Roof crown / parapet */}
          <div
            className="absolute top-0 left-0 right-0 transition-colors duration-500"
            style={{
              height: "8px",
              background: isSelected
                ? "linear-gradient(90deg, #ff5c00, #ff8c42, #ff5c00)"
                : "linear-gradient(90deg, #7f8c8d, #95a5a6, #7f8c8d)",
              borderRadius: "6px 6px 0 0",
            }}
          />

          {/* Glass curtain wall - floors */}
          <div className="flex flex-col-reverse px-2 pb-0 pt-3" style={{ gap: "2px", height: `${height - 36}px` }}>
            {sortedHouses.map((house) => {
              const isHovered = hoveredFloor === house.id;
              return (
                <div
                  key={house.id}
                  onMouseEnter={(e) => { e.stopPropagation(); onFloorHover(house.id); }}
                  onMouseLeave={(e) => { e.stopPropagation(); onFloorLeave(); }}
                  className="relative flex items-center justify-center transition-all duration-300"
                  style={{
                    height: `${floorH - 2}px`,
                    background: isHovered
                      ? "linear-gradient(90deg, rgba(255,92,0,0.6), rgba(255,140,66,0.5), rgba(255,92,0,0.6))"
                      : "linear-gradient(90deg, rgba(135,206,235,0.12), rgba(135,206,235,0.25), rgba(135,206,235,0.12))",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                  }}
                >
                  {/* Windows */}
                  <div className="flex gap-1.5 px-1">
                    {Array.from({ length: 4 }).map((_, w) => {
                      const isLit = (house.id + w) % 3 !== 0;
                      return (
                        <div
                          key={w}
                          className="transition-all duration-300"
                          style={{
                            width: "20px",
                            height: `${floorH - 10}px`,
                            borderRadius: "2px",
                            background: isHovered
                              ? "rgba(255,255,255,0.8)"
                              : isLit
                                ? "linear-gradient(180deg, rgba(255,223,120,0.7), rgba(255,200,60,0.4))"
                                : "linear-gradient(180deg, rgba(100,149,237,0.2), rgba(70,130,180,0.1))",
                            boxShadow: isHovered
                              ? "0 0 12px rgba(255,255,255,0.4)"
                              : isLit
                                ? "0 0 8px rgba(255,200,60,0.3)"
                                : "none",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        />
                      );
                    })}
                  </div>
                  {/* Balcony railing */}
                  <div
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: "3px",
                      background: isHovered
                        ? "rgba(255,140,66,0.6)"
                        : "rgba(255,255,255,0.06)",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Ground floor lobby */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-end justify-center"
            style={{ height: "34px" }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, rgba(30,30,30,0.9), rgba(20,20,20,1))",
                borderTop: "2px solid rgba(255,255,255,0.1)",
              }}
            >
              {/* Entrance doors */}
              <div className="flex justify-center gap-1 pt-2">
                <div
                  style={{
                    width: "14px",
                    height: "22px",
                    background: "linear-gradient(180deg, rgba(255,200,60,0.3), rgba(255,200,60,0.1))",
                    borderRadius: "8px 8px 0 0",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <div
                  style={{
                    width: "14px",
                    height: "22px",
                    background: "linear-gradient(180deg, rgba(255,200,60,0.3), rgba(255,200,60,0.1))",
                    borderRadius: "8px 8px 0 0",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Vertical structural lines */}
          <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: "6px 6px 0 0" }}>
            <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.05)" }} />
            <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.03)" }} />
          </div>
        </div>

        {/* ── Right face ── */}
        <div
          className="absolute top-0 transition-all duration-500 overflow-hidden"
          style={{
            width: `${depth}px`,
            height: `${height}px`,
            right: `-${depth / 2}px`,
            transform: `rotateY(90deg) translateZ(${depth / 2}px)`,
            borderRadius: "0 6px 0 0",
            background: isSelected
              ? "linear-gradient(180deg, #111827 0%, #0f1d30 50%, #0a1628 100%)"
              : "linear-gradient(180deg, #1e2d3d 0%, #253545 50%, #1e2d3d 100%)",
          }}
        >
          {/* Side windows */}
          <div className="flex flex-col-reverse px-1 pt-3" style={{ gap: "2px", height: `${height - 36}px` }}>
            {sortedHouses.map((house) => (
              <div key={house.id} className="flex justify-center gap-1" style={{ height: `${floorH - 2}px`, alignItems: "center" }}>
                {Array.from({ length: 2 }).map((_, w) => (
                  <div
                    key={w}
                    style={{
                      width: "14px",
                      height: `${floorH - 10}px`,
                      borderRadius: "1px",
                      background: (house.id + w) % 2 === 0
                        ? "rgba(255,200,60,0.35)"
                        : "rgba(100,149,237,0.1)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Top face ── */}
        <div
          className="absolute transition-all duration-500"
          style={{
            width: `${width}px`,
            height: `${depth}px`,
            top: `-${depth / 2}px`,
            left: "0",
            transform: `rotateX(90deg) translateZ(-${depth / 2}px)`,
            borderRadius: "4px",
            background: isSelected
              ? "linear-gradient(135deg, #334155, #475569)"
              : "linear-gradient(135deg, #3d4f5f, #4a5c6b)",
          }}
        >
          {/* Rooftop equipment */}
          <div className="absolute top-2 left-3 w-6 h-3 rounded-sm" style={{ background: "rgba(255,255,255,0.12)" }} />
          <div className="absolute top-2 right-3 w-4 h-4 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          {/* Antenna */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-4 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Ground reflection glow */}
        {isSelected && (
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2"
            style={{
              width: "160%",
              height: "16px",
              background: "radial-gradient(ellipse, rgba(255,92,0,0.35), transparent 70%)",
              filter: "blur(10px)",
              transform: `translateZ(${depth / 2 + 1}px)`,
            }}
          />
        )}
      </div>

      {/* Label */}
      <div className="mt-6 text-center">
        <p
          className={`text-sm font-bold transition-all duration-300 ${
            isSelected ? "text-orange-400" : "text-gray-500 group-hover/bld:text-orange-400"
          }`}
        >
          {building.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {building.houses.length} unit{building.houses.length !== 1 ? "s" : ""}
        </p>
        {isSelected && (
          <div className="mt-1.5 mx-auto w-8 h-0.5 rounded-full bg-orange-500" />
        )}
      </div>
    </div>
  );
}

/* ─── Unit Card ─── */
function UnitCard({
  house,
  isHovered,
  onHover,
  onLeave,
}: {
  house: House;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="relative rounded-xl transition-all duration-300 overflow-hidden"
      style={{
        background: isHovered
          ? "linear-gradient(135deg, #ff5c00, #ff8c42)"
          : "#fff",
        transform: isHovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
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
        <div className="flex gap-5 text-sm" style={{ color: isHovered ? "rgba(255,255,255,0.85)" : "#666" }}>
          <span>🛏 {house.nb_bedrooms} Bedrooms</span>
          <span>🚿 {house.nb_bathrooms} Bathrooms</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ProjectDetails() {
  const { projectID } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<number | null>(null);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      const { data, error: err } = await supabaseClient
        .from("projects")
        .select(
          "*, countries(name), buildings(id, name, houses(id, price, floor, nb_bedrooms, nb_bathrooms))"
        )
        .eq("id", projectID)
        .single();

      if (err || !data) {
        setError(true);
      } else {
        setProject(data as Project);
        // auto-select first building
        if ((data as Project).buildings.length > 0) {
          setSelectedBuilding((data as Project).buildings[0].id);
        }
      }
      setLoading(false);
    }
    fetchProject();
  }, [projectID]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-lg">Loading project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <p className="text-red-500 text-xl font-semibold mb-4">
          Project not found
        </p>
        <Link
          to="/projects"
          className="text-orange-500 hover:underline font-medium"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const totalUnits = project.buildings.reduce(
    (sum, b) => sum + b.houses.length,
    0
  );
  const activeBldg = project.buildings.find((b) => b.id === selectedBuilding);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/projects"
            className="text-orange-400 hover:text-orange-300 text-sm font-medium mb-6 inline-block"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            {project.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-300">
            <span>📍 {project.location}</span>
            <span>•</span>
            <span>{project.countries?.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-3xl font-extrabold text-orange-500">
              {project.buildings.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Buildings</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-3xl font-extrabold text-orange-500">
              {totalUnits}
            </p>
            <p className="text-gray-500 text-sm mt-1">Units</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-3xl font-extrabold text-orange-500">
              {project.countries?.name || "—"}
            </p>
            <p className="text-gray-500 text-sm mt-1">Country</p>
          </div>
        </div>

        {/* Gallery */}
        {project.images_url && project.images_url.length > 0 ? (
          <Gallery images={project.images_url} />
        ) : (
          <div className="h-64 bg-linear-to-br from-orange-400 to-orange-600 rounded-2xl shadow-lg mb-10 flex items-center justify-center">
            <span className="text-white/20 text-9xl font-black">
              {project.name[0]}
            </span>
          </div>
        )}

        {/* Description */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-10">
          <h2 className="text-xl font-bold mb-4">About this Project</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {project.description}
          </p>
        </div>

        {/* 3D Buildings Section */}
        {project.buildings.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold mb-2">Buildings & Units</h2>
            <p className="text-gray-400 mb-8 text-sm">
              Click a building to explore its units
            </p>

            {/* 3D Building skyline */}
            <div
              className="rounded-2xl shadow-lg p-10 mb-8 overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(180deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
              }}
            >
              {/* Stars */}
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: `${Math.random() * 2 + 1}px`,
                      height: `${Math.random() * 2 + 1}px`,
                      top: `${Math.random() * 40}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.5 + 0.2,
                    }}
                  />
                ))}
              </div>

              <div className="relative flex items-end justify-center gap-12 min-h-80 pb-6">
                {project.buildings.map((building) => (
                  <Building3D
                    key={building.id}
                    building={building}
                    isSelected={selectedBuilding === building.id}
                    hoveredFloor={hoveredUnit}
                    onFloorHover={(id) => setHoveredUnit(id)}
                    onFloorLeave={() => setHoveredUnit(null)}
                    onClick={() => {
                      setSelectedBuilding(building.id);
                      setHoveredUnit(null);
                    }}
                  />
                ))}
              </div>
              {/* Ground */}
              <div
                className="relative h-1 rounded-full mx-4"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                }}
              />
              <p className="text-center text-xs text-gray-500 mt-3 relative">
                Click a building to explore its units
              </p>
            </div>

            {/* Units for selected building */}
            {activeBldg && (
              <div className="bg-white rounded-2xl shadow-md p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">{activeBldg.name}</h3>
                    <p className="text-sm text-gray-400">
                      {activeBldg.houses.length} unit
                      {activeBldg.houses.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>

                {activeBldg.houses.length === 0 ? (
                  <p className="text-gray-400">No units in this building.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activeBldg.houses
                      .sort((a, b) => b.floor - a.floor)
                      .map((house) => (
                        <UnitCard
                          key={house.id}
                          house={house}
                          isHovered={hoveredUnit === house.id}
                          onHover={() => setHoveredUnit(house.id)}
                          onLeave={() => setHoveredUnit(null)}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
