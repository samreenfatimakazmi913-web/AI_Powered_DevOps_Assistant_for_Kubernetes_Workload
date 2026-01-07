import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const API = "http://localhost:5000/api";

export default function AdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [activeCard, setActiveCard] = useState(null);

  const [teamForm, setTeamForm] = useState({ name: "", namespace: "" });
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    teamId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/teams`).then(r => r.json()),
      fetch(`${API}/users`).then(r => r.json()),
      fetch(`${API}/namespaces`).then(r => r.json()),
    ]).then(([t, u, n]) => {
      setTeams(t);
      setUsers(u);
      setNamespaces(n);
    });
  }, []);

  /* ---------------- HELPERS ---------------- */
  const developers = users.filter(u => u.role === "developer");
  const getTeamDevelopers = id =>
    developers.filter(d => d.team?._id === id);

  /* ---------------- OUTLINE WRAPPER ---------------- */
  const OutlineWrapper = ({ active, onClick, children }) => (
    <div
      onClick={onClick}
      className={`relative rounded-xl cursor-pointer ${
        active ? "p-[2px]" : ""
      }`}
    >
      {active && (
        <>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 blur-lg opacity-70 animate-[glow-pulse_3s_ease-in-out_infinite]" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 bg-[length:200%_200%] animate-[gradient-border_4s_linear_infinite]" />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );

  /* ---------------- CREATE TEAM ---------------- */
  const createTeam = async () => {
    if (!teamForm.name || !teamForm.namespace) return alert("All fields required");

    const res = await fetch(`${API}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(teamForm),
    });

    if (!res.ok) return alert("Team or namespace already exists");

    setTeams([await res.json(), ...teams]);
    setTeamForm({ name: "", namespace: "" });
  };

  /* ---------------- CREATE USER ---------------- */
  const createUser = async () => {
    const { name, email, password } = userForm;
    if (!name || !email || !password) return alert("All fields required");

    const res = await fetch(`${API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userForm, role: "developer" }),
    });

    if (!res.ok) return alert("User already exists");

    setUsers([await res.json(), ...users]);
    setUserForm({ name: "", email: "", password: "", teamId: "" });
  };

  return (
    <div className="space-y-10">

      {/* ================= STATS ================= */}
      <div className="grid sm:grid-cols-3 gap-6">
        <OutlineWrapper
          active={activeCard === "teams"}
          onClick={() => setActiveCard(activeCard === "teams" ? null : "teams")}
        >
          <Card className="p-5">
            <div className="text-sm text-gray-500">Teams</div>
            <div className="text-3xl font-bold">{teams.length}</div>
          </Card>
        </OutlineWrapper>

        <OutlineWrapper
          active={activeCard === "developers"}
          onClick={() =>
            setActiveCard(activeCard === "developers" ? null : "developers")
          }
        >
          <Card className="p-5">
            <div className="text-sm text-gray-500">Developers</div>
            <div className="text-3xl font-bold">{developers.length}</div>
          </Card>
        </OutlineWrapper>

        <OutlineWrapper
          active={activeCard === "namespaces"}
          onClick={() =>
            setActiveCard(activeCard === "namespaces" ? null : "namespaces")
          }
        >
          <Card className="p-5">
            <div className="text-sm text-gray-500">Namespaces</div>
            <div className="text-3xl font-bold">
              {[...new Set(teams.map(t => t.namespace))].length}
            </div>
          </Card>
        </OutlineWrapper>
      </div>

      {/* ================= OVERVIEWS ================= */}
      {activeCard === "teams" && (
        <Card className="p-6 max-w-4xl animate-[slide-fade_0.35s_ease-out]">
          <h2 className="text-xl font-semibold mb-4">Teams Overview</h2>
          {teams.map(team => (
            <div key={team._id} className="border rounded-lg p-4 mb-3">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{team.name}</div>
                  <div className="text-sm text-gray-500">
                    Namespace: {team.namespace}
                  </div>
                </div>
                <span className="text-sm px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900">
                  {getTeamDevelopers(team._id).length} Developers
                </span>
              </div>
            </div>
          ))}
        </Card>
      )}

      {activeCard === "developers" && (
        <Card className="p-6 max-w-4xl animate-[slide-fade_0.35s_ease-out]">
          <h2 className="text-xl font-semibold mb-4">Developers Overview</h2>
          {developers.length === 0 && (
            <p className="text-gray-500 text-sm">No developers created yet.</p>
          )}
          {developers.map(dev => (
            <div key={dev._id} className="border rounded-lg px-4 py-3 mb-3 flex justify-between">
              <div>
                <div className="font-semibold">{dev.name}</div>
                <div className="text-sm text-gray-500">{dev.email}</div>
              </div>
              <div className="text-sm text-right">
                <div>Team: <b>{dev.team?.name || "Unassigned"}</b></div>
                <div className="text-gray-500">
                  Namespace: {dev.team?.namespace || "-"}
                </div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {activeCard === "namespaces" && (
        <Card className="p-6 max-w-4xl animate-[slide-fade_0.35s_ease-out]">
          <h2 className="text-xl font-semibold mb-4">Namespaces Overview</h2>
          {[...new Set(teams.map(t => t.namespace))].map(ns => {
            const team = teams.find(t => t.namespace === ns);
            return (
              <div key={ns} className="border rounded-lg p-4 mb-3">
                <div className="font-semibold">{ns}</div>
                <div className="text-sm text-gray-500">
                  Team: {team?.name || "Unassigned"}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* ================= CREATE SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Create Team</h2>
          <Input
            placeholder="Team name"
            value={teamForm.name}
            onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
          />
         <select
  className="
    w-full px-3 py-2 rounded-md
    bg-white text-gray-900 border
    dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
  "
  value={teamForm.namespace}
  onChange={e =>
    setTeamForm({ ...teamForm, namespace: e.target.value })
  }
>
  <option value="" disabled hidden>
    Select Namespace
  </option>

  {namespaces.map(ns => (
    <option key={ns} value={ns}>
      {ns}
    </option>
  ))}
</select>

          <Button onClick={createTeam}>Create Team</Button>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">Create Developer</h2>
          <Input placeholder="Name" value={userForm.name}
            onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
          <Input type="email" placeholder="Email" value={userForm.email}
            onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
          <Input type="password" placeholder="Password" autoComplete="new-password" value={userForm.password}
            onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
          <select
  className="
    w-full px-3 py-2 rounded-md
    bg-white text-gray-900 border
    dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700
  "
  value={userForm.teamId}
  onChange={e =>
    setUserForm({ ...userForm, teamId: e.target.value })
  }
>
  <option value="" disabled hidden>
    Assign Team
  </option>

  {teams.map(t => (
    <option key={t._id} value={t._id}>
      {t.name} — {t.namespace}
    </option>
  ))}
</select>

          <Button onClick={createUser}>Create Developer</Button>
        </Card>
      </div>
    </div>
  );
}
