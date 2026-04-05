import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabaseClient";

type Project = {
  id: number;
  name: string;
  description: string;
  location: string;
  countries: { name: string } | null;
};

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabaseClient
        .from("projects")
        .select("*, countries(name)")
        .limit(3);
      if (data) setFeaturedProjects(data);
    }
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-gray-900 via-gray-800 to-orange-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,92,0,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-44">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Building the
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-orange-600">
              Future
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-10">
            Premium real estate developments across Egypt, UAE, and the United
            Kingdom. Discover your next home with TAB Developments.
          </p>
          <div className="flex gap-4">
            <Link
              to="/projects"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg shadow-orange-500/30"
            >
              View Projects
            </Link>
            <Link
              to="/about"
              className="border border-white/30 hover:border-white text-white px-8 py-3 rounded-full font-semibold transition"
            >
              Explore Globe
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "8+", label: "Projects" },
            { num: "3", label: "Countries" },
            { num: "12+", label: "Buildings" },
            { num: "22+", label: "Units" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-4xl font-extrabold text-orange-500">
                {stat.num}
              </p>
              <p className="text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Featured Projects
          </h2>
          <p className="text-gray-500 text-center mb-12">
            A selection of our finest developments
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProjects.map((project: any) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-48 bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-6xl font-bold opacity-20">
                    {project.name[0]}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition">
                    {project.name}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>📍 {project.location}</span>
                    <span>{project.countries?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/projects"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold transition"
            >
              View All Projects →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-linear-to-r from-orange-500 to-orange-600 py-20 px-6 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Find Your Dream Home?
        </h2>
        <p className="text-orange-100 mb-8 max-w-lg mx-auto">
          Explore our global portfolio and discover the perfect property for you.
        </p>
        <Link
          to="/about"
          className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 rounded-full font-semibold transition shadow-lg"
        >
          Explore the Globe
        </Link>
      </section>
    </div>
  );
}
