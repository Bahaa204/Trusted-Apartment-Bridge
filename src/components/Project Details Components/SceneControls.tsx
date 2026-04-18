import { OrbitControls } from "@react-three/drei";

export default function SceneControls() {
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={2}
      maxDistance={25}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI / 1.8}
    />
  );
}
