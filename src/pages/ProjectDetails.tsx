import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  useGLTF,
  useProgress,
  Center,
  Bounds,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import Breadcrumbs from "@/components/Breadcrumbs";

const MODELS = [
  "/models/162_7.glb",
  "/models/southern_district_police_station.glb",
  "/models/simple_low_poly_abandoned_brick_building.glb",
  "/models/modern_villa_apartment_house_home_building.glb",
  "/models/modern_luxury_villa_house_building.glb",
  "/models/modern_apartment_house_building_design.glb",
  "/models/futuristic_building.glb",
  "/models/amelinco_office_building.glb",
];

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

function getUniqueModelAssignments(buildingsCount: number): string[] {
  if (buildingsCount === 0) return [];

  const totalModels = MODELS.length;
  const assignments: string[] = [];

  if (buildingsCount === totalModels) {
    // Unique one-to-one assignment when model count matches buildings count.
    return [...MODELS];
  }

  if (buildingsCount < totalModels) {
    // Use a random subset so single-building projects don't always show the first model.
    const shuffled = [...MODELS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, buildingsCount);
  }

  // More buildings than models: distribute models randomly but keep them balanced.
  for (let i = 0; i < buildingsCount; i += 1) {
    assignments.push(MODELS[i % totalModels]);
  }

  return assignments.sort(() => Math.random() - 0.5);
}

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

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          padding: "12px 18px",
          background: "rgba(255,255,255,0.96)",
          border: "1px solid #dbe3ea",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
          fontSize: "14px",
          fontWeight: 600,
          color: "#1e293b",
          whiteSpace: "nowrap",
        }}
      >
        Loading model... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

function Model({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
  return (
    <Bounds fit clip observe margin={1.15}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  );
}

function SceneControls() {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={25}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 1.8}
    />
  );
}

