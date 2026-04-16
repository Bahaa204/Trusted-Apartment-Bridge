import { Link } from "react-router-dom";

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
  },
  {
    title: "Curated presentation",
    text: "From the first impression to the final decision, every property is presented with clarity and elegance.",
    detail:
      "We focus on stronger positioning, cleaner presentation, and a more elevated first impression for every home and development.",
  },
  {
    title: "Long-term trust",
    text: "Our agency is built on relationships, not just transactions, with service that stays strong after the deal.",
    detail:
      "Support does not stop at the agreement. We want clients to feel confident returning to us for future moves and recommendations.",
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
  return (
    <div className="home-page">
      <section className="home-hero-shell">
        <div className="home-hero-inner">
          <div className="grid lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.05fr)]">
            <div className="home-hero-panel animate-fade-up !py-8">
              <div>
                <p className="home-eyebrow animate-fade-up-delay-1 text-[#ffd8bb]">
                  TAB Developments
                </p>
                <h1 className="animate-fade-up-delay-1 mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                  A more refined way to present exceptional real estate
                </h1>
                <p className="animate-fade-up-delay-2 mt-4 max-w-lg text-sm leading-7 text-[#d8e3f0] sm:text-base">
                  Inspired by premium brokerage websites, this homepage puts
                  the focus on elegant presentation, featured listings, and a
                  stronger sense of trust from the first scroll.
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
                    <p className="hero-metric-label mt-2 text-sm">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-hero-image image-zoom !min-h-[420px]">
              <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[linear-gradient(135deg,_#dfe7f1,_#f8fafc_45%,_#fff0e2)]">
                <div className="border border-dashed border-[#bf530a] px-6 py-4 text-center text-sm font-medium tracking-[0.2em] text-[#a94708] uppercase">
                  Hero Image Placeholder
                </div>
              </div>
              <div className="home-hero-overlay animate-fade-up-delay-2 !py-6">
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
            <p className="home-eyebrow">
              About our agency
            </p>
            <h2 className="home-title mt-4 text-4xl font-semibold">
              A more personal real estate experience
            </h2>
            <p className="home-copy mt-4 text-sm leading-7">
              Instead of pushing only listings, this section introduces the
              character of your agency and helps visitors understand the kind of
              service and quality they can expect.
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
                    <div className="flex h-72 w-full items-center justify-center bg-[linear-gradient(135deg,_#eef2f7,_#ffffff_45%,_#fff3e8)]">
                      <div className="border border-dashed border-[#bf530a] px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#a94708]">
                        Agency Photo Placeholder
                      </div>
                    </div>
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
            <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-8 lg:grid-cols-[minmax(380px,0.9fr)_minmax(0,1.1fr)] lg:px-10">
              <div className="animate-fade-up">
                <div className="flex min-h-[250px] items-center justify-center bg-[linear-gradient(135deg,_#dfe7f1,_#f8fafc_45%,_#fff0e2)] shadow-[0_20px_40px_rgba(0,0,0,0.16)]">
                  <div className="border border-dashed border-[#bf530a] px-6 py-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-[#a94708]">
                    Section Image Placeholder
                  </div>
                </div>
                <div className="mt-5 max-w-md">
                  <div className="h-px w-28 bg-[#bf530a]" />
                  <p className="mt-5 text-sm uppercase tracking-[0.3em] text-[#ffd8bb]">
                    Agency perspective
                  </p>
                  <div className="mt-4 space-y-3">
                    {agencyStory.map((item) => (
                      <div key={item.title}>
                        <p className="text-lg leading-tight text-white">{item.title}</p>
                        <p className="mt-1 text-sm leading-6 text-[#d8e3f0]">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="animate-fade-up-delay-1 flex flex-col justify-center py-4 lg:px-8">
                <p className="text-sm uppercase tracking-[0.35em] text-[#ffd8bb]">
                  Our story
                </p>
                <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight sm:text-4xl">
                  Built around presentation, trust, and the feeling of home
                </h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-[#d8e3f0]">
                  TAB Developments is presented as an agency that values elegant
                  presentation and genuine guidance, creating confidence around
                  every opportunity and every step.
                </p>
                <div className="mt-7">
                  <Link
                    className="border border-[#bf530a] px-7 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#bf530a]"
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
              More than listings, a stronger agency presence
            </h2>
            <p className="home-copy mt-5 max-w-3xl text-base leading-8">
              A memorable real estate homepage should feel calm, elegant, and
              confident. By adding richer sections like this, your site stops
              looking small or unfinished and starts feeling like a genuine
              agency brand.
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
