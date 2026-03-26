import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getRiskColorHex } from "@/lib/utils";

export function RiskGauge({ score }: { score: number }) {
  const data = [
    { name: "Score", value: score },
    { name: "Remaining", value: 100 - score },
  ];

  const color = getRiskColorHex(score);

  return (
    <div className="relative w-full h-48 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="cell-0" fill={color} style={{ filter: `drop-shadow(0 0 8px ${color}80)` }} />
            <Cell key="cell-1" fill="rgba(255,255,255,0.05)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-0 text-center flex flex-col items-center">
        <span className="text-4xl font-mono font-bold tracking-tighter" style={{ color }}>
          {score.toFixed(1)}%
        </span>
        <span className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Risk Index</span>
      </div>
    </div>
  );
}
