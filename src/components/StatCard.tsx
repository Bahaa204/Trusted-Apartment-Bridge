import { useCountAnimation } from "@/hooks/useCountAnimation";

type StatCardProps = {
  value: number;
  label: string;
};

export default function StatCard({ value, label }: StatCardProps) {
  const { displayValue, elementRef } = useCountAnimation(value, 1000);

  return (
    <div ref={elementRef}>
      <p className="text-4xl font-extrabold text-orange-500">{displayValue}+</p>
      <p className="text-gray-500 mt-1">{label}</p>
    </div>
  );
}
