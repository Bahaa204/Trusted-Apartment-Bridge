import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import Globe from "react-globe.gl";
import { motion, AnimatePresence } from "framer-motion";
import { supabaseClient } from "../lib/supabaseClient";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import type { FAQItem, SummaryLabel } from "@/types/types";

const countryInfo: Record<
  string,
  { flagCode: string; lat: number; lng: number }
> = {
  "United Arab Emirates": { flagCode: "ae", lat: 24.4539, lng: 54.3773 },
  Egypt: { flagCode: "eg", lat: 26.8206, lng: 30.8025 },
  "United Kingdom": { flagCode: "gb", lat: 55.3781, lng: -3.436 },
  "Saudi Arabia": { flagCode: "sa", lat: 23.8859, lng: 45.0792 },
  Turkey: { flagCode: "tr", lat: 38.9637, lng: 35.2433 },
  Oman: { flagCode: "om", lat: 21.4735, lng: 55.9754 },
  Bahrain: { flagCode: "bh", lat: 26.0667, lng: 50.5577 },
  Qatar: { flagCode: "qa", lat: 25.3548, lng: 51.1839 },
  Kuwait: { flagCode: "kw", lat: 29.3117, lng: 47.4818 },
  Iraq: { flagCode: "iq", lat: 33.2232, lng: 43.6793 },
  Jordan: { flagCode: "jo", lat: 30.5852, lng: 36.2384 },
  Lebanon: { flagCode: "lb", lat: 33.8547, lng: 35.8623 },
  Morocco: { flagCode: "ma", lat: 31.7917, lng: -7.0926 },
};

function getFlagUrl(code: string) {
  return `https://flagcdn.com/w80/${code}.png`;
}

type Project = {
  id: number;
  name: string;
  description: string;
  location: string;
  countries: { name: string } | null;
};

type DBCountry = { id: number; name: string };
type CountryDisplay = DBCountry & {
  flagCode: string;
  lat: number;
  lng: number;
};

const faqItems: FAQItem[] = [
  {
    question: "What types of properties does TAB Developments offer?",
    answer:
      "TAB Developments offers apartments, villas, townhouses, and selected commercial opportunities across key locations in Egypt, the UAE, and the UK. Availability varies by project phase and location.",
  },
  {
    question: "How can I reserve a unit?",
    answer:
      "You can reserve a unit by selecting your preferred project, contacting our sales team, and completing the reservation form with the required documents and initial payment.",
  },
  {
    question: "Do you provide installment payment plans?",
    answer:
      "Yes. Flexible installment plans are available on many projects. Plan duration, down payment, and milestone structure depend on the specific development and current offer.",
  },
  {
    question: "Are your projects suitable for investment?",
    answer:
      "Many of our projects are designed with long-term value in mind, including strong locations, quality construction, and rental demand factors that support investment objectives.",
  },
  {
    question: "Can international buyers purchase properties?",
    answer:
      "Yes, international buyers can purchase in many of our developments, subject to local regulations and verification requirements in each country.",
  },
  {
    question: "What documents are required to purchase a property?",
    answer:
      "Typically, you will need a valid identification document, proof of address, and signed reservation or contract forms. Exact requirements may vary by country and project.",
  },
  {
    question: "How do I schedule a site visit or virtual tour?",
    answer:
      "You can schedule a site visit or virtual tour directly through our project pages or by contacting our support team. We will coordinate a suitable time with an advisor.",
  },
  {
    question: "Do you support after-sales services?",
    answer:
      "Yes. We provide structured after-sales support, including handover guidance, documentation coordination, and dedicated assistance for post-purchase inquiries.",
  },
  {
    question: "How is project handover timing communicated?",
    answer:
      "Handover timelines are shared in project updates and contract documents. We also provide progress communication through official channels during construction phases.",
  },
  {
    question: "Who can I contact for financing guidance?",
    answer:
      "Our sales advisors can guide you through available financing options and connect you with partner institutions where applicable, based on your chosen project and eligibility.",
  },
];

