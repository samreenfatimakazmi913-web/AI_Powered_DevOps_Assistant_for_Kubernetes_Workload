import React from "react";
export default function Deployments(){
  return (
    <div className="card p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-3">Deployments</h2>
      <p className="text-sm text-muted">Manage and review deployments</p>
      <div className="mt-4">
        <ul className="space-y-3">
          {[
            {name:"auth", imgs:"auth:1.2.0", rep:"3"},
            {name:"api", imgs:"api:4.5.1", rep:"2"},
            {name:"frontend", imgs:"frontend:2.0.1", rep:"4"}
          ].map((d,i)=>(
            <li key={i} className="p-4 bg-[rgba(255,255,255,0.02)] rounded-lg border border-[rgba(255,255,255,0.03)]">
              <div className="flex justify-between items-center">
                <div><div className="font-medium">{d.name}</div><div className="text-sm text-muted">{d.imgs}</div></div>
                <div className="text-sm text-muted">Replicas: {d.rep}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
