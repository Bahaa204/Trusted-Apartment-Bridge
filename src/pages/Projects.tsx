import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabaseClient } from "../lib/supabaseClient";

type Project = {
  id: number;
  name: string;
  description: string;
  country_id: number;
  location: string;
  images_url: string[];
  countries: { name: string } | null;
};

type Country = {
  id: number;
  name: string;
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

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCountry = searchParams.get("country");

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
        .select("*, countries(name)");

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero banner */}
      <div className="bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Our Projects
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Explore our developments across the globe
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8">
        {/* Country Filter */}
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

        {/* Projects Grid */}
        {loading ? (
          <p className="text-center text-gray-400 py-20">
            Loading projects...
          </p>
        ) : projects.length === 0 ? (
          <p className="text-center text-gray-400 py-20">
            No projects found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {projects.map((project, i) => (
              <Link
                to={`/projects/${project.id}`}
                key={project.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image gallery or gradient fallback */}
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
                    {project.countries && countryFlags[project.countries.name] && (
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
                  <div className="flex items-center text-sm text-gray-400">
                    <span>📍 {project.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
