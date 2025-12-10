import React from "react";
export default function Workloads(){
  return (
    <div className="card p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-3">Workloads</h2>
      <p className="text-sm text-muted">List of Deployments, StatefulSets, DaemonSets (mocked)</p>
      <div className="mt-4">
        <table className="w-full text-left">
          <thead className="text-sm text-muted border-b"><tr><th className="py-3">Name</th><th>Type</th><th>Replicas</th><th>Age</th></tr></thead>
          <tbody>
            {[
              {name:"auth", type:"Deployment", r:"3", age:"12d"},
              {name:"redis", type:"StatefulSet", r:"1", age:"30d"},
              {name:"node-exporter", type:"DaemonSet", r:"6", age:"90d"}
            ].map((w,i)=>(
              <tr key={i} className="border-b">
                <td className="py-3">{w.name}</td>
                <td className="py-3 text-muted">{w.type}</td>
                <td className="py-3">{w.r}</td>
                <td className="py-3 text-muted">{w.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
