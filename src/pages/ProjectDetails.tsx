import { useMemo, useState, type SubmitEvent } from "react";
import { useParams, Link } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";
import { Suspense } from "react";
import { useBuildings } from "@/hooks/useBuildings";
import { useHouses } from "@/hooks/useHouses";
import { useProjects } from "@/hooks/useProjects";
import { useCountries } from "@/hooks/useCountries";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import ImageGallery from "@/components/Project Details Components/ImageGallery";
import UnitCard from "@/components/Project Details Components/UnitCard";
import LazyModelPreview from "@/components/Project Details Components/LazyModelPreview";
import { Loader } from "@/components/Project Details Components/Loader";
import Model from "@/components/Project Details Components/Model";
import SceneControls from "@/components/Project Details Components/SceneControls";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Building } from "@/types/building";
import type { House } from "@/types/house";
import type { Project } from "@/types/projects";
import type { PaymentFormData } from "@/types/form";
import type { Country } from "@/types/country";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { ValidatePayment } from "@/helpers/helpers";
import { useAuth } from "@/hooks/useAuth";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";

const MODELS = [
  "models/162_7.glb",
  "models/southern_district_police_station.glb",
  "models/simple_low_poly_abandoned_brick_building.glb",
  "models/modern_villa_apartment_house_home_building.glb",
  "models/modern_luxury_villa_house_building.glb",
  "models/modern_apartment_house_building_design.glb",
  "models/futuristic_building.glb",
  "models/amelinco_office_building.glb",
];

type BuildingWithHouses = Building & { houses: House[] };

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

function getProjectImageUrls(project: Project): string[] {
  const projectWithLegacyFields = project as Project & {
    images_url?: unknown;
    images?: unknown;
  };

  const fromImagesObjects =
    Array.isArray(project.images) && project.images.length > 0
      ? project.images
          .map((image) => {
            if (typeof image?.url === "string" && image.url.length > 0)
              return image.url;

            if (typeof image?.path === "string" && image.path.length > 0) {
              return supabaseClient.storage
                .from("projects_images")
                .getPublicUrl(image.path).data.publicUrl;
            }

            return "";
          })
          .filter((url): url is string => Boolean(url))
      : [];

  if (fromImagesObjects.length > 0) return fromImagesObjects;

  const fromLegacyImagesUrl = projectWithLegacyFields.images_url;
  if (Array.isArray(fromLegacyImagesUrl)) {
    return fromLegacyImagesUrl.filter(
      (url): url is string => typeof url === "string" && url.length > 0,
    );
  }

  const rawImages = projectWithLegacyFields.images;
  if (Array.isArray(rawImages)) {
    return rawImages
      .map((image) => {
        if (typeof image === "string") return image;
        if (typeof image !== "object" || image === null) return "";

        const imageRecord = image as { url?: unknown; path?: unknown };

        if (typeof imageRecord.url === "string" && imageRecord.url.length > 0)
          return imageRecord.url;

        if (
          typeof imageRecord.path === "string" &&
          imageRecord.path.length > 0
        ) {
          return supabaseClient.storage
            .from("projects_images")
            .getPublicUrl(imageRecord.path).data.publicUrl;
        }

        return "";
      })
      .filter((url): url is string => Boolean(url));
  }

  return [];
}

