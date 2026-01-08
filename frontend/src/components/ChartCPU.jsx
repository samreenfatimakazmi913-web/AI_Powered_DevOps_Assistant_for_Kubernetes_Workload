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
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line dataKey="cpu" stroke="#0F62FE" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
