import { Bounds, Center, useGLTF } from "@react-three/drei";

function resolveAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedPath = path.replace(/^\/+/, "");
  return `${base}${normalizedPath}`;
}

type ModelProps = {
  modelPath: string;
};

export default function Model({ modelPath }: ModelProps) {
  const { scene } = useGLTF(resolveAssetUrl(modelPath));
  return (
    <Bounds fit clip observe margin={1.15}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  );
}
