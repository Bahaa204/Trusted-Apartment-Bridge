import { flagElement, getFlagUrl } from "@/helpers/helpers";
import type { GlobeHeroSectionProps } from "@/types/about";
import Globe from "react-globe.gl";
import { motion, AnimatePresence } from "framer-motion";

export function GlobeHeroSection({
  globeRef,
  countries,
  selectedCountry,
  setSelectedCountry,
  showAbout,
  setShowAbout,
  handleExplore,
}: GlobeHeroSectionProps) {
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