export default function ProjectDetails() {
  const { projectID } = useParams();

  const InitialValue: PaymentFormData = {
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
    email: "",
  };

  const [selectedBuilding, setSelectedBuilding] = useState<
    Building["id"] | null
  >(null);

  const [hoveredUnit, setHoveredUnit] = useState<House["id"] | null>(null);

  const [showPayment, setShowPayment] = useState<boolean>(false);

  const [paymentHouse, setPaymentHouse] = useState<House | null>(null);

  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const [paymentError, setPaymentError] = useState<string>("");

  const [paymentForm, setPaymentForm] = useState<PaymentFormData>(InitialValue);

  const { Session, Loading: AuthLoading, Error: AuthError } = useAuth();

  const {
    Countries,
    Loading: CountriesLoading,
    Error: CountriesError,
  } = useCountries();

  const {
    Projects,
    Loading: ProjectsLoading,
    Error: ProjectsError,
  } = useProjects();

  const {
    Buildings,
    Loading: BuildingsLoading,
    Error: BuildingsError,
  } = useBuildings();

  const {
    Houses,
    Loading: HousesLoading,
    Error: HousesError,
    UpdateHouse,
  } = useHouses();

  const loading =
    CountriesLoading ||
    ProjectsLoading ||
    BuildingsLoading ||
    HousesLoading ||
    AuthLoading;

  const error =
    CountriesError ||
    ProjectsError ||
    BuildingsError ||
    HousesError ||
    AuthError;

  const countries = Countries as Country[];

  const projectIdAsNumber = Number(projectID);

  const project = useMemo(
    () =>
      Projects.find(
        (item): item is Project & { id: number } =>
          typeof item.id === "number" && item.id === projectIdAsNumber,
      ) || null,
    [Projects, projectIdAsNumber],
  );

  useDocumentTitle(project?.name || "Project Details");

  const countryById = useMemo(
    () =>
      new Map<number, Country>(
        countries
          .filter(
            (country): country is Country & { id: number } =>
              typeof country.id === "number",
          )
          .map((country) => [country.id, country]),
      ),
    [countries],
  );

  const housesByBuildingId = useMemo(() => {
    const map = new Map<number, House[]>();

    Houses.forEach((house) => {
      if (
        typeof house.id !== "number" ||
        typeof house.building_id !== "number"
      ) {
        return;
      }

      const typedHouse: House = {
        ...house,
        id: house.id,
        building_id: house.building_id,
      };

      const existing = map.get(house.building_id);
      if (existing) {
        existing.push(typedHouse);
      } else {
        map.set(house.building_id, [typedHouse]);
      }
    });

    return map;
  }, [Houses]);

  const projectBuildings = useMemo<BuildingWithHouses[]>(() => {
    if (!project || typeof project.id !== "number") return [];

    return Buildings.filter(
      (building): building is Building & { id: number; project_id: number } =>
        typeof building.id === "number" &&
        typeof building.project_id === "number" &&
        building.project_id === project.id,
    ).map((building) => ({
      ...building,
      id: building.id,
      houses: housesByBuildingId.get(building.id) ?? [],
    }));
  }, [Buildings, housesByBuildingId, project]);

  const projectImages = useMemo(
    () => (project ? getProjectImageUrls(project) : []),
    [project],
  );

  const modelAssignments = useMemo(() => {
    return getUniqueModelAssignments(projectBuildings.length);
  }, [projectBuildings]);

  const isSingleBuildingProject = projectBuildings.length === 1;

  const LoginNotice = Session ? false : true;
  console.log("Login Notice: ", LoginNotice);

  if (loading) {
    return <LoadingCard message="Loading Project Details..." />;
  }

  if (error) {
    return (
      <ErrorCard
        message="We could not load Project Details. Please try again later."
        error={error}
      />
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen p-4 md:p-8">
        <Breadcrumbs name="Project Details" style="light" />
        <Card className="mx-auto max-w-3xl border border-[#c8b9a7] bg-white text-[#0f2f4f] shadow-lg">
          <CardHeader>
            <CardAction>
              <Link
                to="/projects"
                className="text-orange-500 hover:underline font-medium"
              >
                Back to Projects
              </Link>
            </CardAction>
            <CardTitle className="text-2xl text-[#0f2f4f]">Error</CardTitle>
            <CardDescription className="text-[#24507f]">
              Project not found. It may have been removed or the URL may be
              incorrect.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-[#173b67]">{error}</CardContent>
          <CardFooter className="bg-transparent">
            {new Date().toLocaleString()}
          </CardFooter>
        </Card>
      </main>
    );
  }

  const totalUnits = projectBuildings.reduce(
    (sum, b) => sum + b.houses.length,
    0,
  );

  const effectiveSelectedBuildingId =
    selectedBuilding &&
    projectBuildings.some((building) => building.id === selectedBuilding)
      ? selectedBuilding
      : (projectBuildings[0]?.id ?? null);

  const activeBldg = projectBuildings.find(
    (building) => building.id === effectiveSelectedBuildingId,
  );
  const countryName =
    typeof project.country_id === "number"
      ? countryById.get(project.country_id)?.name
      : undefined;

  function openPayment(house: House) {
    setPaymentHouse(house);
    setPaymentSuccess(false);
    setPaymentError("");
    setPaymentForm(InitialValue);
    setShowPayment(true);
  }

  function closePayment() {
    setShowPayment(false);
    setPaymentHouse(null);
    setPaymentSuccess(false);
    setPaymentError("");
  }

  async function handlePaymentSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = ValidatePayment(paymentForm, paymentHouse);
    if (message) return setPaymentError(message);

    const ok = await UpdateHouse({ is_sold: true }, paymentHouse!.id);

    if (!ok)
      return setPaymentError("Failed to Process Payment. Please try again.");

    setPaymentError("");
    setPaymentSuccess(true);
  }

  return (
    <div className="min-h-screen bg-[#e6e0d8]">
      {/* Hero */}
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <Breadcrumbs name={project.name} style="light" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            {project.name}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-300">
            <span>📍 {project.location}</span>
            <span>•</span>
            <span>{countryName || "Unknown"}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-8">
        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-3xl font-extrabold text-orange-500">
              {projectBuildings.length}
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
              {countryName || "—"}
            </p>
            <p className="text-gray-500 text-sm mt-1">Country</p>
          </div>
        </div>

        {/* Gallery */}
        {projectImages.length > 0 ? (
          <ImageGallery images={projectImages} />
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
        {projectBuildings.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl font-bold mb-2">Buildings & Units</h2>
            <p className="text-gray-400 mb-8 text-sm">
              Select a building to see its available units.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {projectBuildings.map((building) => (
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
                          LoginNotice={LoginNotice}
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
            {projectBuildings.map((building, index) => {
              const modelPath =
                modelAssignments[index] ?? MODELS[index % MODELS.length];
              return (
                <div key={building.id} className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {building.name}
                  </h3>
                  <LazyModelPreview
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
                  </LazyModelPreview>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showPayment && (
        <div
          className="fixed inset-0 z-9000 overflow-y-auto flex items-center justify-center bg-black/50 p-4"
          onMouseDown={closePayment}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] rounded-[2rem] bg-white shadow-2xl overflow-y-auto no-scrollbar"
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
