import { useMemo, useState, type SubmitEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useBuildings } from "@/hooks/useBuildings";
import { useProjects } from "@/hooks/useProjects";
import { useHouses } from "@/hooks/useHouses";
import { useCountries } from "@/hooks/useCountries";
import ImageGallery from "@/components/ImageGallery";
import { supabaseClient } from "@/lib/supabaseClient";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project, Recommendation } from "@/types/projects";
import type { Building } from "@/types/building";
import type { House } from "@/types/house";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { SurveyForm } from "@/types/form";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";

const countryFlags: Record<string, string> = {
  Egypt: "eg",
  "United Arab Emirates": "ae",
  "United Kingdom": "gb",
  "Saudi Arabia": "sa",
  Turkey: "tr",
  Oman: "om",
  Bahrain: "bh",
  Qatar: "qa",
};

const cardGradients = [
  "from-orange-400 to-rose-500",
  "from-blue-500 to-indigo-600",
  "from-emerald-400 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-amber-400 to-orange-500",
  "from-cyan-400 to-blue-500",
  "from-pink-400 to-rose-500",
  "from-lime-400 to-emerald-500",
];

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

function scoreCandidate(candidate: Recommendation, form: SurveyForm) {
  let score = 0;
  const price = candidate.house.price ?? 0;
  const projectText =
    `${candidate.project.name} ${candidate.project.description} ${candidate.project.location}`.toLowerCase();
  const locationHint = form.location.trim().toLowerCase();
  const areaType = form.areaType.toLowerCase();
  const priority = form.priority.toLowerCase();
  const bedrooms = Number(form.bedrooms);

  if (form.budgetRange === "low") {
    if (price <= 200000) score += 5;
    else if (price <= 400000) score += 2;
  } else if (form.budgetRange === "mid") {
    if (price >= 200000 && price <= 800000) score += 5;
    else if (price >= 150000 && price <= 900000) score += 2;
  } else if (form.budgetRange === "high") {
    if (price >= 800000) score += 5;
    else if (price >= 600000) score += 2;
  } else {
    score += 1;
  }

  if (
    form.countryId &&
    Number(form.countryId) === candidate.project.country_id
  ) {
    score += 4;
  }

  if (locationHint) {
    if (candidate.project.location.toLowerCase().includes(locationHint))
      score += 4;
    if (candidate.project.description.toLowerCase().includes(locationHint))
      score += 2;
  }

  if (areaType === "calm") {
    if (
      projectText.match(
        /calm|quiet|resort|retreat|green|garden|peaceful|private/,
      )
    )
      score += 4;
    if (projectText.match(/city|downtown|bustle|busy|center/)) score -= 1;
  } else if (areaType === "busy") {
    if (
      projectText.match(/city|downtown|bustle|busy|center|urban|metropolitan/)
    )
      score += 4;
    if (projectText.match(/quiet|calm|peaceful|resort|private/)) score -= 1;
  }

  if (priority === "family") {
    if (projectText.match(/family|community|garden|school|park/)) score += 3;
  } else if (priority === "luxury") {
    if (projectText.match(/luxury|exclusive|premium|five-star|high-end/))
      score += 3;
  } else if (priority === "investment") {
    if (projectText.match(/investment|value|return|growth|rental|development/))
      score += 3;
  } else if (priority === "beachfront") {
    if (projectText.match(/beach|sea|waterfront|coast/)) score += 3;
  }

  if (bedrooms > 0 && candidate.house.nb_bedrooms != null) {
    if (candidate.house.nb_bedrooms === bedrooms) score += 4;
    else if (bedrooms >= 4 && candidate.house.nb_bedrooms >= 4) score += 2;
  }

  if (candidate.house.nb_bedrooms != null && candidate.house.nb_bedrooms >= 3) {
    score += 1;
  }

  return score;
}

