// ===============================
// src/pages/AdminDashboard.jsx
// ===============================

import React, { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const API = "http://localhost:5000/api";

export default function AdminDashboard() {
  /* ---------------- STATE ---------------- */
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  const [teamName, setTeamName] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    teamId: "",
  });

  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH TEAMS + USERS ---------------- */
  useEffect(() => {
    Promise.all([
      fetch(`${API}/teams`).then(res => res.json()),
      fetch(`${API}/users`).then(res => res.json()),
    ]).then(([teamsData, usersData]) => {
      setTeams(teamsData);
      setUsers(usersData);
      setLoading(false);
    });
  }, []);

  /* ---------------- CREATE TEAM ---------------- */
  const createTeam = async () => {
    if (!teamName.trim()) return;

    const res = await fetch(`${API}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: teamName }),
    });

    if (!res.ok) {
      alert("Team already exists");
      return;
    }

    const team = await res.json();
    setTeams([team, ...teams]);
    setTeamName("");
  };

  /* ---------------- CREATE USER ---------------- */
  const createUser = async () => {
    const { name, email, password, teamId } = form;

    if (!name || !email || !password) {
      alert("All fields required");
      return;
    }

    const res = await fetch(`${API}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        role: "developer",
        teamId,
      }),
    });

    if (!res.ok) {
      alert("User already exists");
      return;
    }

    const user = await res.json();
    setUsers([user, ...users]);

    setForm({
      name: "",
      email: "",
      password: "",
      teamId: "",
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-4 sm:p-6 space-y-10">
      <h1 className="text-2xl sm:text-3xl font-bold">
        Admin — Team & User Management
      </h1>

      {/* ================= CREATE TEAM ================= */}
      <Card className="p-4 max-w-xl space-y-4">
        <h2 className="font-semibold text-lg">Create Team</h2>

        <div className="flex gap-3">
          <Input
            placeholder="Team name (e.g. Alpha)"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <Button onClick={createTeam}>Create</Button>
        </div>
      </Card>

      {/* ================= CREATE USER ================= */}
      <Card className="p-4 max-w-xl space-y-4">
        <h2 className="font-semibold text-lg">
          Create Developer & Assign Team
        </h2>

        <Input
          placeholder="Developer Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <Input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <Input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          className="w-full border rounded px-3 py-2 dark:bg-gray-900"
          value={form.teamId}
          onChange={(e) =>
            setForm({ ...form, teamId: e.target.value })
          }
        >
          <option value="">Assign Team</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <Button onClick={createUser}>Create Developer</Button>
      </Card>

      {/* ================= USERS LIST ================= */}
      <Card className="p-4 max-w-2xl">
        <h2 className="font-semibold text-lg mb-4">
          Developers
        </h2>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : users.length === 0 ? (
          <p className="text-gray-500">No developers yet</p>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="flex justify-between border rounded px-3 py-2"
              >
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-gray-500">
                    {u.email}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {u.team ? u.team.name : "No Team"}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
