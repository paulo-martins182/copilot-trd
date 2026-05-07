import { Card } from "./card";

interface StatProps {
  label: string;
  value: string;
  hint?: string;
}

export function Stat({ label, value, hint }: StatProps) {
  return (
    <Card className="p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      {hint ? <div className="mt-1 text-xs text-muted">{hint}</div> : null}
    </Card>
  );
}
