import { Html, useProgress } from "@react-three/drei";

export function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div
        style={{
          padding: "12px 18px",
          background: "rgba(255,255,255,0.96)",
          border: "1px solid #dbe3ea",
          borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
          fontSize: "14px",
          fontWeight: 600,
          color: "#1e293b",
          whiteSpace: "nowrap",
        }}
      >
        Loading model... {progress.toFixed(0)}%
      </div>
    </Html>
  );
}