export default function Projects() {
  useDocumentTitle("Projects");

  const [searchParams, setSearchParams] = useSearchParams();
  const [showSurvey, setShowSurvey] = useState(false);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [recommendationText, setRecommendationText] = useState(
    "Answer the questions to get the closest match in the selected country.",
  );
  const [form, setForm] = useState<SurveyForm>({
    budgetRange: "any",
    countryId: "",
    areaType: "calm",
    location: "",
    priority: "City living",
    bedrooms: "",
  });

  const {
    Countries,
    Loading: CountriesLoading,
    Error: CountriesError,
  } = useCountries();
  const {
    Projects: AllProjects,
    Loading: ProjectsLoading,
    Error: ProjectsError,
  } = useProjects();
  const {
    Buildings,
    Loading: BuildingsLoading,
    Error: BuildingsError,
  } = useBuildings();
  const { Houses, Loading: HousesLoading, Error: HousesError } = useHouses();

  const loading =
    CountriesLoading || ProjectsLoading || BuildingsLoading || HousesLoading;
  const error =
    CountriesError || ProjectsError || BuildingsError || HousesError;

  const countries = Countries;

  const selectedCountry = searchParams.get("country");
  const activeCountryId = form.countryId || selectedCountry || "";

  const projects = useMemo(
    () =>
      AllProjects.filter(
        (project): project is Project & { id: number } =>
          typeof project.id === "number" &&
          (!selectedCountry || String(project.country_id) === selectedCountry),
      ),
    [AllProjects, selectedCountry],
  );

  const projectImagesById = useMemo(() => {
    const map = new Map<number, string[]>();

    projects.forEach((project) => {
      map.set(project.id, getProjectImageUrls(project));
    });

    return map;
  }, [projects]);

  const countryById = useMemo(
    () => new Map(countries.map((country) => [country.id, country])),
    [countries],
  );

  const housesByBuildingId = useMemo(() => {
    const map = new Map<number, House[]>();

    Houses.forEach((house) => {
      if (typeof house.building_id !== "number") return;
      const existing = map.get(house.building_id);
      if (existing) {
        existing.push(house);
      } else {
        map.set(house.building_id, [house]);
      }
    });

    return map;
  }, [Houses]);

  const buildingsByProjectId = useMemo(() => {
    const map = new Map<number, Building[]>();

    Buildings.forEach((building) => {
      if (typeof building.project_id !== "number") return;
      const existing = map.get(building.project_id);
      if (existing) {
        existing.push(building);
      } else {
        map.set(building.project_id, [building]);
      }
    });

    return map;
  }, [Buildings]);

  const projectPriceRanges = useMemo(() => {
    const map = new Map<number, { min: number; max: number }>();

    projects.forEach((project) => {
      const projectBuildings = buildingsByProjectId.get(project.id) ?? [];
      const prices = projectBuildings.flatMap(
        (building) =>
          housesByBuildingId
            .get((building.id as number) ?? -1)
            ?.map((house) => house.price)
            .filter((price): price is number => typeof price === "number") ??
          [],
      );

      if (prices.length === 0) {
        map.set(project.id, { min: 0, max: 0 });
        return;
      }

      map.set(project.id, {
        min: Math.min(...prices),
        max: Math.max(...prices),
      });
    });

    return map;
  }, [projects, buildingsByProjectId, housesByBuildingId]);

  function getPriceRange(projectId: number) {
    return projectPriceRanges.get(projectId) ?? { min: 0, max: 0 };
  }

  const allVisiblePrices = useMemo(
    () =>
      Array.from(projectPriceRanges.values()).flatMap((range) =>
        range.min > 0 && range.max > 0 ? [range.min, range.max] : [],
      ),
    [projectPriceRanges],
  );

  const overallPrices = useMemo(() => {
    return {
      min: allVisiblePrices.length ? Math.min(...allVisiblePrices) : 0,
      max: allVisiblePrices.length ? Math.max(...allVisiblePrices) : 0,
    };
  }, [allVisiblePrices]);

  const recommendationCandidates = useMemo(() => {
    return AllProjects.flatMap((project) => {
      if (typeof project.id !== "number") return [];
      const projectBuildings = buildingsByProjectId.get(project.id) ?? [];

      return projectBuildings.flatMap((building) => {
        if (typeof building.id !== "number") return [];
        const buildingHouses = housesByBuildingId.get(building.id) ?? [];

        return buildingHouses.map((house) => ({ project, building, house }));
      });
    });
  }, [AllProjects, buildingsByProjectId, housesByBuildingId]);

  function handleFilter(countryId: string | null) {
    if (countryId) {
      setSearchParams({ country: countryId });
    } else {
      setSearchParams({});
    }
  }

  function openSurvey() {
    setRecommendation(null);
    setRecommendationText(
      "Answer the questions to get the closest match in the selected country.",
    );
    setForm((prev) => ({
      ...prev,
      budgetRange: "any",
      countryId: selectedCountry || prev.countryId || "",
      areaType: "calm",
      location: "",
      priority: "City living",
      bedrooms: "",
    }));
    setShowSurvey(true);
  }

  function closeSurvey() {
    setShowSurvey(false);
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validCandidates = recommendationCandidates.filter((candidate) => {
      return (
        !activeCountryId ||
        Number(activeCountryId) === candidate.project.country_id
      );
    });

    if (activeCountryId && validCandidates.length === 0) {
      setRecommendation(null);
      setRecommendationText(
        "No project is available in the selected country with these criteria. Please choose another country or broaden your search.",
      );
      return;
    }

    const best = validCandidates.reduce<Recommendation | null>(
      (bestSoFar, candidate) => {
        if (!bestSoFar) return candidate;
        return scoreCandidate(candidate, form) > scoreCandidate(bestSoFar, form)
          ? candidate
          : bestSoFar;
      },
      null,
    );

    if (best) {
      setRecommendation(best);
      setRecommendationText(
        `Based on your preferences, ${best.project.name} is the closest match in the selected country. The best building is ${best.building.name} with a unit at $${best.house.price.toLocaleString()}.`,
      );
    } else {
      setRecommendation(null);
      setRecommendationText(
        "We couldn't find a suitable project with these answers. Please adjust your budget, country, or area preference.",
      );
    }
  }

  return (
    <div className="bg-[#e6e0d8]">
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20 px-6">
        <Breadcrumbs style="light" />
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Our Projects
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Explore our developments across the globe and get a quick
            personalized recommendation.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
          <div className="rounded-3xl bg-white p-5 shadow-lg">
            <h2 className="text-xl font-semibold text-slate-900">
              Need a recommendation?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Open the survey and get the best building match based on budget,
              country, area type and location.
            </p>
          </div>
          <button
            type="button"
            onClick={openSurvey}
            className="inline-flex items-center justify-center rounded-3xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition cursor-pointer"
          >
            Open recommendation survey
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => handleFilter(null)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition cursor-pointer ${
              !selectedCountry
                ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {countries.map((c) => (
            <button
              key={c.id}
              onClick={() => handleFilter(String(c.id))}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                selectedCountry === String(c.id)
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <img
                src={`https://flagcdn.com/w40/${countryFlags[c.name] || "xx"}.png`}
                alt={c.name}
                className="w-5 h-4 object-cover rounded-sm"
              />
              {c.name}
            </button>
          ))}
        </div>

        {error && (
          <ErrorCard
            message="We could not load the projects. Please try again later."
            error={error}
          />
        )}

        {loading ? (
          <LoadingCard message="Loading Projects..." />
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {projects.map((project, i) => {
              const projectImages = projectImagesById.get(project.id) ?? [];

              return (
                <Link
                  to={`/projects/${project.id}`}
                  key={project.id}
                  className="group text-left bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {projectImages.length > 0 ? (
                    <ImageGallery images={projectImages} />
                  ) : (
                    <div
                      className={`h-48 bg-linear-to-br ${cardGradients[i % cardGradients.length]} flex items-center justify-center relative`}
                    >
                      <span className="text-white/20 text-8xl font-black">
                        {project.name[0]}
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      {countryById.get(project.country_id) &&
                        countryFlags[
                          countryById.get(project.country_id)?.name || ""
                        ] && (
                          <img
                            src={`https://flagcdn.com/w40/${countryFlags[countryById.get(project.country_id)?.name || ""]}.png`}
                            alt=""
                            className="w-5 h-4 object-cover rounded-sm"
                          />
                        )}
                      <span className="text-xs text-gray-400">
                        {countryById.get(project.country_id)?.name || "Unknown"}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold mb-2 group-hover:text-orange-500 transition">
                      {project.name}
                    </h2>
                    <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>📍 {project.location}</span>
                      <span>
                        {getPriceRange(project.id).min > 0
                          ? `$${getPriceRange(project.id).min.toLocaleString()} - $${getPriceRange(project.id).max.toLocaleString()}`
                          : "Price available"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showSurvey && (
        <Card
          className="fixed inset-0 z-9000 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={closeSurvey}
        >
          <Card
            className="min-w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[#e6e0d8] shadow-2xl no-scrollbar p-0!"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex items-center justify-between flex-wrap gap-4 bg-orange-500 px-6 py-5 text-white">
              <div>
                <CardTitle className="text-[27px] font-bold">
                  Find your perfect building
                </CardTitle>
                <CardDescription className="mt-2 text-sm text-orange-100">
                  Answer a few quick questions and we'll recommend the best
                  building from our current projects.
                </CardDescription>
              </div>
              <CardAction>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeSurvey}
                  className="rounded-full border border-white/20 bg-white/10 p-5 text-sm font-semibold text-white transition hover:bg-white/20 cursor-pointer"
                >
                  Close
                </Button>
              </CardAction>
            </CardHeader>

            <CardContent className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 p-6">
              <Card className="p-5 bg-transparent ring-0!">
                <CardHeader className="rounded-3xl bg-slate-50 p-6 shadow-sm mb-6">
                  <CardTitle className="text-sm text-gray-500 mb-2">
                    Available price range
                  </CardTitle>
                  <CardDescription className="text-2xl font-semibold text-slate-900">
                    {overallPrices.min
                      ? `$${overallPrices.min.toLocaleString()}`
                      : "N/A"}{" "}
                    -{" "}
                    {overallPrices.max
                      ? `$${overallPrices.max.toLocaleString()}`
                      : "N/A"}
                  </CardDescription>
                  <CardFooter className="text-sm text-gray-500 mt-3 bg-transparent border-t-0! p-0!">
                    This survey uses existing prices from our projects database.
                  </CardFooter>
                </CardHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <Field>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      What price is in mind?
                    </Label>
                    <Select
                      value={form.budgetRange}
                      onValueChange={(value) => {
                        console.log(value);

                        setForm({ ...form, budgetRange: value });
                      }}
                    >
                      <SelectTrigger className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-sm shadow-sm cursor-pointer">
                        <SelectValue placeholder="Select Your Budget" />
                      </SelectTrigger>
                      <SelectContent className="z-9001">
                        <SelectGroup>
                          <SelectLabel>Select Your Budget</SelectLabel>
                          <SelectItem value="any">Any budget</SelectItem>
                          <SelectItem value="low">Up to 200K</SelectItem>
                          <SelectItem value="mid">200K - 800K</SelectItem>
                          <SelectItem value="high">800K+</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      Which country do you prefer?
                    </Label>
                    <Select
                      value={form.countryId}
                      onValueChange={(value) =>
                        setForm({ ...form, countryId: value })
                      }
                    >
                      <SelectTrigger className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-sm shadow-sm cursor-pointer">
                        <SelectValue placeholder="Select Your Country" />
                      </SelectTrigger>
                      <SelectContent className="z-9001">
                        <SelectGroup>
                          <SelectLabel>Select Your Country</SelectLabel>
                          {countries.map((country) => (
                            <SelectItem
                              key={country.id}
                              value={String(country.id!)}
                            >
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      Do you prefer a calm or busy area?
                    </Label>
                    <Select
                      value={form.areaType}
                      onValueChange={(value) =>
                        setForm({ ...form, areaType: value })
                      }
                    >
                      <SelectTrigger className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-sm shadow-sm cursor-pointer">
                        <SelectValue placeholder="Calm or Busy?" />
                      </SelectTrigger>
                      <SelectContent className="z-9001">
                        <SelectGroup>
                          <SelectLabel> Calm or Busy?</SelectLabel>
                          <SelectItem value="calm">Calm area</SelectItem>
                          <SelectItem value="busy">Busy area</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      What location do you have in mind?
                    </Label>
                    <Input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="e.g. city center, beach, quiet neighborhood"
                      className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-sm shadow-sm"
                    />
                  </Field>

                  <Field>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      What matters most?
                    </Label>
                    <Select
                      value={form.priority}
                      onValueChange={(value) =>
                        setForm({ ...form, priority: value })
                      }
                    >
                      <SelectTrigger className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-sm shadow-sm cursor-pointer">
                        <SelectValue placeholder="What Matters Most?" />
                      </SelectTrigger>
                      <SelectContent className="z-9001">
                        <SelectGroup>
                          <SelectLabel>What Matters Most?</SelectLabel>
                          <SelectItem value="City living">
                            City living
                          </SelectItem>
                          <SelectItem value="Beachfront">Beachfront</SelectItem>
                          <SelectItem value="Family">
                            Family friendly
                          </SelectItem>
                          <SelectItem value="Luxury">
                            Luxury experience
                          </SelectItem>
                          <SelectItem value="Investment">
                            Investment potential
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <Label className="block text-sm font-semibold text-slate-700 mb-2">
                      How many bedrooms do you prefer?
                    </Label>
                    <Select
                      value={form.bedrooms}
                      onValueChange={(value) =>
                        setForm({ ...form, bedrooms: value })
                      }
                    >
                      <SelectTrigger className="w-full rounded-3xl border border-slate-200 bg-white p-5 text-sm shadow-sm cursor-pointer">
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent className="z-9001">
                        <SelectGroup>
                          <SelectLabel>Preferences</SelectLabel>
                          <SelectItem value="1">1 bedroom</SelectItem>
                          <SelectItem value="2">2 bedrooms</SelectItem>
                          <SelectItem value="3">3 bedrooms</SelectItem>
                          <SelectItem value="4">4+ bedrooms</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full rounded-3xl bg-orange-500 p-5 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition cursor-pointer"
                    >
                      Get recommendation
                    </Button>
                  </Field>
                </form>
              </Card>

              <Card className="rounded-3xl bg-slate-950 p-5 text-white shadow-sm">
                <CardHeader className="mb-6">
                  <CardTitle className="text-xl font-semibold">
                    Your current preferences
                  </CardTitle>
                  <CardDescription className="text-slate-300 mt-2">
                    Country:
                    {activeCountryId
                      ? countries.find(
                          (item) => String(item.id) === activeCountryId,
                        )?.name
                      : "Any"}
                    <p className="text-slate-300 mt-1">
                      Location: {form.location || "Any"}
                    </p>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Card className="rounded-3xl bg-slate-900 p-4">
                    <CardHeader className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      <CardTitle>Budget range</CardTitle>
                      <CardDescription className="mt-2 text-lg font-semibold text-slate-100">
                        {form.budgetRange}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="rounded-3xl bg-slate-900 p-4">
                    <CardHeader className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      <CardTitle>Area type</CardTitle>
                      <CardDescription className="mt-2 text-lg font-semibold text-slate-100">
                        {form.areaType}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="rounded-3xl bg-slate-900 p-4">
                    <CardHeader className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      <CardTitle>Preference</CardTitle>
                      <CardDescription className="mt-2 text-lg font-semibold text-slate-100">
                        {form.priority}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </CardContent>

                <Card className="mt-8 rounded-3xl bg-white p-5 text-slate-900 shadow-lg">
                  <CardHeader className="text-sm uppercase tracking-[0.2em] text-orange-500">
                    <CardTitle>Recommendation</CardTitle>
                  </CardHeader>
                  <CardDescription className="text-sm! text-slate-600!">
                    {recommendationText}
                  </CardDescription>
                  <CardContent>
                    {recommendation && (
                      <Card className="mt-5 rounded-3xl bg-orange-50 p-4 text-slate-900">
                        <CardHeader className="text-sm uppercase tracking-[0.2em] text-orange-500">
                          <CardTitle>Best building</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Card className="p-3 bg-transparent ring-0! ">
                            <CardHeader className="mt-2 text-xl font-bold">
                              {recommendation.building.name}
                            </CardHeader>
                            <CardContent>
                              <p className="mt-2 text-sm text-slate-700">
                                Project: {recommendation.project.name}
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                Price: $
                                {recommendation.house.price.toLocaleString()}
                              </p>
                              <p className="mt-1 text-sm text-slate-700">
                                Bedrooms:{" "}
                                {recommendation.house.nb_bedrooms ?? "N/A"}
                              </p>
                              <Link
                                to={`/projects/${recommendation.project.id}`}
                                onClick={closeSurvey}
                                className="inline-flex mt-4 items-center rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
                              >
                                View project details
                              </Link>
                            </CardContent>
                          </Card>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </Card>
            </CardContent>
          </Card>
        </Card>
      )}
    </div>
  );
}
