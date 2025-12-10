import React from "react";
export default function Pods(){
  return (
    <div className="card p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-3">Pods</h2>
      <p className="text-sm text-muted">Live list of pods (mock)</p>

      <div className="mt-4">
        <table className="w-full text-left">
          <thead className="text-sm text-muted border-b"><tr><th className="py-3">Pod</th><th>Node</th><th>CPU</th><th>Memory</th><th>Status</th></tr></thead>
          <tbody>
            {[
              {p:"auth-6d89c", n:"node-1", c:"120m", m:"128Mi", s:"Running"},
              {p:"frontend-abc", n:"node-2", c:"300m", m:"256Mi", s:"CrashLoopBackOff"},
              {p:"worker-xyz", n:"node-3", c:"80m", m:"64Mi", s:"Running"}
            ].map((r,i)=>(
              <tr key={i} className="border-b">
                <td className="py-3">{r.p}</td><td className="py-3 text-muted">{r.n}</td><td className="py-3">{r.c}</td><td className="py-3">{r.m}</td>
                <td className="py-3"><span className={`px-3 py-1 rounded-lg text-sm ${r.s==="Running"?"bg-[rgba(16,185,129,0.12)] text-[#10B981]":"bg-[rgba(239,68,68,0.12)] text-[#EF4444]"}`}>{r.s}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
