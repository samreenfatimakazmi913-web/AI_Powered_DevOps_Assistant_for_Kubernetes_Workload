import React from "react";
export default function Nodes(){
  return (
    <div className="card p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-3">Nodes</h2>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {name:"node-1", cpu:"34%", mem:"61%", status:"Ready"},
          {name:"node-2", cpu:"44%", mem:"72%", status:"Ready"},
          {name:"node-3", cpu:"13%", mem:"25%", status:"NotReady"}
        ].map((n,i)=>(
          <div key={i} className="p-4 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{n.name}</div>
                <div className="text-sm text-muted">CPU: {n.cpu} • Mem: {n.mem}</div>
              </div>
              <div className={`text-sm ${n.status==="Ready"?"text-[#10B981]":"text-[#EF4444]"}`}>{n.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