/* ─── Unit Card ─── */
function UnitCard({
  house,
  isHovered,
  onHover,
  onLeave,
  onBuy,
}: {
  house: House;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onBuy: () => void;
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

/* ─── Main Component ─── */
export default function ProjectDetails() {
  const { projectID } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [hoveredUnit, setHoveredUnit] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentHouse, setPaymentHouse] = useState<House | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    email: "",
  });

  const modelAssignments = useMemo(() => {
    if (!project) return [];
    return getUniqueModelAssignments(project.buildings.length);
  }, [project]);

  const isSingleBuildingProject = project?.buildings.length === 1;

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      const { data, error: err } = await supabaseClient
        .from("projects")
        .select(
          "*, countries(name), buildings(id, name, houses(id, price, floor, nb_bedrooms, nb_bathrooms))",
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
    0,
  );
  const activeBldg = project.buildings.find((b) => b.id === selectedBuilding);

  function openPayment(house: House) {
    setPaymentHouse(house);
    setPaymentSuccess(false);
    setPaymentError("");
    setPaymentForm({
      cardName: "",
      cardNumber: "",
      expiry: "",
      cvc: "",
      email: "",
    });
    setShowPayment(true);
  }

  function closePayment() {
    setShowPayment(false);
    setPaymentHouse(null);
    setPaymentSuccess(false);
    setPaymentError("");
  }

  function handlePaymentSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const { cardName, cardNumber, expiry, cvc, email } = paymentForm;
    if (!cardName || !cardNumber || !expiry || !cvc || !email) {
      setPaymentError("Please fill in all fields to complete the payment.");
      return;
    }

    const normalizedNumber = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(normalizedNumber)) {
      setPaymentError("Enter a valid 16-digit card number.");
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setPaymentError("Expiry must be in MM/YY format.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      setPaymentError("Enter a valid CVC code.");
      return;
    }

    setPaymentError("");
    setPaymentSuccess(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20 px-6">
        <Breadcrumbs name={project.name} />
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

        {/* Buildings & Units */}
        {project.buildings.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold mb-2">Buildings & Units</h2>
            <p className="text-gray-400 mb-8 text-sm">
              Select a building to see its available units.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {project.buildings.map((building) => (
                <button
                  key={building.id}
                  type="button"
                  onClick={() => {
                    setSelectedBuilding(building.id);
                    setHoveredUnit(null);
                  }}
                  className={`rounded-3xl border p-6 text-left transition-all duration-200 ${
                    selectedBuilding === building.id
                      ? "border-orange-400 bg-orange-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-orange-200"
                  }`}
                >
                  <p className="text-lg font-semibold text-slate-900">
                    {building.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {building.houses.length} unit
                    {building.houses.length !== 1 ? "s" : ""} available
                  </p>
                </button>
              ))}
            </div>

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
                          onBuy={() => openPayment(house)}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-20">
          <h2 className="text-2xl font-bold mb-4">Project 3D Previews</h2>
          <div
            className={`grid gap-6 ${isSingleBuildingProject ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}
          >
            {project.buildings.map((building, index) => {
              const modelPath =
                modelAssignments[index] ?? MODELS[index % MODELS.length];
              return (
                <div key={building.id} className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {building.name}
                  </h3>
                  <div
                    className={`relative overflow-hidden rounded-2xl ${isSingleBuildingProject ? "h-175" : "h-64"}`}
                  >
                    <Canvas camera={{ position: [0, 1.8, 7], fov: 42 }} shadows>
                      <color attach="background" args={["#f8fbfd"]} />
                      <ambientLight intensity={0.8} />
                      <spotLight
                        position={[10, 10, 10]}
                        angle={0.15}
                        penumbra={1}
                        intensity={1}
                        castShadow
                      />

                      <Suspense fallback={<Loader />}>
                        <Environment preset="city" />
                        <Model modelPath={modelPath} />
                        <ContactShadows
                          position={[0, -1, 0]}
                          opacity={0.4}
                          scale={20}
                          blur={2.5}
                          far={4.5}
                        />
                      </Suspense>

                      <SceneControls />
                    </Canvas>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showPayment && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/50 p-4"
          onMouseDown={closePayment}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] rounded-[2rem] bg-white shadow-2xl overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 bg-orange-500 px-6 py-5 text-white">
              <div>
                <h2 className="text-2xl font-bold">Complete purchase</h2>
                <p className="mt-2 text-sm text-orange-100">
                  Fill the card details to confirm your purchase.
                </p>
              </div>
              <button
                type="button"
                onClick={closePayment}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="space-y-4">
                  <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Selected</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {paymentHouse
                        ? `Unit #${paymentHouse.id} - $${paymentHouse.price.toLocaleString()}`
                        : "No unit selected"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {paymentHouse
                        ? `${paymentHouse.nb_bedrooms} bedrooms • ${paymentHouse.nb_bathrooms} bathrooms`
                        : "Select a unit to start."}
                    </p>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Cardholder name
                      </label>
                      <input
                        value={paymentForm.cardName}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            cardName: e.target.value,
                          })
                        }
                        className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Card number
                      </label>
                      <input
                        value={paymentForm.cardNumber}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            cardNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                        placeholder="1234 5678 9012 3456"
                        inputMode="numeric"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Expiry
                        </label>
                        <input
                          value={paymentForm.expiry}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              expiry: e.target.value,
                            })
                          }
                          className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          CVC
                        </label>
                        <input
                          value={paymentForm.cvc}
                          onChange={(e) =>
                            setPaymentForm({
                              ...paymentForm,
                              cvc: e.target.value,
                            })
                          }
                          className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                          placeholder="123"
                          inputMode="numeric"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        value={paymentForm.email}
                        onChange={(e) =>
                          setPaymentForm({
                            ...paymentForm,
                            email: e.target.value,
                          })
                        }
                        className="w-full rounded-3xl border border-slate-200 bg-white p-4 text-sm shadow-sm"
                        placeholder="you@example.com"
                        type="email"
                      />
                    </div>

                    {paymentError && (
                      <p className="text-sm text-red-500">{paymentError}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full rounded-3xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition"
                    >
                      Pay now
                    </button>
                  </form>
                </div>

                <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Payment summary
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-3xl bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Unit</p>
                      <p className="mt-2 text-lg font-semibold">
                        {paymentHouse ? `#${paymentHouse.id}` : "-"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Price</p>
                      <p className="mt-2 text-lg font-semibold">
                        {paymentHouse
                          ? `$${paymentHouse.price.toLocaleString()}`
                          : "-"}
                      </p>
                    </div>
                    <div className="rounded-3xl bg-slate-900 p-4">
                      <p className="text-sm text-slate-400">Total</p>
                      <p className="mt-2 text-lg font-semibold">
                        {paymentHouse
                          ? `$${paymentHouse.price.toLocaleString()}`
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {paymentSuccess && (
                    <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-emerald-900 shadow-inner">
                      <p className="text-sm uppercase tracking-[0.2em] text-emerald-600">
                        Success
                      </p>
                      <p className="mt-2 text-base font-semibold">
                        Payment completed successfully.
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        Your purchase is confirmed. Our team will contact you
                        shortly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

MODELS.forEach((model) => useGLTF.preload(model));
