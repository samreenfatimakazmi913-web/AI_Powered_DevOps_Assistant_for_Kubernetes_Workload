import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "10:00", cpu: 30 },
  { time: "10:10", cpu: 50 },
  { time: "10:20", cpu: 65 },
  { time: "10:30", cpu: 62 },
  { time: "10:40", cpu: 55 },
];

export default function ChartCPU() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        
        {/* AXES */}
        <XAxis 
          dataKey="time" 
          stroke="var(--color-muted)" 
          tick={{ fill: "var(--color-muted)", fontSize: 12 }} 
        />
        <YAxis 
          stroke="var(--color-muted)" 
          tick={{ fill: "var(--color-muted)", fontSize: 12 }} 
        />

        {/* TOOLTIP */}
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            color: "var(--color-text)",
          }}
          labelStyle={{ color: "var(--color-muted)" }}
        />

        {/* LINE */}
        <Line
          dataKey="cpu"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}