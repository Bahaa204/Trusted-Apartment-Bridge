import { useEffect, useMemo, useState, type SubmitEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";
import Breadcrumbs from "@/components/Breadcrumbs";

type House = {
  price: number;
  floor?: number;
  nb_bedrooms?: number;
  nb_bathrooms?: number;
};

type Building = {
  id: number;
  name: string;
  houses?: House[];
};

type Project = {
  id: number;
  name: string;
  description: string;
  country_id: number;
  location: string;
  images_url: string[];
  countries: { name: string } | null;
  buildings?: Building[];
};

type Country = {
  id: number;
  name: string;
};

type SurveyForm = {
  budgetRange: string;
  countryId: string;
  areaType: string;
  location: string;
  priority: string;
  bedrooms: string;
};

type Recommendation = {
  project: Project;
  building: Building;
  house: House;
};

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

function ImageGallery({ images }: { images: string[] }) {
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

function getPriceRange(project: Project) {
  const prices = project.buildings?.flatMap(
    (building) => building.houses?.map((house) => house.price) ?? [],
  );
  const validPrices =
    prices?.filter((price) => typeof price === "number") ?? [];
  if (validPrices.length === 0) {
    return { min: 0, max: 0 };
  }
  return {
    min: Math.min(...validPrices),
    max: Math.max(...validPrices),
  };
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
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

  const selectedCountry = searchParams.get("country");
  const activeCountryId = form.countryId || selectedCountry || "";

  const overallPrices = useMemo(() => {
    const allPrices = projects.flatMap(
      (project) =>
        project.buildings?.flatMap(
          (building) => building.houses?.map((house) => house.price) ?? [],
        ) ?? [],
    );
    const validPrices = allPrices.filter((price) => typeof price === "number");
    return {
      min: validPrices.length ? Math.min(...validPrices) : 0,
      max: validPrices.length ? Math.max(...validPrices) : 0,
    };
  }, [projects]);

  useEffect(() => {
    async function fetchCountries() {
      const { data } = await supabaseClient.from("countries").select("*");
      if (data) setCountries(data);
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      let query = supabaseClient
        .from("projects")
        .select(
          "*, countries(name), buildings(id, name, houses(price, floor, nb_bedrooms, nb_bathrooms))",
        );

      if (selectedCountry) {
        query = query.eq("country_id", selectedCountry);
      }

      const { data } = await query;
      if (data) setProjects(data as Project[]);
      setLoading(false);
    }
    fetchProjects();
  }, [selectedCountry]);

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

    const candidates: Recommendation[] = projects.flatMap(
      (project) =>
        project.buildings?.flatMap(
          (building) =>
            building.houses?.map((house) => ({ project, building, house })) ??
            [],
        ) ?? [],
    );

    const validCandidates = candidates.filter((candidate) => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20 px-6">
        <Breadcrumbs />
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
            className="inline-flex items-center justify-center rounded-3xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition"
          >
            Open recommendation survey
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => handleFilter(null)}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition ${
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
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
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

        {loading ? (
          <p className="text-center text-gray-400 py-20">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {projects.map((project, i) => (
              <Link
                to={`/projects/${project.id}`}
                key={project.id}
                className="group text-left bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {project.images_url && project.images_url.length > 0 ? (
                  <ImageGallery images={project.images_url} />
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
                    {project.countries &&
                      countryFlags[project.countries.name] && (
                        <img
                          src={`https://flagcdn.com/w40/${countryFlags[project.countries.name]}.png`}
                          alt=""
                          className="w-5 h-4 object-cover rounded-sm"
                        />
                      )}
                    <span className="text-xs text-gray-400">
                      {project.countries?.name}
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
                      {getPriceRange(project).min > 0
                        ? `$${getPriceRange(project).min.toLocaleString()} - $${getPriceRange(project).max.toLocaleString()}`
                        : "Price available"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showSurvey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={closeSurvey}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-[#e6e0d8] shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 bg-orange-500 px-6 py-5 text-white">
              <div>
                <h2 className="text-2xl font-bold">
                  Find your perfect building
                </h2>
                <p className="mt-2 text-sm text-orange-100">
                  Answer a few quick questions and we'll recommend the best
                  building from our current projects.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSurvey}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-6 p-6">
              <div>
                <div className="rounded-3xl bg-slate-50 p-6 shadow-sm mb-6">
                  <p className="text-sm text-gray-500 mb-2">
                    Available price range
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {overallPrices.min
                      ? `$${overallPrices.min.toLocaleString()}`
                      : "N/A"}{" "}
                    -{" "}
                    {overallPrices.max
                      ? `$${overallPrices.max.toLocaleString()}`
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 mt-3">
                    This survey uses existing prices from our projects database.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      What price is in mind?
                    </label>
                    <select
                      value={form.budgetRange}
                      onChange={(e) =>
                        setForm({ ...form, budgetRange: e.target.value })
                      }
                      className="w-full rounded-3xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <option value="any">Any budget</option>
                      <option value="low">Up to 200K</option>
                      <option value="mid">200K - 800K</option>
                      <option value="high">800K+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Which country do you prefer?
                    </label>
                    <select
                      value={form.countryId}
                      onChange={(e) =>
                        setForm({ ...form, countryId: e.target.value })
                      }
                      className="w-full rounded-3xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <option value="">Same country or any</option>
                      {countries.map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Do you prefer a calm or busy area?
                    </label>
                    <select
                      value={form.areaType}
                      onChange={(e) =>
                        setForm({ ...form, areaType: e.target.value })
                      }
                      className="w-full rounded-3xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <option value="calm">Calm area</option>
                      <option value="busy">Busy area</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      What location do you have in mind?
                    </label>
                    <input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      placeholder="e.g. city center, beach, quiet neighborhood"
                      className="w-full rounded-3xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      What matters most?
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) =>
                        setForm({ ...form, priority: e.target.value })
                      }
                      className="w-full rounded-3xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <option value="City living">City living</option>
                      <option value="Beachfront">Beachfront</option>
                      <option value="Family">Family friendly</option>
                      <option value="Luxury">Luxury experience</option>
                      <option value="Investment">Investment potential</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      How many bedrooms do you prefer?
                    </label>
                    <select
                      value={form.bedrooms}
                      onChange={(e) =>
                        setForm({ ...form, bedrooms: e.target.value })
                      }
                      className="w-full rounded-3xl border border-slate-200 bg-white p-3 text-sm shadow-sm"
                    >
                      <option value="">No preference</option>
                      <option value="1">1 bedroom</option>
                      <option value="2">2 bedrooms</option>
                      <option value="3">3 bedrooms</option>
                      <option value="4">4+ bedrooms</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-3xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition"
                  >
                    Get recommendation
                  </button>
                </form>
              </div>

              <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">
                    Your current preferences
                  </h3>
                  <p className="text-slate-300 mt-2">
                    Country:{" "}
                    {activeCountryId
                      ? countries.find(
                          (item) => String(item.id) === activeCountryId,
                        )?.name
                      : "Any"}
                  </p>
                  <p className="text-slate-300 mt-1">
                    Location: {form.location || "Any"}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-3xl bg-slate-900 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      Budget range
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">
                      {form.budgetRange}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-900 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      Area type
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">
                      {form.areaType}
                    </p>
                  </div>
                  <div className="rounded-3xl bg-slate-900 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                      Preference
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-100">
                      {form.priority}
                    </p>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl bg-white p-5 text-slate-900 shadow-lg">
                  <p className="text-sm uppercase tracking-[0.2em] text-orange-500">
                    Recommendation
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    {recommendationText}
                  </p>
                  {recommendation && (
                    <div className="mt-5 rounded-3xl bg-orange-50 p-4 text-slate-900">
                      <p className="text-sm uppercase tracking-[0.2em] text-orange-500">
                        Best building
                      </p>
                      <h4 className="mt-2 text-xl font-bold">
                        {recommendation.building.name}
                      </h4>
                      <p className="mt-2 text-sm text-slate-700">
                        Project: {recommendation.project.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Price: ${recommendation.house.price.toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        Bedrooms: {recommendation.house.nb_bedrooms ?? "N/A"}
                      </p>
                      <Link
                        to={`/projects/${recommendation.project.id}`}
                        onClick={closeSurvey}
                        className="inline-flex mt-4 items-center rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition"
                      >
                        View project details
                      </Link>
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
