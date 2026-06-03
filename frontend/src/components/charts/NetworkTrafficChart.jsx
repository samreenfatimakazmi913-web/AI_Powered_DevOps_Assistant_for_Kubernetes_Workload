import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Wifi } from "lucide-react";

const RX_COLOR = "#6B8E23"; // Green
const TX_COLOR = "#FFDB58"; // Gold
const COLORS = [RX_COLOR, TX_COLOR];

function bytesToHuman(bytesPerSec) {
  if (bytesPerSec === 0) return "0 B/s";
  const units = ["B/s", "KB/s", "MB/s", "GB/s"];
  let val = bytesPerSec;
  let unitIndex = 0;
  while (val >= 1024 && unitIndex < units.length - 1) {
    val /= 1024;
    unitIndex++;
  }
  return `${val.toFixed(1)} ${units[unitIndex]}`;
}

function getNetworkHealth(totalTraffic) {
  const mbps = totalTraffic / (1024 * 1024);
  if (mbps < 1) return { label: "Low", color: "bg-emerald-100 text-emerald-700 border-emerald-300" };
  if (mbps < 10) return { label: "Normal", color: "bg-blue-100 text-blue-700 border-blue-300" };
  if (mbps < 50) return { label: "High", color: "bg-amber-100 text-amber-700 border-amber-300" };
  return { label: "Very High", color: "bg-red-100 text-red-700 border-red-300" };
}

export default function NetworkTrafficChart({ lineData = [], deployments = [] }) {
  // Line data for trends (from history)
  const trendData = lineData.length > 0 ? lineData : [
    { time: "00:00", rx: 12000, tx: 8000 },
    { time: "00:05", rx: 15000, tx: 9500 },
    { time: "00:10", rx: 14000, tx: 11000 },
    { time: "00:15", rx: 16000, tx: 9000 },
    { time: "00:20", rx: 13000, tx: 8500 },
    { time: "00:25", rx: 17000, tx: 9500 },
  ];

  // Current deployments for top list (latest data)
  const networkData = deployments.length > 0 ? deployments : [
    { deployment: "api-server", rx_bytes: 12500, tx_bytes: 8500 },
    { deployment: "worker", rx_bytes: 8000, tx_bytes: 12000 },
    { deployment: "System", rx_bytes: 3000, tx_bytes: 2000 },
  ];

  const totalTraffic = networkData.reduce((sum, d) => sum + d.rx_bytes + d.tx_bytes, 0);
  const health = getNetworkHealth(totalTraffic);

  return (
    <div className="rounded-2xl border p-5 bg-white dark:bg-[#0f172a] shadow-sm hover:shadow-md transition h-[260px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        
        <span className={`text-xs px-3 py-1 rounded-full border font-medium ${health.color}`}>
          {health.label}
        </span>
      </div>

      {/* Full Height Line Chart - RX/TX Trends */}
      <ResponsiveContainer height="75%">
        <LineChart data={trendData}>
          <defs>
            <linearGradient id="rxGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={RX_COLOR} stopOpacity={0.8} />
              <stop offset="100%" stopColor={RX_COLOR} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TX_COLOR} stopOpacity={0.8} />
              <stop offset="100%" stopColor={TX_COLOR} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={bytesToHuman} tick={{ fontSize: 11 }} width={60} />
          <Tooltip 
            labelFormatter={() => "Network Traffic"}
            formatter={(value, name) => [bytesToHuman(value), name === "rx" ? "RX (Received)" : "TX (Sent)"]}
          />
          <Line 
            type="monotone" 
            dataKey="rx" 
            stroke={RX_COLOR} 
            strokeWidth={3}
            name="RX"
            dot={{ fill: RX_COLOR, strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="tx" 
            stroke={TX_COLOR} 
            strokeWidth={3}
            name="TX"
            dot={{ fill: TX_COLOR, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Top Deployments & Total */}
      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
        <div className="flex justify-between text-sm font-medium text-slate-700">
          <span>Total Traffic</span>
          <span className="font-mono">{bytesToHuman(totalTraffic)}</span>
        </div>
        <div className="text-xs text-slate-500 mb-1">Top Deployments (last scan):</div>
        <div className="space-y-0.5 max-h-16 overflow-y-auto text-xs">
          {networkData.slice(0, 4).map((d, i) => (
            <div key={i} className="flex justify-between">
              <span className="truncate font-mono">{d.deployment}</span>
              <span>{bytesToHuman(d.rx_bytes + d.tx_bytes)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
