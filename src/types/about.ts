import type { CountryDisplay } from "./country";

export type GlobeHeroSectionProps = {
  globeRef: any;
  countries: CountryDisplay[];
  selectedCountry: CountryDisplay | null;
  setSelectedCountry: (country: CountryDisplay) => void;
  showAbout: boolean;
  setShowAbout: (show: boolean) => void;
  handleExplore: () => void;
};
