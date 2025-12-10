import React, { useEffect, useState } from "react";

const mockPods = [
  { name: "auth-6d89c", status: "Running", cpu: "120m", mem: "128Mi", node: "node-1" },
  { name: "frontend-abcd", status: "CrashLoopBackOff", cpu: "300m", mem: "256Mi", node: "node-2" },
  { name: "worker-xyz", status: "Running", cpu: "80m", mem: "64Mi", node: "node-3" },
];

export default function PodTable() {
  const [pods, setPods] = useState([]);

  useEffect(() => {
    setTimeout(() => setPods(mockPods), 400);
  }, []);

  return (
    <table className="w-full text-sm">
      <thead className="text-slate-500 border-b">
        <tr>
          <th className="py-2">Name</th>
          <th>Status</th>
          <th>CPU</th>
          <th>Memory</th>
          <th>Node</th>
        </tr>
      </thead>
      <tbody>
        {pods.map((p) => (
          <tr className="border-b" key={p.name}>
            <td className="py-2">{p.name}</td>
            <td className={`py-2 ${p.status === "Running" ? "text-green-500" : "text-amber-500"}`}>
              {p.status}
            </td>
            <td>{p.cpu}</td>
            <td>{p.mem}</td>
            <td>{p.node}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
