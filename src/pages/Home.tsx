import { Link } from "react-router-dom";
import heroImage from "/images/home/hero-home.jpg";
import agencyGuidanceImage from "/images/home/agency-guidance.jpg";
import agencyPresentationImage from "/images/home/agency-presentation.jpg";
import agencyTrustImage from "/images/home/agency-trust.jpg";
import storyImage from "/images/home/story-home.jpg";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const heroMetrics = [
  { value: "120+", label: "Signature properties" },
  { value: "18", label: "Prime districts" },
  { value: "24/7", label: "Client guidance" },
];

const agencyValues = [
  {
    title: "Private guidance",
    text: "We work closely with each client to understand the lifestyle, goals, and details behind every move.",
    detail:
      "Each client gets a more personal path, with advice shaped around timing, priorities, and the kind of home or opportunity they want.",
    image: agencyGuidanceImage,
  },
  {
    title: "Curated presentation",
    text: "From the first impression to the final decision, every property is presented with clarity and elegance.",
    detail:
      "We focus on stronger positioning, cleaner presentation, and a more elevated first impression for every home and development.",
    image: agencyPresentationImage,
  },
  {
    title: "Long-term trust",
    text: "Our agency is built on relationships, not just transactions, with service that stays strong after the deal.",
    detail:
      "Support does not stop at the agreement. We want clients to feel confident returning to us for future moves and recommendations.",
    image: agencyTrustImage,
  },
];

const agencyStory = [
  {
    title: "Thoughtful service",
    text: "Every search starts with listening carefully and shaping the experience around the client's real priorities.",
  },
  {
    title: "Local knowledge",
    text: "We understand neighborhoods, demand, and presentation, which helps us advise with more confidence.",
  },
  {
    title: "Refined experience",
    text: "From first visit to final step, we aim to make the journey feel calm, premium, and easy to trust.",
  },
];

export default function Home() {

  useDocumentTitle("Home")

  return (
    <div className="home-page">
      <section className="home-hero-shell">
        <div className="home-hero-inner">
          <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
            <div className="home-hero-panel animate-fade-up py-8!">
              <div>
                <p className="home-eyebrow animate-fade-up-delay-1 text-[#ffd8bb]">
                  TAB Developments
                </p>
                <h1 className="animate-fade-up-delay-1 mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                  A more refined way to present exceptional real estate
                </h1>
                <p className="animate-fade-up-delay-2 mt-4 max-w-lg text-sm leading-7 text-[#d8e3f0] sm:text-base">
                  TAB Developments is a real estate agency focused on presenting
                  homes and projects with clarity, care, and a more personal
                  approach from the very first conversation.
                </p>

                <div className="animate-fade-up-delay-3 mt-6 flex flex-wrap gap-3">
                  <Link className="home-button-primary" to="/projects">
                    View properties
                  </Link>
                  <Link className="home-button-secondary" to="/contact">
                    Contact us
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="hero-metric hover-lift">
                    <p className="text-2xl font-semibold text-white">
                      {metric.value}
                    </p>
                    <p className="hero-metric-label mt-2 text-sm">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-hero-image image-zoom min-h-105!">
              <img
                alt="Luxury home exterior"
                className="h-full min-h-105 w-full object-cover"
                src={heroImage}
              />
              <div className="home-hero-overlay animate-fade-up-delay-2 py-6!">
                <p className="text-sm uppercase tracking-[0.3em] text-[#ffd8bb]">
                  Featured destination
                </p>
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                  Coastal homes, city residences, and landmark addresses
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d8e3f0]">
                  Present your most desirable listings with stronger imagery,
                  more breathing room, and a premium editorial feel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="home-content">
        <section className="home-section-divider grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div>
            <p className="home-eyebrow">About our agency</p>
            <h2 className="home-title mt-4 text-4xl font-semibold">
              A more personal real estate experience
            </h2>
            <p className="home-copy mt-4 text-sm leading-7">
              We believe real estate should feel more personal, with thoughtful
              guidance, refined presentation, and a level of service clients can
              trust from start to finish.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {agencyValues.map((item) => (
              <article
                key={item.title}
                className="listing-card listing-card-flip animate-fade-up"
              >
                <div className="listing-card-inner">
                  <div className="listing-card-face listing-card-front">
                    <img
                      alt={item.title}
                      className="h-72 w-full object-cover"
                      src={item.image}
                    />
                    <div className="listing-band">
                      <p className="listing-location">TAB Developments</p>
                    </div>
                    <div className="listing-content">
                      <h3 className="home-title text-2xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="home-copy mt-4 text-sm leading-7">
                        {item.text}
                      </p>
                    </div>
                  </div>

                  <div className="listing-card-face listing-card-back">
                    <p className="text-sm uppercase tracking-[0.28em] text-[#ffd8bb]">
                      More info
                    </p>
                    <h3 className="mt-5 text-3xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-5 text-sm leading-8 text-[#d8e3f0]">
                      {item.detail}
                    </p>
                    <div className="mt-8 border-t border-white/15 pt-5">
                      <p className="text-sm uppercase tracking-[0.24em] text-[#ffd8bb]">
                        TAB Developments
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section-divider py-0">
          <div className="relative overflow-hidden bg-[#10243e] text-white">
            <div className="mx-auto grid max-w-360 gap-6 px-6 py-5 lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] lg:px-10">
              <div className="animate-fade-up">
                <img
                  alt="Elegant home exterior"
                  className="h-47.5 w-full object-cover shadow-[0_16px_30px_rgba(0,0,0,0.16)] sm:h-55"
                  src={storyImage}
                />
                <div className="mt-3 max-w-md">
                  <div className="h-px w-28 bg-[#bf530a]" />
                  <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#ffd8bb]">
                    Agency perspective
                  </p>
                  <div className="mt-3 space-y-2">
                    {agencyStory.map((item) => (
                      <div key={item.title}>
                        <p className="text-base leading-tight text-white">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-5 text-[#d8e3f0]">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="animate-fade-up-delay-1 flex flex-col justify-center py-2 lg:px-6">
                <p className="text-xs uppercase tracking-[0.35em] text-[#ffd8bb]">
                  Our story
                </p>
                <h2 className="mt-3 max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">
                  Built around presentation, trust, and the feeling of home
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#d8e3f0]">
                  TAB Developments is presented as an agency that values elegant
                  presentation and genuine guidance, creating confidence around
                  every opportunity and every step.
                </p>
                <div className="mt-5">
                  <Link
                    className="border border-[#bf530a] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#bf530a] sm:text-sm"
                    to="/about"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-section grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="home-surface animate-fade-up p-8">
            <p className="home-eyebrow">Why clients stay</p>
            <h2 className="home-title mt-4 text-4xl font-semibold">
              More than listings, a trusted real estate partner
            </h2>
            <p className="home-copy mt-5 max-w-3xl text-base leading-8">
              We focus on building long-term relationships through honest
              guidance, thoughtful presentation, and a smoother experience for
              every client looking to buy, sell, or invest.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="home-button-primary" to="/contact">
                Speak with our team
              </Link>
              <Link className="home-button-outline" to="/projects">
                Browse all projects
              </Link>
            </div>
          </div>

          <div className="brand-card animate-soft-glow animate-fade-up px-8 py-8">
            <p className="text-sm uppercase tracking-[0.35em] text-[#ffd8bb]">
              Client promise
            </p>
            <h3 className="mt-4 text-3xl font-semibold">
              Every detail should feel considered
            </h3>
            <p className="mt-5 text-sm leading-8 text-[#d8e3f0]">
              We present homes, investments, and opportunities with a tone that
              feels polished, personal, and professional from beginning to end.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