export default function About() {
  useDocumentTitle("About Us");

  const globeRef = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const globeRef2 = useRef<HTMLDivElement>(null);

  const [countries, setCountries] = useState<CountryDisplay[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<CountryDisplay | null>(
    null,
  );
  const [showAbout, setShowAbout] = useState(true);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (location.hash === "#globe" && globeRef2.current) {
      setTimeout(() => {
        globeRef2.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);

  useEffect(() => {
    async function fetchCountries() {
      const { data } = await supabaseClient.from("countries").select("*");
      if (!data) return;
      const mapped: CountryDisplay[] = data
        .filter((c: DBCountry) => countryInfo[c.name])
        .map((c: DBCountry) => ({ ...c, ...countryInfo[c.name] }));
      setCountries(mapped);
      if (mapped.length > 0) setSelectedCountry(mapped[0]);
    }
    fetchCountries();
  }, []);

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

  useEffect(() => {
    if (!globeRef.current || !selectedCountry) return;
    globeRef.current.pointOfView(
      { lat: selectedCountry.lat, lng: selectedCountry.lng, altitude: 1.8 },
      1200,
    );
  }, [selectedCountry]);

  function handleExplore() {
    if (!selectedCountry) return;
    navigate(`/projects?country=${selectedCountry.id}`);
  }

  const SummaryLabels: SummaryLabel[] = [
    { num: "8+", label: "Projects" },
    { num: "3+", label: "Countries" },
    { num: "12+", label: "Buildings" },
    { num: "22+", label: "Units" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white">
        <motion.div
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/about/about-us.png')" }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div className="p-5">
          <Breadcrumbs />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Building the
            <br />
            <span className="text-orange-400">Future</span>
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
            <button
              onClick={() =>
                globeRef2.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="border border-white/30 hover:border-white text-white px-8 py-3 rounded-full font-semibold transition"
            >
              Explore Globe
            </button>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {SummaryLabels.map((stat) => (
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
      <section className="py-20 px-6">
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
                className="group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
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
      {/* FAQ */}
      <section className="py-20 px-6 bg-[#e6e0d8]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Most Asked Questions
            </h2>
            <p className="mt-3 text-slate-500 max-w-2xl mx-auto">
              Find quick, clear answers about buying, payments, investment,
              handover, and support.
            </p>
            <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-orange-500/70" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {[0, 1].map((columnIndex) => (
              <div key={columnIndex} className="space-y-4 md:space-y-5">
                {faqItems
                  .filter((_, itemIndex) => itemIndex % 2 === columnIndex)
                  .map((item, filteredIndex) => {
                    const index = filteredIndex * 2 + columnIndex;
                    const isOpen = openFaqIndex === index;

                    return (
                      <article
                        key={item.question}
                        className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setOpenFaqIndex((prev) =>
                              prev === index ? null : index,
                            )
                          }
                          className="flex h-24 w-full items-center justify-between gap-6 px-6 py-5 text-left cursor-pointer"
                          aria-expanded={isOpen}
                        >
                          <h3 className="line-clamp-2 text-base md:text-lg font-semibold text-slate-900">
                            {item.question}
                          </h3>
                          <span
                            className={`inline-flex h-8 w-8 shrink-0 flex-none items-center justify-center rounded-full border border-slate-300 text-lg leading-none text-slate-600 transition-transform ${
                              isOpen ? "rotate-45" : "rotate-0"
                            }`}
                          >
                            +
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <div className="px-6 pb-6 border-t border-slate-100">
                                <p className="pt-4 text-sm md:text-base leading-7 text-slate-600">
                                  {item.answer}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Globe Section */}
      <div ref={globeRef2} className="w-full">
        <GlobeHeroSection
          globeRef={globeRef}
          countries={countries}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          showAbout={showAbout}
          setShowAbout={setShowAbout}
          handleExplore={handleExplore}
        />
      </div>
    </>
  );
}

function GlobeHeroSection({
  globeRef,
  countries,
  selectedCountry,
  setSelectedCountry,
  showAbout,
  setShowAbout,
  handleExplore,
}: {
  globeRef: any;
  countries: CountryDisplay[];
  selectedCountry: CountryDisplay | null;
  setSelectedCountry: (country: CountryDisplay) => void;
  showAbout: boolean;
  setShowAbout: (show: boolean) => void;
  handleExplore: () => void;
}) {
  const flagElement = useCallback((d: any) => {
    const el = document.createElement("div");
    el.style.width = "36px";
    el.style.height = "26px";
    el.style.borderRadius = "4px";
    el.style.overflow = "hidden";
    el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";
    el.style.border = "2px solid white";
    el.style.cursor = "pointer";
    const img = document.createElement("img");
    img.src = getFlagUrl(d.flagCode);
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    el.appendChild(img);
    return el;
  }, []);

  if (!selectedCountry) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Globe - always rendered */}
      <div
        style={{
          filter: showAbout ? "blur(3px)" : "none",
          transition: "filter 0.5s",
        }}
      >
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          width={window.innerWidth}
          height={window.innerHeight}
          backgroundColor="rgba(0,0,0,1)"
          animateIn={true}
          htmlElementsData={countries}
          htmlLat="lat"
          htmlLng="lng"
          htmlAltitude={0.05}
          htmlElement={flagElement}
        />
      </div>

      {/* About overlay */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setShowAbout(false)}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                borderRadius: "32px",
                padding: "48px",
                color: "white",
                maxWidth: "600px",
                width: "90%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: 800,
                  marginBottom: "8px",
                }}
              >
                About <span style={{ color: "#ff5c00" }}>TAB</span> Developments
              </h1>
              <div
                style={{
                  width: "60px",
                  height: "4px",
                  backgroundColor: "#ff5c00",
                  borderRadius: "2px",
                  marginBottom: "24px",
                }}
              />
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#c0c0c0",
                  marginBottom: "16px",
                }}
              >
                TAB Developments is a leading real estate company specializing
                in premium residential and commercial projects across the Middle
                East and Europe. With developments spanning Egypt, the United
                Arab Emirates, and the United Kingdom, we bring world-class
                living experiences to some of the most professional locations on
                the globe.
              </p>
              <p
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "#c0c0c0",
                  marginBottom: "24px",
                }}
              >
                Our mission is to create innovative, sustainable communities
                that redefine modern living. From luxurious waterfront villas to
                iconic high-rise towers, every TAB project is crafted with
                attention to detail, quality materials, and a vision for the
                future.
              </p>
              <button
                onClick={() => setShowAbout(false)}
                style={{
                  backgroundColor: "#ff5c00",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 32px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Explore the Globe
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Country flag buttons - hidden when about overlay is showing */}
      {!showAbout && (
        <>
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "20px",
              zIndex: 10,
            }}
          >
            {countries.map((country) => (
              <button
                key={country.id}
                onClick={() => setSelectedCountry(country)}
                style={{
                  width: "65px",
                  height: "65px",
                  borderRadius: "50%",
                  border:
                    selectedCountry.id === country.id
                      ? "3px solid white"
                      : "2px solid rgba(255,255,255,0.3)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  cursor: "pointer",
                  transition: "0.3s",
                  backdropFilter: "blur(10px)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                <img
                  src={getFlagUrl(country.flagCode)}
                  alt={country.name}
                  style={{
                    width: "40px",
                    height: "30px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Info card */}
          <div
            style={{
              position: "absolute",
              bottom: "120px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 10,
              width: "340px",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCountry.id}
                initial={{ opacity: 0, y: 40, rotateX: 90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -40, rotateX: -90 }}
                transition={{ duration: 0.6 }}
                style={{
                  background: "rgba(8, 12, 24, 0.92)",
                  borderRadius: "24px",
                  padding: "24px",
                  color: "white",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <img
                    src={getFlagUrl(selectedCountry.flagCode)}
                    alt={selectedCountry.name}
                    style={{
                      width: "48px",
                      height: "36px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                  <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>
                    {selectedCountry.name}
                  </h2>
                </div>
                <button
                  onClick={handleExplore}
                  style={{
                    width: "100%",
                    marginTop: "16px",
                    backgroundColor: "#ff5c00",
                    border: "none",
                    borderRadius: "14px",
                    padding: "14px",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Explore Projects
                </button>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Button to re-show about text */}
          <button
            onClick={() => setShowAbout(true)}
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 10,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "12px",
              padding: "10px 20px",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              backdropFilter: "blur(10px)",
            }}
          >
            About Us
          </button>
        </>
      )}
    </div>
  );
}
